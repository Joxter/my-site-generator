const Components = {};

export function initComponent(node) {
  const component = getServiceNodes(node);

  if (Components[component.name]) {
    console.warn(`Component "${component.name}" has already inited`);
  }
  Components[component.name] = component;

<<<<<<< HEAD
  console.log({ Components });
=======
  // console.log({ Components });
>>>>>>> d86350f0e21a91cc96e46e001dd72737cda58b47
  return Components[name];
}

export function render(elem, data = {}) {
<<<<<<< HEAD
  const cNodes = elem.childNodes;

  if (Components[elem.localName]) {
    elem.after(Components[elem.localName].childNodes.cloneNode(true));
    elem.remove();
  }

  for (let node of cNodes) {
    node.childNodes && node.childNodes.forEach((el) => render(el));
  }
=======
  if (Components[elem.localName]) {
    const myComp = Components[elem.localName];
    const data = getComponentPropsData(myComp, elem);

    elem.after(render(myComp.childNodes.cloneNode(true), data));
    elem.remove();
  }

  elem = inserdData(elem, data);

  for (let node of elem.childNodes) {
    render(node, data);
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
      return data[second] || "[NONE]";
    });
  }
  return node;
>>>>>>> d86350f0e21a91cc96e46e001dd72737cda58b47
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

  const childNodes = templateEl.content;
  let styles = [];

  return {
    name,
    props,
    childNodes,
    styles,
  };
}
