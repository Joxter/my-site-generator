import { parseDocument } from "htmlparser2";
import { removeElement } from "domutils";
import { forEachNodes, getKeysFromStr, removeFirstLastChar } from "../utils.js";
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
  const pages = pageStrs.map((page) => getServiceNodes(parseDocument(page), true));

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
      if (NODE_SPEC_ATTRS.IF in el.attribs) {
        let cond = el.attribs[NODE_SPEC_ATTRS.IF];
        el.attribs[NODE_SPEC_ATTRS.IF] = getKeysFromStr(removeFirstLastChar(cond));
      }

      if (NODE_SPEC_ATTRS.FOR in el.attribs) {
        let forStr = el.attribs[NODE_SPEC_ATTRS.FOR];
        let [itemName, arrayName] = removeFirstLastChar(forStr).split(" in ");
        el.attribs[NODE_SPEC_ATTRS.FOR] = { itemName, arrayPath: getKeysFromStr(arrayName) };
      }

      if (el.name === "slot") {
        el.type = ElementType.Slot; // hack хак парсера, нужен чтоб подружить AST с моей логикой
      }

      if (el.name.includes("-")) {
        el.type = ElementType.Component; // hack первый хак парсера, нужен чтоб подружить AST с моей логикой

        for (let name in el.attribs) {
          let attrVel = el.attribs[name];
          if (attrVel[0] === "{" && attrVel[attrVel.length - 1] === "}") {
            el.attribs[name] = getKeysFromStr(removeFirstLastChar(attrVel));
          } else {
            el.attribs[name] = attrVel;
          }
        }

        dependsOn.add(el.name);
      }
    } else if (el.type === "text") {
      if (el.data.includes("{") && el.parent.type !== "style") {
        toTextWithDataNode(el); // hack хак парсера, нужен чтоб подружить AST с моей логикой
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

function toTextWithDataNode(node) {
  //  как-то так "Hello, {user.name}!" => ["hello,", ['user', 'name'], '!'];
  // todo исправить на нормальное, а то сейчас все сломается если "Hello}, {} my name is {name!"

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
  node.type = ElementType.TextWithData;
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
