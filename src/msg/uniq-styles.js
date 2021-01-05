import jsdom from "jsdom";

export function uniqStyles(Components) {
  // window.__Components = Components;
  Object.values(Components).forEach(comp => {
    return makeUniq(comp);
  });
}

function makeUniq(component) {
  // console.log(component);
  console.log(myAddStylesheetRules(component.styles.innerHTML).sheet.cssRules[0]);
}

const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html>`);

const window = dom.window;

function myAddStylesheetRules(rules) {
  const el = window.document.createElement("template");

  const styleEl = window.document.createElement("style");
  window.document.head.appendChild(styleEl);

  styleEl.innerHTML = rules;

  return styleEl;

}

function nodeFromHtmlJSDOM(html) {


  el.innerHTML = html;

  return el;
}
