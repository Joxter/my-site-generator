import { render, renderStyles } from "./render";
import { initComponents } from "./parse";
import jsdom from "jsdom";

export function msg(html, nodeFromHtml = nodeFromHtmlBrowser) {
  const el = nodeFromHtml(html);
  const Components = initComponents(el);

  let styles = new Set();

  render(Components, el.content, {}, styles);

  return `${el.innerHTML} ${renderStyles(styles)}`;
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

  const el = dom.window.document.createElement("template");

  el.innerHTML = html;

  return el;
}
