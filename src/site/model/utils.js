export function getNameFromComponent(str) {
  let [_, name] = /name=(\S+) /.exec(str);

  return name.replaceAll('"', "");
}

export function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag] || tag)
  );
}
