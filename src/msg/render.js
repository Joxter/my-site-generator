import { append, findOne, removeElement } from "domutils";
import { deepFind, first, getKeysFromStr, last, removeFirstLastChar } from "./utils";
import { findAll } from "domutils/lib/querying";

const COND_ATTRIB = "j-if";
const COND_ELSE_ATTRIB = "j-else";
const FOR_ATTRIB = "j-for"; // {item in arr}

export function render(Components, elem, data, styles, slots = null) {
  elem = resolveCondition(elem, data);
  if (!elem) {
    return;
  }
  elem = resolveFor(elem, data, (newELem, arrItem, itemKey) => {
    render(Components, newELem, { ...data, [itemKey]: arrItem }, styles, slots);
  });
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
    render(Components, renderedComp, { ...innerData, ...data }, styles, slots);
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
    const slotEls = findAll(el => el.attribs.slot === slotName, node.children);
    slots[slotName] = slotEls;
    slots[slotName].forEach(slotNode => {
      delete slotNode.attribs.slot;
    });
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
  // todo fix errors when we trying to pass props witch doesn't exist
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

  if (first(condStr) === "{" && last(condStr) === "}") {
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

function resolveFor(elem, data, cb) {
  if (!elem.attribs || !(FOR_ATTRIB in elem.attribs)) {
    return elem;
  }
  const forStr = elem.attribs[FOR_ATTRIB];
  delete elem.attribs[FOR_ATTRIB];

  if (first(forStr) === "{" && last(forStr) === "}") {
    const [itemKey, arr] = removeFirstLastChar(forStr).split(" in ");
    const items = deepFind(data, getKeysFromStr(arr));

    if (!items || items.length === 0) {
      removeElement(elem);
      return elem.next;
    }

    let lastELem = elem;
    items.forEach(arrItem => {
      const newELem = elem.cloneNode(true);

      cb(newELem, arrItem, itemKey);

      append(lastELem, newELem);
      lastELem = newELem;
    });
    removeElement(elem);

    return lastELem;
  }
}

function insertSlots(node, slots) {
  if (!isSlot(node)) {
    return;
  }
  const slotName = node.attribs.name;

  if (slots[slotName].length > 0) {
    let last = node;
    slots[slotName].forEach(slot => {
      append(last, slot);
      last = slot;
    });
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
