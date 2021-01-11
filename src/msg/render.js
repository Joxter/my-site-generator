import { nodeFromHtmlJSDOM } from "./parse";
import { append, removeElement } from "domutils";

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
  return false; // todo implement
  return elem.tagName === "SLOT" || elem.tagName === "slot";
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
  return slots; // todo implement

  component.slots.forEach(slotName => {
    const slotEl = node.querySelector(`[slot="${slotName}"]`);
    if (slotEl) {
      slots[slotName] = slotEl;
      slots[slotName].removeAttribute("slot");
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
  const slotName = node.name;

  if (slots[slotName]) {
    node.after(slots[slotName]);
    node.remove();
  } else {
    node.after(nodeFromHtmlJSDOM(node.innerHTML).content.cloneNode(true)); // todo move nodeFromHtmlJSDOM to parse part
    node.remove();
  }
}
