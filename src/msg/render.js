import { nodeFromHtmlJSDOM } from "./parse";

export function render(Components, elem, data, styles, slots = null) {
  if (Components[elem.localName]) {
    const myComp = Components[elem.localName];
    if (myComp.styles) {
      styles.add(myComp.styles);
    }
    const data = getComponentPropsData(myComp, elem);
    const slots = getComponentSlotsData(myComp, elem);

    const renderedComp = render(Components, myComp.childNodes.cloneNode(true), data, styles, slots);
    elem.after(renderedComp);
    elem.remove();
  }

  insertData(elem, data);
  insertSlots(elem, slots);

  for (let node of elem.childNodes) {
    render(Components, node, data, styles, slots);
  }

  return elem;
}

function isSlot(elem) {
  return elem.tagName === "SLOT" || elem.tagName === "slot";
}

function getComponentPropsData(component, node) {
  const data = {};
  component.props.forEach(propName => {
    data[propName] = node.getAttribute(propName);
  });

  return data;
}

function getComponentSlotsData(component, node) {
  const slots = {};

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
  if (node.nodeType === 3) {
    node.textContent = node.textContent.replace(/(\{(.+?)\})/g, (match, first, second) => {
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
