export function getNameFromComponent(str) {
  let [_, name] = /name=(\S+) /.exec(str);

  return name.replaceAll('"', "");
}
