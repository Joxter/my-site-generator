import { selectAll } from "css-select";
import css from "css";

export function scopedStyles(Components) {
  Object.values(Components).forEach(comp => makeUniq(comp));
}

function makeUniq(component) {
  if (!component.styles) {
    return;
  }

  const unicClass = "-c-" + component.uid;
  const rawStyles = component.styles.children[0].data;
  const cssData = css.parse(rawStyles);
  const cssRules = cssData.stylesheet.rules;

  selectAll("*", component.template).forEach(node => {
    // todo remove selectAll dep
    if (node.type === "tag" && ["html", "link", "style", "script", "title", "head", "meta"].includes(node.name)) {
      return;
    }

    if (!node.attribs.class) {
      node.attribs.class = unicClass;
    } else {
      node.attribs.class += ` ${unicClass}`;
    }
  });

  cssRules.forEach(rule => {
    if (rule.type === "media") {
      rule.rules.forEach(innerRule => {
        innerRule.selectors = innerRule.selectors.map(selector => modifyRule(selector, unicClass));
      });
    } else {
      rule.selectors = rule.selectors.map(selector => modifyRule(selector, unicClass));
    }
  });

  component.styles.children[0].data = css.stringify(cssData);
}

function modifyRule(selector, unicClass) {
  return __unic(selector, unicClass);
}

export function __unic(selector, salt) {
  selector = selector.trim();
  
  if (selector.includes("#")) {
    return selector;
  }

  const isEndOfBLock = char => [" ", "+", "~", ">", ":"].includes(char);
  const arr = selector.split("");

  let i = 0;
  let state = "matter-end"; // 'matter-start' 'matter-end' 'pseudo-start' 'attr-start'

  while (i < arr.length && i < 1000) {
    // something like state-machine
    // todo fix total mess here T_T
    const char = arr[i];
    if (char.length > 1) {
      i++;
      continue;
    }

    if (char === "*") {
      arr[i] = `.${salt}`;
      continue;
    }

    if (char === ":") {
      state = "pseudo-start";
      i++;
      continue;
    }

    if (state === "matter-end") {
      if (/[\w.]/i.test(char)) {
        state = "matter-start";

        if (arr[i + 1] === undefined) {
          state = "matter-end";
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
        state = "matter-end";
        i++;
        continue;
      }
    }

    if (state === "matter-start") {
      if (isEndOfBLock(char)) {
        state = "matter-end";
        arr.splice(i, 0, `.${salt}`);

        i++;
        continue;
      }

      if (arr[i + 1] === undefined) {
        state = "matter-end";
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
