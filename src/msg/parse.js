import jsdom from "jsdom";

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
  const pageElement = nodeFromHtmlJSDOM(page.replace(/\n+/g, " "));
  const Components = initComponents(
    components.map(template => {
      // todo remove this mess
      return nodeFromHtmlJSDOM(template.replace(/\n+/g, " ")).content.querySelector("template");
    })
  );

  return [Components, pageElement];
}

function getServiceNodes(templateEl) {
  const name = templateEl.dataset.jComponent;

  if (!name) {
    throw new Error("Component name should have a name");
  }

  const props = (templateEl.dataset.jProps || "").trim().split(/\s+/g);
  const slots = (templateEl.dataset.jSlots || "").trim().split(/\s+/g).filter(str => !!str);

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
    slots
  };
}

export function nodeFromHtmlJSDOM(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(`<!DOCTYPE html>`);

  const el = dom.window.document.createElement("template");

  el.innerHTML = html;

  return el;
}
