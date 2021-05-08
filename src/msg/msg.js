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

      if (options.cssInline) {
        setCssInline(pageElement, getStylesNodesFromComponents(Components, styles));
      }

      const domSer = domSerializer.default || domSerializer
      const prettyHtml = prettifyHtml(domSer(pageElement));

      return { html: prettyHtml, css: styles };
    });

    result.common.css = prettifyCss(getStylesFromComponents(Components, commonStyles).join(""));
    result.pages.forEach(page => {
      const uniqStylesNames = page.css.filter(name => !commonStyles.includes(name));
      const styles = getStylesFromComponents(Components, uniqStylesNames);

      page.css = prettifyCss(styles.join(""));
    });

    prettifyCss(getStylesFromComponents(Components, commonStyles).join(""));

    return result;
  }

  let styles = new Set();
  render(Components, pageElement, data, styles);

  const css = getStylesFromComponents(Components, [...styles]).join("");

  if (options.cssInline) {
    setCssInline(pageElement, getStylesNodesFromComponents(Components, [...styles]));
  }

  const domSer = domSerializer.default || domSerializer
  return { html: prettifyHtml(domSer(pageElement)), css: prettifyHtml(css) };
}

function getStylesFromComponents(Components, compNames) {
  return compNames.map(compName => Components[compName].styles.children[0].data);
}

function getStylesNodesFromComponents(Components, compNames) {
  return compNames.map(compName => Components[compName].styles);
}

function prettifyHtml(html) {
  const options = {
    plugins: [prettierHtml, prettierCss],
    printWidth: 120,
  };
  const htmlResult = prettier.format(html, { ...options, parser: "html" }).trim();
  return htmlResult;
}

function prettifyCss(css) {
  const options = {
    plugins: [prettierCss],
    printWidth: 120,
  };

  return prettier.format(css, { ...options, parser: "css" }).trim();
}
