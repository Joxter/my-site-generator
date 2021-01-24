import { selectAll } from "css-select";
import css from "css";
import { removeFirstLastChar } from "./utils";

export function uniqStyles(Components) {
  Object.values(Components).forEach(comp => {
    return makeUniq(comp);
  });
}

function makeUniq(component) {
  if (!component.styles) {
    return;
  }

  const rawStyles = component.styles.children[0].data;
  const cssData = css.parse(rawStyles);
  const cssRules = cssData.stylesheet.rules;

  cssRules.forEach(rule => {
    if (rule.type === "media") {
      rule.rules.forEach(innerRule => {
        innerRule.selectors = innerRule.selectors.map(selector => modifyRule(selector, component));
      });
      return;
    }

    rule.selectors = rule.selectors.map(selector => modifyRule(selector, component));
  });

  component.styles = css.stringify(cssData);
}

function modifyRule(selector, component) {
  const unicClass = "-c-" + component.uid;

  if (!selector.startsWith("#")) {
    selectAll(selector, component.template).forEach(node => {
      if (!node.attribs.class) {
        node.attribs.class = unicClass;
      } else {
        node.attribs.class += ` ${unicClass}`;
      }
    });
  }

  return __unic(selector, unicClass);
}

const htmlTags = ["p", "div", "span", "h2", "main", "nav", "header", "footer", "h1", "h2"]; // todo add all tags
const htmlTagsRegexp = new RegExp(`(.(${htmlTags.join("|")}).)`, "g"); // fix cases like class ".some-button"

function __unic(selector, salt) {
  let newSelector = selector.replace(/(\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g, (_, cssClass) => {
    return "." + salt + cssClass;
  });

  newSelector = ` ${newSelector} `.replace(htmlTagsRegexp, (_, cssClass) => {
    if (isLooksLikeTag(cssClass)) {
      const [first, tag, last] = splitFirstAndLastChar(cssClass);
      return first + tag + "." + salt + last;
    }
    return cssClass;
  });

  return newSelector.trim();

  function isLooksLikeTag(str) {
    const firstChar = str[0];
    const lastChar = str[str.length - 1];

    return [" ", ","].includes(firstChar) && [" ", ","].includes(lastChar);
  }

  function splitFirstAndLastChar(str) {
    return [str[0], removeFirstLastChar(str), str[str.length - 1]];
  }
}
