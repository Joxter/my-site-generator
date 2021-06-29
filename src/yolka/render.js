export function render(Components, page, data) {
  return renderNotMy(page, { components: Components });
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
 * options:
 * - components
 * - selfClosingTags
 * - emptyAttrs
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

const ElementType = {
  Component: "component",
  Root: "root",
  Directive: "directive",
  Doctype: "doctype",
  Comment: "comment",
  CDATA: "CDATA", // "cdata" ???
  Script: "Script",
  Style: "style",
  Tag: "tag",
  Text: "text",
};

function renderNode(node, options) {
  switch (node.type) {
    case ElementType.Root:
      return renderNotMy(node.children, options);
    case ElementType.Component:
      return renderComponent(node, options);
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
  }
}

function renderComponent(node, options) {
  const componentData = options.components[node.name];
  if (!componentData) {
    return `<div>MISSING COMPONENT "${node.name}"</div>`;
  }
  return renderNotMy(componentData.template.children, options);
}

function renderTag(elem, opts) {
  let tag = "<" + elem.name;
  let attribs = formatAttributes(elem.attribs, opts);
  if (attribs) {
    tag += " " + attribs;
  }
  if (elem.children.length === 0 && opts.selfClosingTags && selfEnclosingTag.has(elem.name)) {
    tag += " />";
  } else {
    tag += ">";
    if (elem.children.length > 0) {
      tag += renderNotMy(elem.children, opts);
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

function renderCdata(elem) {
  return "<![CDATA[" + elem.children[0].data + "]]>";
}

function renderComment(elem) {
  return "<!--" + elem.data + "-->";
}

function formatAttributes(attributes, opts) {
  if (!attributes) return;
  return Object.keys(attributes)
    .map(function(key) {
      let _a;
      // todo упростить условие ниже
      let value = (_a = attributes[key]) !== null && _a !== undefined ? _a : "";
      if (!opts.emptyAttrs && value === "") {
        return key;
      }
      return key + '="' + value.replace(/"/g, "&quot;") + '"';
    })
    .join(" ");
}
