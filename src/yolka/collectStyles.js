/*
 *
 *
 *
 *
 *
 * */
export function collectStyles(Components, pageComponent) {
  let result = [];
  // todo улучшить, вообще сначала нужно собрать имена всех компонентов которые используются
  //  на странице прямолинейным подсчетом, тут много работы

  pageComponent.dependsOn.forEach((compName) => {
    if (Components[compName].style) {
      result.push(Components[compName].style);
    }
  });

  return result.join("\n");
}
