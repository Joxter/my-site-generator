export function render(Components, elem, data, styles) {
  if (Components[elem.localName]) {
    const myComp = Components[elem.localName];
    if (myComp.styles) {
      styles.add(myComp.styles);
    }
    const data = getComponentPropsData(myComp, elem);

    elem.after(render(Components, myComp.childNodes.cloneNode(true), data, styles));
    elem.remove();
  }

  elem = insertData(elem, data);

  for (let node of elem.childNodes) {
    render(Components, node, data, styles);
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

function insertData(node, data) {
  if (node.nodeType === 3) {
    node.textContent = node.textContent.replace(/(\{(.+?)\})/g, (match, first, second) => {
      return data[second] || `[no data for ${second}]`;
    });
  }
  return node;
}
