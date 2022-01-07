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
    // todo когда-нибудь тут будет prerender

    return {
      render(data = {}) {
        let resPages = [];

        pageComponents.forEach((pageComponent) => {
          try {
            resPages.push(render(Components, pageComponent, data));
          } catch (err) {
            resPages.push([`Error! ${err.message}`, { error: err }]);
          }
        });
        let [common, pageStyles] = collectStyles(Components, resPages);

        return {
          pages: resPages.map(([html]) => html),
          common: {
            css: common,
            pages: pageStyles,
          },
        };
      },
    };
  };
}
