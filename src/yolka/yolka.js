import { parse } from "./parser.js";
import { render } from "./render.js";

export function yolka(componentStrs, pageStrs, options = {}, data = {}) {
  // todo убрать options в самое начало?
  if (!Array.isArray(componentStrs)) throw new Error("components should be an array");
  if (!Array.isArray(pageStrs)) throw new Error("pages should be an array");

  const [Components, pageComponents] = parse(componentStrs, pageStrs);

  // console.log(Components);
  // console.log(pageComponents);

  const resPages = pageComponents.map(pageComponent => render(Components, pageComponent, data));

  return { pages: resPages };
}
