import { append, findOne, removeElement } from "domutils";
import { deepFind } from "./utils";

export function render(Components, elem, data, styles, slots = null) {
  if (Components[elem.name]) {
    const myComp = Components[elem.name];
    if (myComp.styles) {
      styles.add(myComp.styles);
    }
    const innerData = insertDataToObj(getComponentPropsData(myComp, elem), data);
    const slots = getComponentSlotsData(myComp, elem);

    const renderedComp = render(
      Components,
      myComp.template.cloneNode(true),
      innerData,
      styles,
      slots
    );
    append(elem, renderedComp);
    removeElement(elem);
    extractNode(renderedComp);
  }

  insertDataToNode(elem, data);
  insertSlots(elem, slots);

  if (elem.children) {
    for (let node of elem.children) {
      render(Components, node, data, styles, slots);
    }
  }

  return elem;
}

function isSlot(elem) {
  return elem.name === "slot";
}

function getComponentPropsData(component, node) {
  const data = {};
  component.props.forEach(propName => {
    data[propName] = node.attribs[propName];
  });

  return data;
}

function getComponentSlotsData(component, node) {
  const slots = {};

  component.slots.forEach(slotName => {
    const slotEl = findOne(el => el.attribs.slot === slotName, node.children);
    if (slotEl) {
      slots[slotName] = slotEl;
      delete slots[slotName].attribs.slot;
    }
  });

  return slots;
}

function insertDataToNode(node, data) {
  if (node.type === "text") {
    node.data = insertDataToSting(node.data, data);
  }
  return node;
}

function insertDataToObj(obj, data) {
  for (let key in obj) {
    obj[key] = insertDataToSting(obj[key], data);
  }
  return obj;
}

function insertDataToSting(str, data) {
  return str.replace(/(?:\{(.+?)\})/g, (match, $1) => {
    if ($1.includes(".") || $1.includes("[") || $1.includes("]")) {
      const keys = $1.split(/[\[\].]+/);
      return deepFind(data, keys);
    }

    return data[$1] || `[no data for ${$1}]`;
  });
}

function insertSlots(node, slots) {
  if (!isSlot(node)) {
    return;
  }
  const slotName = node.attribs.name;

  if (slots[slotName]) {
    append(node, slots[slotName]);
    removeElement(node);
  } else {
    extractNode(node);
  }
}

function extractNode(node) {
  let lastNode = node;

  [...node.children].forEach(next => {
    append(lastNode, next);
    lastNode = next;
  });
  removeElement(node);
}
