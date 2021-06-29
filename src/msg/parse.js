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

export function parse(components, pages) {
  const pageElement = Array.isArray(pages)
    ? pages.map(page => parseDocument(reduceSpaces(page)))
    : parseDocument(reduceSpaces(pages));

  const Components = initComponents(
    components.map(template => {
      return parseDocument(reduceSpaces(template));
    })
  );

  return [Components, pageElement];
}

const COMPONENT_ATTRS = {
  NAME: "name",
  PROPS: "props",
  SLOTS: "slots",
};

function getServiceNodes(templateData) {
  const templateEl = getComponentTemplateTag(templateData);

  const name = templateEl.attribs[COMPONENT_ATTRS.NAME];
  if (!name) {
    throw new Error("Component name should have a name");
  }

  let styles;
  let componentNodes = []; // todo убрать все что будет реализовано в ёлке
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
      if (!styles) {
        styles = el;
      }
    }
  });
  if (styles) {
    removeElement(styles);
  }

  return {
    name,
    props,
    template: templateEl,
    componentNodes,
    styles,
    nodesToData,
    slots,
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

function reduceSpaces(str) {
  return str.replace(/\n+/g, " ").trim();
}

function getComponentTemplateTag(data) {
  const res = data.children[0];
  if (res.name === "template") {
    return res;
  }

  throw new Error("Can't get component's template");
}
