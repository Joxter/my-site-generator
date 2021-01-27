import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import prettierCss from "prettier/parser-postcss";
import domSerializer from "dom-serializer";
import { render } from "./render";
import { parse } from "./parse";
import { scopedStyles } from "./scoped-styles";
import { setCssInline } from "./option-css-inline";

export function msg(components, page, data = {}, options = {}) {
  const [Components, pageElement] = parse(components, page);

  scopedStyles(Components);

  let styles = new Set();
  render(Components, pageElement, data, styles);
  styles = [...styles];

  const css = styles.map(({ children }) => children[0].data).join("");

  if (options.cssInline) {
    setCssInline(pageElement, styles);
  }

  const [prettyHtml, prettyCss] = prettify(domSerializer(pageElement), css);

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
