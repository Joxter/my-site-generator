import { render, renderStyles } from "./render";
import { initComponents } from "./parse";

export function msg(html) {
  const [el, Components] = initComponents(html);

  let styles = new Set();

  render(Components, el.content, {}, styles);

  return `${el.innerHTML} ${renderStyles(styles)}`;
}
