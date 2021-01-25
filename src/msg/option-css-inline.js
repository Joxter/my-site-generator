import { appendChild, findOne } from "domutils";

export function setCssInline(page, styles) {
  const head = findOne(node => node.name === "head", page.children);

  if (head) {
    styles.forEach(style => {
      appendChild(head, style);
    });
  }
}
