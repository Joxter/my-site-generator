import { parseDocument } from "htmlparser2";
import { findOne, removeElement } from "domutils";

function initComponents(componentsArr) {
  const Components = {};

  componentsArr.forEach((el, i) => {
    const component = getServiceNodes(el);
    component.uid = i;
    Components[component.name] = component;
  });

  return Components;
}

export function parse(components, page) {
  const pageElement = parseDocument(reduceSpaces(page));
  const Components = initComponents(
    components.map(template => {
      return parseDocument(reduceSpaces(template));
    })
  );

  return [Components, pageElement];
}

const COMPONENT_ATTRS = {
  NAME: "data-j-component",
  PROPS: "data-j-props",
  SLOTS: "data-j-slots",
};

function getServiceNodes(templateData) {
  const templateEl = getComponentTemplateTag(templateData);

  const name = templateEl.attribs[COMPONENT_ATTRS.NAME];

  if (!name) {
    throw new Error("Component name should have a name");
  }

  const props = parseProps(templateEl.attribs[COMPONENT_ATTRS.PROPS]);
  const slots = parseProps(templateEl.attribs[COMPONENT_ATTRS.SLOTS]);

  const childNodes = templateEl.children;
  let styles = findOne(el => el.type === "style", childNodes);

  if (styles) {
    removeElement(styles);
  }

  return {
    name,
    props,
    template: templateEl,
    styles,
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
