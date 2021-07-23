import { h, using, list, spec } from "forest";
import {
  $data,
  $result,
  $tabs,
  $viewCode,
  addComponent,
  componentTabClicked,
  dataEdited,
  userCodeEdited,
} from "./model/model.js";

using(document.querySelector(".code-input"), () => {
  h("textarea", () => {
    spec({
      handler: { input: userCodeEdited },
      attr: { value: $viewCode },
    });
  });
});

const domRes = document.querySelector("#result iframe");
$result.watch((code) => {
  domRes.srcdoc = code;
});

using(document.querySelector(".code-data"), () => {
  h("textarea", () => {
    spec({
      handler: { input: dataEdited },
      text: $data,
    });
  });
});

using(document.querySelector(".code-tabs"), () => {
  h("button", () => {
    spec({
      attr: { class: "code-tab" },
      handler: { click: componentTabClicked.prepend(() => "page") },
      text: "page",
    });
  });
  list({
    source: $tabs,
    fn: ({ store: tabName }) => {
      h("button", () => {
        spec({
          attr: { class: "code-tab" },
          handler: { click: componentTabClicked.prepend((ev) => ev.target.innerHTML) },
          text: tabName,
        });
      });
    },
  });
  h("button", () => {
    spec({
      attr: { class: "add-tab" },
      handler: { click: addComponent },
      text: "+ add component",
    });
  });
});
