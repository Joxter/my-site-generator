import { parse } from "./parser.js";
import { render } from "./render.js";

export function yolka(components, pages, options = {}, data = {}) {
  const [Components, pageElements] = parse(components, pages);

  // console.log(Components);
  // console.log(pageElements);

  const resPages = pageElements.map(pageEL => render(Components, pageEL, data));

  return { pages: resPages };
}
