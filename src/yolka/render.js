import { deepFind } from "../utils.js";
import { ElementType, NODE_SPEC_ATTRS } from "./constants.js";

/*
 * todo идеи наброски
 *  - сделать чтоб рендерилось сначала <body>, чтоб знать, какие компоненты и стили использвались на странице
 *  - нужно в парсинг страниц добавить поиск <head> и <body> тегов
 *  - пока рендерим <body> нужно счтиать какие компоненты использовались, чтоб собрать их стили
 *  - результатом рендера страницы должна быть структура, в которую можно за О(1) добавить стили
 *  - не забыть что рендериться могут несколько страниц и общие стили нужно прогруппировать
 */
export function render(Components, pageComp, data) {
  const opts = {
    components: Components,
    data: {
      ...data,
      renderedSlots: {},
    },
    inlineStyles: true,
    pageMeta: {
      usedComponents: new Set(),
    },
  };

  if (pageComp.type === ElementType.Page) {
    return renderPage(pageComp, opts).trim();
  }
  return renderNotMy(pageComp, opts).trim();
}

let selfEnclosingTag = new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * обрезанный код из dom-serializer
 * todo: components в options не смотрится, может убрать в другое место
 *
 * not my options:
 *   - selfClosingTags
 *   - emptyAttrs
 * */
function renderNotMy(node, options = {}) {
  // todo что за node.cheerio ??
  let nodes = Array.isArray(node) || node.cheerio ? node : [node];
  let output = "";
  for (let i = 0; i < nodes.length; i++) {
    output += renderNode(nodes[i], options);
  }
  return output;
}

function renderNode(node, options) {
  // todo выглядит неочень, надо попробовать сделать это как новый тип ноды ElementType.If
  let ifRes = solveIf(node, options);
  if (!ifRes) return "";

  // todo выглядит неочень, надо попробовать сделать это как новый тип ноды ElementType.For
  let forRes = solveFor(node, options, (_node, _opt) => renderNotMy(_node, _opt));
  if (forRes) return forRes;

  switch (node.type) {
    case ElementType.Root:
      return renderNotMy(node.children, options);
    case ElementType.Component:
      return renderComponent(node, options);
    case ElementType.Slot:
      return renderSlot(node, options);
    case ElementType.Directive:
    case ElementType.Doctype:
      return renderDirective(node);
    case ElementType.Comment:
      return renderComment(node);
    case ElementType.CDATA:
      return renderCdata(node);
    case ElementType.Script:
    case ElementType.Style:
    case ElementType.Tag:
      return renderTag(node, options);
    case ElementType.Text:
      return renderText(node);
    case ElementType.TextWithData:
      return renderTextWithData(node, options);
  }
}

function solveIf(node, options) {
  if (node.attribs && NODE_SPEC_ATTRS.IF in node.attribs) {
    // todo обработать всякие y-if='', y-if='0', y-if='1', y-if='true', y-if='false'
    const res = deepFind(options.data, node.attribs[NODE_SPEC_ATTRS.IF]);
    return res;
  }

  return true;
}

function solveFor(node, options, cb) {
  if (node.attribs && NODE_SPEC_ATTRS.FOR in node.attribs) {
    const { itemName, arrayPath } = node.attribs[NODE_SPEC_ATTRS.FOR];
    delete node.attribs[NODE_SPEC_ATTRS.FOR];

    const array = deepFind(options.data, arrayPath);

    if (!Array.isArray(array)) {
      throw new Error(`Can not find array "${arrayPath}" in the data`);
    }

    return array
      .map((item) => {
        return cb(node, {
          ...options,
          data: { ...options.data, [itemName]: item },
        });
      })
      .join("");
  }
}

function renderPage(node, options) {
  if (!options.inlineStyles) throw new Error('Option "inlineStyles" should be true');

  const headChildren = renderNotMy(node.pageNodes.head.children, options);
  const body = renderNotMy(node.pageNodes.body, options);

  const styles = [...options.pageMeta.usedComponents]
    .map((compName) => options.components[compName].style)
    .join("")
    .trim();

  // todo alt option: <link rel="stylesheet" type="text/css" href="URL" />
  return [
    renderDirective(node.pageNodes["!doctype"]),
    "<html>", // todo attributes possible
    "<head>", // todo attributes possible
    headChildren,
    styles.length > 0 ? `<style>${styles}</style>` : "",
    "</head>",
    body,
    "</html>",
  ].join("");
}

function renderSlot(node, options) {
  if (options.data.renderedSlots[node.attribs.name]) {
    return options.data.renderedSlots[node.attribs.name].join("");
  } else {
    return renderNotMy(node.children, options);
  }
}

function renderComponent(node, options) {
  if (!node.name) {
    // todo компонент без тега template, типа страница, адски тупо выглядит, но пока сойдет
    return renderNotMy(node.children, options);
  }
  const componentData = options.components[node.name];
  options.pageMeta.usedComponents.add(node.name);
  if (!componentData) {
    return `<div>MISSING COMPONENT "${node.name}"</div>`;
  }

  const data = {};
  for (let name in node.attribs) {
    if (Array.isArray(node.attribs[name])) {
      data[name] = deepFind(options.data, node.attribs[name]);
    } else {
      data[name] = node.attribs[name];
    }
  }
  if (componentData.slots.length > 0) {
    let renderedSlots = {};

    for (let i = 0; i < node.children.length; i++) {
      let childrenNode = node.children[i];
      if (childrenNode.attribs && childrenNode.attribs[NODE_SPEC_ATTRS.SLOT]) {
        let slotName = childrenNode.attribs[NODE_SPEC_ATTRS.SLOT];
        if (!renderedSlots[slotName]) renderedSlots[slotName] = [];

        let res = renderNotMy(childrenNode, options);
        renderedSlots[slotName].push(res);
      }
    }

    data.renderedSlots = {
      ...data.renderedSlots,
      ...renderedSlots,
    };
  }

  if (componentData.type === ElementType.Page) {
    return renderPage(componentData, { ...options, data });
  }

  return renderNotMy(componentData.children, { ...options, data });
}

function renderTag(elem, options) {
  let tag = "<" + elem.name;
  let attribs = formatAttributes(elem.attribs, options);
  if (attribs) {
    tag += " " + attribs;
  }
  if (elem.children.length === 0 && options.selfClosingTags && selfEnclosingTag.has(elem.name)) {
    tag += " />";
  } else {
    tag += ">";
    if (elem.children.length > 0) {
      tag += renderNotMy(elem.children, options);
    }
    if (!selfEnclosingTag.has(elem.name)) {
      tag += "</" + elem.name + ">";
    }
  }
  return tag;
}

function renderDirective(elem) {
  return "<" + elem.data + ">";
}

function renderText(elem) {
  return elem.data || "";
}

function renderTextWithData(elem, options) {
  return fillInArrayString(elem.data, options.data);
}

function fillInArrayString(arr, data) {
  return arr
    .map((it) => {
      if (Array.isArray(it)) {
        return deepFind(data, it);
      } else {
        return it;
      }
    })
    .join("");
}

function renderCdata(elem) {
  return "<![CDATA[" + elem.children[0].data + "]]>";
}

function renderComment(elem) {
  return "<!--" + elem.data + "-->";
}

function formatAttributes(attributes, opts) {
  if (!attributes) return;
  return Object.keys(attributes)
    .map(function (key) {
      if (key === NODE_SPEC_ATTRS.IF || key === "slot") return "";

      let _a;
      // todo упростить условие ниже
      let value = (_a = attributes[key]) !== null && _a !== undefined ? _a : "";
      if (!opts.emptyAttrs && value === "") {
        return key;
      }
      if (Array.isArray(value)) {
        value = fillInArrayString(value, opts.data);
      }
      return key + '="' + value.replace(/"/g, "&quot;") + '"';
    })
    .join(" ");
}
