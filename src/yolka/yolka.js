import { parse } from "./parser.js";
import { render } from "./render.js";

export function yolka(options = {}) {
  return function parsing(componentStrs, pageStrs) {
    if (!Array.isArray(componentStrs)) throw new Error("components should be an array");
    if (!Array.isArray(pageStrs)) throw new Error("pages should be an array");

    const [Components, pageComponents] = parse(componentStrs, pageStrs);
    // console.log(Components);
    // console.log(pageComponents);

    return {
      render(data = {}) {
        const resPages = pageComponents.map(pageComponent => render(Components, pageComponent, data));

        return { pages: resPages };
      },
    };
  };
}
