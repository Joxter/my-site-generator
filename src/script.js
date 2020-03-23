import { createStore, createEvent } from "effector";
import { using, spec, list, h } from "effector-dom";

using(document.querySelector("#root"), () => {
  const addLine = createEvent();
  const code = createStore(["let foo = 0"]).on(addLine, list => [
    ...list,
    `foo += ${Math.random()}`
  ]);
  const color = createStore("cornsilk").on(addLine, color => {
    switch (color) {
      case "cornsilk":
        return "aliceblue";
      case "aliceblue":
        return "cornsilk";
    }
  });

  h("section", () => {
    spec({
      style: {
        backgroundColor: color,
        padding: "1em"
      }
    });
    list(code, ({ store }) => {
      h("div", { text: store });
    });
  });
  h("section", () => {
    spec({ data: { section: "controls" } });
    h("button", {
      handler: { click: addLine },
      text: "Add line",
      style: { padding: "1em" }
    });
  });
});

function VizionSectionHeader(text) {
  h("header", () => {
    spec({ data: { vizionSectionHeader: true } });
    h("h4", {
      text
    });
  });
}
