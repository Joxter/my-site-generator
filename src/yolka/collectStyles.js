/*
 *
 *
 *
 *
 *
 * */
export function collectStyles(Components, pageComponent) {
  let result = [];
  // todo собирать стили со всех дочерних компонентов и только один раз
  //      Вообще сначала нужно собрать имена всех компонентов которые используются, потому уже собирать стили
  //      как сделано в msg

  pageComponent.dependsOn.forEach((compName) => {
    if (Components[compName].style) {
      result.push(Components[compName].style);
    }
  });

  return result.join("\n");
}
