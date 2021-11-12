import { parseDocument } from "htmlparser2";
import { removeElement } from "domutils";
import { forEachNodes, getKeysFromStr, has, niceEl, removeFirstLastChar } from "../utils.js";
import { COMPONENT_ATTRS, ElementType, NODE_SPEC_ATTRS } from "./constants.js";

function initComponents(componentsAST) {
  const Components = {};

  componentsAST.forEach((componentAST, i) => {
    const component = getServiceNodes(componentAST);
    component.uid = i;
    Components[component.name] = component;
  });

  return Components;
}

export function parse(componentStrs, pageStrs) {
  const pages = pageStrs.map((page) => {
    return getServiceNodes(parseDocument(page), true);
  });

  const Components = initComponents(
    componentStrs.map((template) => {
      return parseDocument(template);
    })
  );

  return [Components, pages];
}

function getServiceNodes(componentAST, noTemplateTag = false) {
  const templateEl = noTemplateTag ? componentAST : getComponentTemplateTag(componentAST);

  const name = noTemplateTag ? null : templateEl.attribs[COMPONENT_ATTRS.NAME];
  if (!noTemplateTag && !name) {
    // todo может сюда что-то подставлять, типа название файла?
    throw new Error("Component name should have a name");
  }

  let style = null;
  let dependsOn = new Set(); // компоненты которые используются в этом
  // let nodesToData = []; // текстовые ноды, в которые можно вставить какой-то текст "some text {insert}"
  const props = noTemplateTag ? [] : parseProps(templateEl.attribs[COMPONENT_ATTRS.PROPS]);
  const slots = noTemplateTag ? [] : parseProps(templateEl.attribs[COMPONENT_ATTRS.SLOTS]);
  let pageNodes = {};

  forEachNodes(templateEl, (el) => {
    if (["html", "head", "body", "!doctype"].includes(el.name)) {
      pageNodes[el.name] = el;
      return;
    }
    if (el.type === "tag") {
      if (has(el.attribs, NODE_SPEC_ATTRS.IF)) {
        let cond = el.attribs[NODE_SPEC_ATTRS.IF];
        el.attribs[NODE_SPEC_ATTRS.IF] = getKeysFromStr(removeFirstLastChar(cond));
      }
      if (has(el.attribs, NODE_SPEC_ATTRS.ELSE) && el.prev !== null) {
        if (el.prev) {
          let cond = el.prev.attribs[NODE_SPEC_ATTRS.IF];
          el.attribs[NODE_SPEC_ATTRS.ELSE] = cond; // was parsed on prev element
        }
      }

      if (has(el.attribs, NODE_SPEC_ATTRS.FOR)) {
        let forStr = el.attribs[NODE_SPEC_ATTRS.FOR];
        let [itemName, arrayName] = removeFirstLastChar(forStr).split(" in ");
        el.attribs[NODE_SPEC_ATTRS.FOR] = { itemName, arrayPath: getKeysFromStr(arrayName) };
      }

      if (el.name === "slot") {
        el.type = ElementType.Slot; // hack хак парсера, нужен чтоб подружить AST с моей логикой
      }

      if (el.name.includes("-")) {
        el.type = ElementType.Component; // hack хак парсера, нужен чтоб подружить AST с моей логикой

        for (let name in el.attribs) {
          let attrVal = el.attribs[name];
          if (attrVal[0] === "{" && attrVal[attrVal.length - 1] === "}") {
            el.attribs[name] = getKeysFromStr(removeFirstLastChar(attrVal));
          }
        }

        dependsOn.add(el.name);
      } else {
        // атрибуты обычных нод могут быть сложнее и обрабатываются отдельно
        for (let name in el.attribs) {
          if (Object.values(NODE_SPEC_ATTRS).includes(name)) continue;

          let attrVal = el.attribs[name];
          if (attrVal.includes("{")) {
            el.attribs[name] = strToArrWithPaths(attrVal);
          }
        }
      }
    } else if (el.type === "text") {
      if (el.data.includes("{") && el.parent.type !== "style") {
        toTextWithDataNode(el);
      }
    } else if (el.type === "style") {
      style = el;
    }
  });
  if (style) {
    let styleContent = style.children[0].data.trim();
    removeElement(style);
    style = styleContent;
  }

  let type = Object.keys(pageNodes).length > 0 ? ElementType.Page : ElementType.Component;

  return {
    name, // имя компонента
    type,
    pageNodes,
    props, // имена параметров
    slots, // имена слотов
    style, // стили компонента
    children: templateEl.children, // осонвная верстка
    dependsOn, // имена компонентов которые используются в текущем
  };
}

function replacePartOfString(str, transform) {
  // берет строку, ищет там фигурные скобки. Содержимое этих скобок передает в коблек (transform),
  // а результат вставляет вместо исходного содержимого строк.
  //
  // Например нужно для такого преобразования:
  //    исходная строка:  "Hello, {user.name}!"
  //    результат массив: ["hello, ", ['user', 'name'], '!'];
  //
  // Возвращает исходную строку, при любой невалидной строке

  let result = [];
  let lastBorder = [0, null]; // [index: number, bracket: '{' | '}' | null]

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{") {
      if (lastBorder[1] === "{") return str;

      result.push(str.slice(lastBorder[0], i));
      lastBorder = [i, "{"];
    } else if (str[i] === "}") {
      if (lastBorder[1] === "}") return str;

      result.push(transform(str.slice(lastBorder[0] + 1, i)));
      lastBorder = [i, "}"];
    }
  }

  if (lastBorder[1] === "}") {
    result.push(str.slice(lastBorder[0] + 1, str.length));
  } else if (lastBorder[1] === "{") {
    return str;
  }

  return result;
}

export function strToArrWithPaths(str) {
  return replacePartOfString(str, (substring) => getKeysFromStr(substring));
}

function toTextWithDataNode(node) {
  let res = strToArrWithPaths(node.data);
  if (Array.isArray(res)) {
    // hack хак парсера, нужен чтоб подружить AST с моей логикой
    node.data = res;
    node.type = ElementType.TextWithData;
  }
}

function parseProps(str) {
  if (!str) {
    return [];
  }

  return str
    .trim()
    .split(/\s+/g)
    .filter((str) => !!str);
}

function getComponentTemplateTag(node) {
  const res = node.children[0];
  if (res.name === "template") {
    return res;
  }

  throw new Error("Can't get component's template");
}
