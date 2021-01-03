import { using, spec, h } from "forest";
import { validateButtonClicked } from "./validateHtml";
import { $input, codeChanged } from "./model";
import {
  iframeLoaded,
  updateIframeContent,
  $isSourceCode,
  toggleSourceCode,
} from "./updateIframeContent";

export function render(target) {
  using(target, () => {
    h("div", () => {
      spec({
        attr: { class: "main-layout" },
      });

      h("p", {
        text: "Intut",
      });
      h("div", () => {
        h("label", () => {
          h("input", {
            attr: { type: "checkbox", checked: $isSourceCode },
            handler: { change: toggleSourceCode.prepend(e => e.target.checked) },
          });
          spec({
            text: "view source",
          });
        });
      });

      h("div", () => {
        h("textarea", () => {
          spec({
            handler: { input: codeChanged },
            attr: { class: "user-input" },
            text: $input,
          });
        });
      });

      h("div", () => {
        spec({
          attr: {
            class: "output-container",
          },
        });

        h("iframe", () => {
          spec({
            attr: {
              id: "out-frame",
              style: "width:100%; height: 100%; border: 0",
            },
          });
        });
      });

      h("div", () => {
        spec({
          attr: {
            class: "left-actions",
          },
        });
        h("button", {
          handler: { click: validateButtonClicked },
          text: "Verify",
        });
        h("button", {
          handler: { click: updateIframeContent },
          text: "Run",
        });
      });

      h("div", () => {
        h("span", { text: "none" });
      });
    });
  });

  setTimeout(() => {
    const frame = document.querySelector("#out-frame");

    frame.contentDocument.body.style.margin = "0";

    iframeLoaded(frame.contentDocument.body);
  }, 100);
}
