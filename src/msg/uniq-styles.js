import jsdom from "jsdom";

export function uniqStyles(Components) {
  Object.values(Components).forEach(comp => {
    return makeUniq(comp);
  });
}

function makeUniq(component) {
  const styles = myAddStylesheetRules(component.styles.innerHTML);
  const { cssRules } = styles.sheet;

  const newStyleEl = window.document.createElement("style");

  cssRules.forEach(rule => {
    const unicClass = "-c-" + component.uid;

    if (!rule.selectorText.startsWith("#")) {
      component.childNodes.querySelectorAll(rule.selectorText).forEach(node => {
        node.classList.add(unicClass);
      });
    }

    newStyleEl.innerHTML += rule.cssText.replace(
      rule.selectorText,
      __unic(rule.selectorText, unicClass)
    );
  });

  component.styles = newStyleEl;
}

const htmlTags = ["p", "div", "span", "h2"]; // todo add more tags

function __unic(selector, salt) {
  let newSelector = selector.replace(/(\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g, (_, cssClass) => {
    return "." + salt + cssClass;
  });

  const regexp = new RegExp(`(${htmlTags.join("|")})`, "g"); // fix cases like class ".some-button"

  newSelector = newSelector.replace(regexp, (_, cssClass) => {
    return cssClass + "." + salt;
  });

  return newSelector;
}

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html>`);

const window = dom.window;

function myAddStylesheetRules(rules) {
  const styleEl = window.document.createElement("style");
  window.document.head.appendChild(styleEl);

  styleEl.innerHTML = rules;

  return styleEl;
}
