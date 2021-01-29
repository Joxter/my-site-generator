import { selectAll } from "css-select";
import css from "css";

export function scopedStyles(Components) {
  Object.values(Components).forEach(comp => makeUniq(comp));
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
    } else {
      rule.selectors = rule.selectors.map(selector => modifyRule(selector, component));
    }
  });

  component.styles.children[0].data = css.stringify(cssData);
}

function modifyRule(selector, component) {
  if (selector.includes("#")) {
    return selector;
  }

  const unicClass = "-c-" + component.uid;

  selectAll("*", component.template).forEach(node => { // todo remove selectAll dep
    if (!node.attribs.class) {
      node.attribs.class = unicClass;
    } else {
      node.attribs.class += ` ${unicClass}`;
    }
  });

  return __unic(selector, unicClass);
}

export function __unic(selector, salt) {
  const isEndOfBLock = char => [" ", "+", "~", ">"].includes(char);
  const arr = selector.split("");

  let i = 0;
  let state = "block-end"; // 'matter-start' 'block-end' 'pseudo-start' 'attr-start'

  while (i < arr.length && i < 1000) {
    // something like state-machine
    const char = arr[i];
    if (char.length > 1) {
      i++;
      continue;
    }

    if (char === "*") {
      arr[i] = `.${salt}`;
      continue;
    }

    if (state === "block-end") {
      if (/[\w.]/i.test(char)) {
        state = "matter-start";

        if (arr[i + 1] === undefined) {
          state = "block-end";
          arr.splice(i + 1, 0, `.${salt}`);

          i++;
          continue;
        }
      }

      i++;
      continue;
    }

    if (state === "pseudo-start") {
      if (isEndOfBLock(char)) {
        state = "block-end";
        i++;
        continue;
      }
    }

    if (state === "matter-start") {
      if (isEndOfBLock(char)) {
        state = "block-end";
        arr.splice(i, 0, `.${salt}`);

        i++;
        continue;
      }

      if (char === ":") {
        state = "pseudo-start";
        arr.splice(i, 0, `.${salt}`);

        i++;
        continue;
      }

      if (arr[i + 1] === undefined) {
        state = "block-end";
        arr.splice(i + 1, 0, `.${salt}`);

        i++;
        continue;
      }

      i++;
      continue;
    }
    i++;
  }

  return arr.join("");
}