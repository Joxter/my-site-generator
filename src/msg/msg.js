import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import prettierCss from "prettier/parser-postcss";
import { render } from "./render";
import { parse } from "./parse";
import { uniqStyles } from "./uniq-styles";
import { getInnerHTML } from "domutils"; // todo use "dom-serializer"

export function msg(components, page, data = {}) {
  const [Components, pageElement] = parse(components, page);

  uniqStyles(Components);

  let styles = new Set();
  render(Components, pageElement, data, styles);

  const css = styles.size > 0 ? [...styles].map(styleNode => styleNode.innerHTML).join("") : "";

  const [prettyHtml, prettyCss] = prettify(getInnerHTML(pageElement), css);

  return { html: prettyHtml, css: prettyCss };
}

function prettify(html, css) {
  const options = {
    plugins: [prettierHtml, prettierCss],
    printWidth: 120,
  };
  const htmlResult = prettier.format(html, { ...options, parser: "html" }).trim();
  const cssResult = prettier.format(css, { ...options, parser: "css" }).trim();

  return [htmlResult, cssResult];
}

export const msgNode = msg; // todo remove with browser support
