const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

const Components = {};

function renderStyles(styles) {
  return `<style>
    ${[...styles].map(styleNode => styleNode.innerHTML).join("")}
    </style>`;
}

function nodeFromHtml(html) {
  const el = dom.window.document.createElement("template");

  el.innerHTML = html;

  return el;
}

function initComponent(node) {
  const component = getServiceNodes(node);

  if (Components[component.name]) {
    // console.warn(`Component "${component.name}" has already inited`);
  }
  Components[component.name] = component;

  // console.log({ Components });
  return Components[component.name];
}

function render(elem, data, styles) {
  if (Components[elem.localName]) {
    const myComp = Components[elem.localName];
    styles.add(myComp.styles);
    const data = getComponentPropsData(myComp, elem);

    elem.after(render(myComp.childNodes.cloneNode(true), data, styles));
    elem.remove();
  }

  elem = inserdData(elem, data);

  for (let node of elem.childNodes) {
    render(node, data, styles);
  }

  return elem;
}

function getComponentPropsData(component, node) {
  const data = {};
  component.props.forEach(propName => {
    data[propName] = node.getAttribute(propName);
  });

  return data;
}

function inserdData(node, data) {
  if (node.nodeType === 3) {
    node.textContent = node.textContent.replace(/(\{(.+?)\})/g, (match, first, second) => {
      return data[second] || `[no data for ${second}]`;
    });
  }
  return node;
}

function getComponent(name) {
  if (!Components[name]) {
    throw new Error(`Component "${name}" is not found`);
  }
  return Components[name];
}

function getServiceNodes(templateEl) {
  const name = templateEl.dataset.jComponent;

  if (!name) {
    throw new Error("Component name should have a name");
  }

  const props = (templateEl.dataset.jProps || "").trim().split(/\s+/g);

  const childNodes = templateEl.content;
  let styles = templateEl.content.querySelector("style") || null;

  if (styles) {
    styles.remove();
  }

  return {
    name,
    props,
    childNodes,
    styles,
  };
}

export function renderPage(html) {
  const el = nodeFromHtml(html);

  el.content.querySelectorAll("template").forEach(el => {
    initComponent(el);
    el.remove();
  });

  let styles = new Set();
  render(el.content, {}, styles);
  return `${el.innerHTML} ${renderStyles(styles)}`;
}
