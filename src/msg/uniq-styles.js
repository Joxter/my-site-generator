import jsdom from "jsdom";
import CSSselect from "css-select";
import css from "css";

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
  const cssData =  css.parse(rawStyles);
  const cssRules =  cssData.stylesheet.rules;

  cssRules.forEach(rule => {
    const unicClass = "-c-" + component.uid;

    /*
    if (rule.cssRules) {
      newStyleEl.innerHTML += `@media ${Array.from(rule.media).join(", ")} {`;
      rule.cssRules.forEach(innerRule => {
        newStyleEl.innerHTML += modifyRule(innerRule, component);
      });
      newStyleEl.innerHTML += `}`;
      return;
    }
    */

    rule.selectors = rule.selectors.map(selector => __unic(selector, unicClass))
  });

  component.styles = css.stringify(cssData);
}

function modifyRule(rule, component) {
  const unicClass = "-c-" + component.uid;

  // CSSselect.selectAll(query, elems, options)
  if (!rule.selectorText.startsWith("#")) {
    component.childNodes.querySelectorAll(rule.selectorText).forEach(node => {
      node.classList.add(unicClass);
    });
  }

  return rule.cssText.replace(rule.selectorText, __unic(rule.selectorText, unicClass));
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
    return [str[0], str.slice(1, str.length - 1), str[str.length - 1]];
  }
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
