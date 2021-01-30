import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import prettierCss from "prettier/parser-postcss";
import domSerializer from "dom-serializer";
import { render } from "./render";
import { parse } from "./parse";
import { scopedStyles } from "./scoped-styles";
import { setCssInline } from "./option-css-inline";
import { commonInArr } from "./utils";

export function msg(components, page, data = {}, options = {}) {
  const [Components, pageElement] = parse(components, page);

  scopedStyles(Components);

  if (Array.isArray(pageElement)) {
    const pageElements = pageElement;

    const result = {
      pages: [],
      common: { css: "" },
    };

    let commonStyles = Object.keys(Components);

    result.pages = pageElements.map(pageElement => {
      let styles = new Set();
      render(Components, pageElement, data, styles);
      styles = [...styles];
      commonStyles = commonInArr(commonStyles, styles);

      const css = getStylesFromComponents(Components, styles).join("");

      if (options.cssInline) {
        setCssInline(pageElement, styles);
      }

      const [prettyHtml, prettyCss] = prettify(domSerializer(pageElement), css);

      return { html: prettyHtml, css: prettyCss };
    });

    result.common.css = prettifyCss(getStylesFromComponents(Components, commonStyles).join(""));

    return result;
  }

  let styles = new Set();
  render(Components, pageElement, data, styles);

  const css = getStylesFromComponents(Components, [...styles]).join("");

  if (options.cssInline) {
    setCssInline(pageElement, [...styles]);
  }

  const [prettyHtml, prettyCss] = prettify(domSerializer(pageElement), css);

  return { html: prettyHtml, css: prettyCss };
}

function getStylesFromComponents(Components, compNames) {
  return compNames.map(compName => Components[compName].styles.children[0].data);
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

function prettifyCss(css) {
  const options = {
    plugins: [prettierCss],
    printWidth: 120,
  };

  return prettier.format(css, { ...options, parser: "css" }).trim();
}
