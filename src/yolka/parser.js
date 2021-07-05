import { parseDocument } from "htmlparser2";
import { removeElement } from "domutils";
import { forEachNodes, getKeysFromStr, removeFirstLastChar } from "../utils.js";

function initComponents(componentsAST) {
  const Components = {};

  componentsAST.forEach((componentAST, i) => {
    const component = getServiceNodes(componentAST);
    component.uid = i;
    Components[component.name] = component;
  });

  return Components;
}

const COMPONENT_ATTRS = {
  NAME: "name",
  PROPS: "props",
  SLOTS: "slots",
};

export function parse(componentStrs, pageStrs) {
  const pages = pageStrs.map(page => getServiceNodes(parseDocument(page), true));

  const Components = initComponents(
    componentStrs.map(template => {
      return parseDocument(template);
    })
  );

  return [Components, pages];
}

function getServiceNodes(componentAST, isPage = false) {
  const templateEl = getComponentTemplateTag(componentAST, isPage);

  const name = isPage ? null : templateEl.attribs[COMPONENT_ATTRS.NAME];
  if (!isPage && !name) {
    // todo может сюда что-то подставлять, типа название файла?
    throw new Error("Component name should have a name");
  }

  let style = null;
  let dependsOn = new Set(); // компоненты которые используются в этом
  // let nodesToData = []; // текстовые ноды, в которые можно вставить какой-то текст "some text {insert}"
  const props = isPage ? [] : parseProps(templateEl.attribs[COMPONENT_ATTRS.PROPS]);
  const slots = isPage ? [] : parseProps(templateEl.attribs[COMPONENT_ATTRS.SLOTS]);
  let headEl = null;
  let bodyEl = null;

  forEachNodes(templateEl, el => {
    if (el.type === "tag") {
      if (isPage && el.name === "head") {
        headEl = el;
      }
      if (isPage && el.name === "body") {
        bodyEl = el;
      }
      if (el.name.includes("-")) {
        el.type = "component"; // hack первый хак парсера, нужен чтоб подружить AST с моей логикой

        for (let name in el.attribs) {
          el.attribs[name] = getKeysFromStr(removeFirstLastChar(el.attribs[name]));
        }

        dependsOn.add(el.name);
        // if (isPage) componentNodes.push(el);
      }
    } else if (el.type === "text") {
      if (el.data.includes("{")) {
        toTextWithDataNode(el); // hack хак парсера, нужен чтоб подружить AST с моей логикой
        // nodesToData.push(el);
      }
    } else if (el.type === "style") {
      style = el;
    }
  });
  if (style) {
    removeElement(style);
  }

  return {
    name, // имя компонента
    type: isPage ? "page" : "component",
    props, // имена параметров
    slots, // имена слотов
    style, // нода <style>
    children: templateEl.children, // осонвная верстка
    dependsOn, // имена компонентов которые используются в текущем
    // nodesToData, // ссылки на ноды куда можно вставить некий текст
    bodyEl, // ссылка на <body>
    headEl, // ссылка на <head>
  };
}

function toTextWithDataNode(node) {
  //  как-то так "Hello, {user.name}!" => ["hello,", ['user', 'name'], '!'];

  let str = node.data;
  let result = [];
  let lastBorder = 0;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{" || str[i] === "}") {
      if (str[i] === "{") {
        if (lastBorder !== i) {
          result.push(str.slice(lastBorder, i));
        }
      } else {
        result.push(getKeysFromStr(str.slice(lastBorder + 1, i)));
      }

      lastBorder = i;
    }
  }

  if (lastBorder < str.length - 1) {
    result.push(str.slice(lastBorder + 1, str.length));
  }

  node.data = result;
  node.type = "text-with-data";
}

function parseProps(str) {
  if (!str) {
    return [];
  }

  return str
    .trim()
    .split(/\s+/g)
    .filter(str => !!str);
}

function getComponentTemplateTag(node, isPage = false) {
  if (isPage) return node;

  const res = node.children[0];
  if (res.name === "template") {
    return res;
  }

  throw new Error("Can't get component's template");
}
