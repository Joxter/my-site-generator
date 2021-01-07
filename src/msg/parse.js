export function initComponent(node) {
  const component = getServiceNodes(node);

  return component;
}

export function initComponents(el) {
  const Components = {};

  el.content.querySelectorAll("template").forEach((el, i) => {
    const component = initComponent(el);
    component.uid = i;
    Components[component.name] = component;

    el.remove();
  });

  return Components;
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

function nodeFromHtml(html) {
  const el = window.document.createElement("template");

  el.innerHTML = html;

  return el;
}
