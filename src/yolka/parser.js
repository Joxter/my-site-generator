import { parseDocument } from "htmlparser2";
import { removeElement } from "domutils";
import { forEachNodes } from "../utils.js";

function initComponents(componentsArr) {
  const Components = {};

  componentsArr.forEach((el, i) => {
    const component = getServiceNodes(el);
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

export function parse(components, pages) {
  const pageElements = pages.map(page => parseDocument(page));

  const Components = initComponents(
    components.map(template => {
      return parseDocument(template);
    })
  );

  return [Components, pageElements];
}

function getServiceNodes(templateData) {
  const templateEl = getComponentTemplateTag(templateData);

  const name = templateEl.attribs[COMPONENT_ATTRS.NAME];
  if (!name) {
    throw new Error("Component name should have a name");
  }

  let style;
  let componentNodes = [];
  let nodesToData = []; // текстовые ноды, в которые можно вставить какой-то текст "some text {insert}"
  const props = parseProps(templateEl.attribs[COMPONENT_ATTRS.PROPS]);
  const slots = parseProps(templateEl.attribs[COMPONENT_ATTRS.SLOTS]);

  forEachNodes(templateEl, el => {
    if (el.type === "tag") {
      if (el.name.includes("-")) {
        componentNodes.push(el);
      }
    } else if (el.type === "text") {
      if (el.data.includes("{")) {
        // fixme исправить на более надежное
        nodesToData.push(el);
      }
    } else if (el.type === "style") {
      if (!style) {
        style = el;
      }
    }
  });
  if (style) {
    removeElement(style);
  }

  return {
    name, // имя компонента
    props, // имена параметров
    slots, // именя слотов
    style, // компонент со стилями
    template: templateEl, // осонвная верстка
    componentNodes, // ссылки на новы вложенных компонентов
    nodesToData, // ссылки на ноды куда можно вставить некий текст
  };
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

function getComponentTemplateTag(data) {
  const res = data.children[0];
  if (res.name === "template") {
    return res;
  }

  throw new Error("Can't get component's template");
}
