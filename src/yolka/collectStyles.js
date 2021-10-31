import { commonInArrs } from "../utils.js";

export function collectStyles(Components, resPages) {
  let usedComponents = resPages.map(([, opts]) => [...opts.pageMeta.usedComponents]);

  let common = commonInArrs(usedComponents);

  let byPages = usedComponents.map((pageComponents) => {
    return pageComponents.filter((it) => !common.includes(it));
  });

  return [
    common.map((compName) => Components[compName].style).join("\n"),
    byPages.map((page) => {
      return page.map((compName) => Components[compName].style).join("\n");
    }),
  ];
}
