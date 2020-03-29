const Components = {};

export function initComponent(node) {
  const component = getServiceNodes(node);

  if (Components[component.name]) {
    console.warn(`Component "${component.name}" has already inited`);
  }
  Components[component.name] = component;

  console.log({ Components });
  return Components[name];
}

export function render(templateEl) {
  console.log("render", templateEl);

  templateEl.content.childNodes.forEach(node => {
    console.dir(node);
  });
}

export function getComponent(name) {
  if (!Components[name]) {
    throw new Error(`Component "${name}" is not found`);
  }
  return Components[name];
}

function getServiceNodes(templateEl) {
  const name = templateEl.dataset.jComponent;

  if (!name) {
    throw new Error("Component name shuld has a name");
  }

  const props = (templateEl.dataset.jProps || "").trim().split(/\s+/g);

  const childNodes = templateEl.content.cloneNode(true);
  let styles = [];

  return {
    name,
    props,
    childNodes,
    styles
  };
}
