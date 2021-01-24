import { append, findOne, removeElement } from "domutils";
import { deepFind, getKeysFromStr, removeFirstLastChar } from "./utils";

export function render(Components, elem, data, styles, slots = null) {
  if (Components[elem.name]) {
    const myComp = Components[elem.name];
    if (myComp.styles) {
      styles.add(myComp.styles);
    }
    const innerData = getComponentPropsData(myComp, elem, data);
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
    elem = extractNode(renderedComp);
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

function getComponentPropsData(component, node, compData) {
  const data = {};
  component.props.forEach(propName => {
    data[propName] = node.attribs[propName];
  });

  return insertDataToProp(data, compData);
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

function insertDataToProp(props, data) {
  for (let key in props) {
    if (/^\{.+\}$/.test(props[key])) {
      const path = removeFirstLastChar(props[key]);
      props[key] = deepFind(data, getKeysFromStr(path));
    } else {
      props[key] = insertDataToSting(props[key], data);
    }
  }

  return props;
}

function insertDataToSting(str, data) {
  return str.replace(/(?:\{(.+?)\})/g, (match, $1) => {
    const keys = getKeysFromStr($1);
    return deepFind(data, keys);
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
  let firstChildren = node.children[0];

  [...node.children].forEach(next => {
    append(lastNode, next);
    lastNode = next;
  });
  removeElement(node);

  return firstChildren;
}
