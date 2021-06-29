import { parse } from "./parser.js";
import { render } from "./render.js";

export function yolka(componentStrs, pageStrs, options = {}, data = {}) {
  if (!Array.isArray(componentStrs)) throw new Error("components should be an array");
  if (!Array.isArray(pageStrs)) throw new Error("pages should be an array");

  const [Components, pageElements] = parse(componentStrs, pageStrs);

  // console.log(Components);
  // console.log(pageElements);

  const resPages = pageElements.map(pageEL => render(Components, pageEL.template, data));

  return { pages: resPages };
}
