import { createStore, createEvent } from "effector";
import { using, spec, list, h } from "effector-dom";
import { validateFx } from "./validateHtml";

function htmpWrap(text = "EMPTY") {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>empty</title>
    </head>
    <body>${text}</body>
  </html>
  `;
}

using(document.querySelector("#root"), () => {
  const codeChanged = createEvent();
  const $input = createStore("");
  const $validationOutput = createStore("-");

  $input.on(codeChanged, (_, e) => e.target.value);

  $validationOutput
    .on(validateFx.finally, (_, { result }) => JSON.stringify(result, null, 2))
    .reset(validateFx);

  h("div", () => {
    spec({
      attr: { class: "main-layout" }
    });

    h("p", {
      text: "Intut"
    });
    h("p", {
      text: "Output"
    });

    h("div", () => {
      h("textarea", () => {
        spec({
          handler: { input: codeChanged },
          attr: { class: "user-input" },
          text: $input
        });
      });
    });

    h("div", () => {
      spec({
        attr: {
          style: "overflow:auto"
        }
      });
      h("pre", { text: $validationOutput });
    });

    h("div", () => {
      h("button", {
        handler: { click: () => validateFx(htmpWrap($input.getState())) },
        text: "Verify"
      });
      h("button", {
        text: "Save"
      });
    });

    h("div", () => {
      h("span", { text: "none" });
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
