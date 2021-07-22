import { parse } from "./parser.js";
import { render } from "./render.js";
import { collectStyles } from "./collectStyles.js";
import { scopedStyles } from "./scopedStyles/index.js";

export function yolka(options = {}) {
  return function parsing(componentStrs, pageStrs) {
    if (!Array.isArray(componentStrs)) throw new Error("components should be an array");
    if (!Array.isArray(pageStrs)) throw new Error("pages should be an array");

    const [Components, pageComponents] = parse(componentStrs, pageStrs);
    scopedStyles(Components);

    return {
      render(data = {}) {
        let pageStyles = [];
        let resPages = [];

        pageComponents.forEach((pageComponent) => {
          pageStyles.push(collectStyles(Components, pageComponent));
          resPages.push(render(Components, pageComponent, data));
        });

        return {
          pages: resPages,
          common: {
            css: "", // todo просто сделать
            pages: pageStyles,
          },
        };
      },
    };
  };
}
