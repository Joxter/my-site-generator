import jsdom from "jsdom";
import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import prettierCss from "prettier/parser-postcss";
import { render } from "./render";
import { initComponents } from "./parse";
import { uniqStyles } from "./uniq-styles";

export function msg(html, nodeFromHtml = nodeFromHtmlBrowser) {
  const el = nodeFromHtml(html.replace(/\n+/g, " "));
  const Components = initComponents(el);

  let styles = new Set();

  uniqStyles(Components);
  render(Components, el.content, {}, styles);
  const st = styles.size > 0 ? [...styles].map(styleNode => styleNode.innerHTML).join("") : "";

  const options = {
    plugins: [prettierHtml, prettierCss],
    printWidth: 120,
  };
  const htmlResult = prettier.format(el.innerHTML, { ...options, parser: "html" }).trim();
  const cssResult = prettier.format(st, { ...options, parser: "css" }).trim();

  return [htmlResult, cssResult];
}

export function msgNode(html) {
  return msg(html, nodeFromHtmlJSDOM);
}

function nodeFromHtmlBrowser(html) {
  const el = window.document.createElement("template");

  el.innerHTML = html;

  return el;
}

function nodeFromHtmlJSDOM(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(`<!DOCTYPE html>`);

// https://github.com/jsdom/jsdom/blob/master/lib/jsdom/browser/parser/html.js
// parse5

// https://developer.aliyun.com/mirror/npm/package/cssom

  const el = dom.window.document.createElement("template");

  el.innerHTML = html;

  return el;
}
