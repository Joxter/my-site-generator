export const EMPTY_PAGE = `<!DOCTYPE html>
<html>
<head>
  <title>page title</title>
</head>
<body>
  Hello world
</body>
</html>`;

export function getSavedData() {
  let comp = localStorage.getItem("savedComponents") || "[]";
  return {
    page: localStorage.getItem("savedPage") || EMPTY_PAGE,
    components: JSON.parse(comp),
    data: localStorage.getItem("savedData") || "",
  };
}

export function saveData(page, components, data) {
  localStorage.setItem("savedPage", page);
  localStorage.setItem("savedComponents", JSON.stringify(components));
  localStorage.setItem("savedData", data);
}
