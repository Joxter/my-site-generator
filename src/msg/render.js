import { append, findOne, removeElement } from "domutils";
import { deepFind, getKeysFromStr, removeFirstLastChar } from "./utils";

const COND_ATTRIB = "j-if";
const COND_ELSE_ATTRIB = "j-else";

export function render(Components, elem, data, styles, slots = null) {
  elem = resolveCondition(elem, data);
  if (!elem) {
    return;
  }

  if (Components[elem.name]) {
    const myComp = Components[elem.name];
    if (myComp.styles) {
      styles.add(myComp.name);
    }
    const innerData = getComponentPropsData(myComp, elem, data);
    const slots = getComponentSlotsData(myComp, elem);

    const renderedComp = myComp.template.cloneNode(true);
    render(Components, renderedComp, innerData, styles, slots);
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

function resolveCondition(elem, data) {
  if (!elem.attribs || !(COND_ATTRIB in elem.attribs)) {
    return elem;
  }
  const condStr = elem.attribs[COND_ATTRIB];
  const next = elem.next;
  const elseBranch = (next && next.attribs && COND_ELSE_ATTRIB in next.attribs) || false;

  if (elseBranch) {
    delete next.attribs[COND_ELSE_ATTRIB];
  }
  delete elem.attribs[COND_ATTRIB];

  if (["false", "", "0"].includes(condStr)) {
    removeElement(elem);
    return next;
  }

  if (condStr[0] === "{" && condStr[condStr.length - 1] === "}") {
    const path = removeFirstLastChar(condStr);
    const condValue = deepFind(data, getKeysFromStr(path));

    if (condValue) {
      if (next) {
        removeElement(next);
      }
      return elem;
    } else {
      removeElement(elem);
      return next;
    }
  }
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
