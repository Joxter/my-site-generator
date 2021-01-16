import { append, findOne, removeElement } from "domutils";

export function render(Components, elem, data, styles, slots = null) {
  if (Components[elem.name]) {
    const myComp = Components[elem.name];
    if (myComp.styles) {
      styles.add(myComp.styles);
    }
    const data = getComponentPropsData(myComp, elem);
    const slots = getComponentSlotsData(myComp, elem);

    const renderedComp = render(Components, myComp.template.cloneNode(true), data, styles, slots);
    append(elem, renderedComp);
    removeElement(elem);
    extractNode(renderedComp);
  }

  insertData(elem, data);
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

function insertData(node, data) {
  if (node.type === "text") {
    node.data = node.data.replace(/(\{(.+?)\})/g, (match, first, second) => {
      return data[second] || `[no data for ${second}]`;
    });
  }
  return node;
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
