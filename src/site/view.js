import { h, using, list, spec } from "forest";
import {
  $data,
  $result,
  $tabs,
  $viewCode,
  addComponent,
  componentTabClicked,
  dataEdited,
  deleteComponentClicked,
  userCodeEdited,
} from "./model/model.js";
import { createEvent, forward, sample } from "effector";

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
    fn: ({ store: tabName, key }) => {
      let tabClick = createEvent();
      let deleteTabClick = createEvent();

      sample({
        source: key,
        clock: tabClick,
        target: componentTabClicked,
      });

      sample({
        source: key,
        clock: deleteTabClick,
        target: deleteComponentClicked,
      });

      h("div", () => {
        h("button", () => {
          spec({
            attr: { class: "code-tab" },
            handler: { click: tabClick },
            text: tabName,
          });
        });

        h("button", () => {
          spec({
            attr: { class: "delete-tab" },
            handler: { click: deleteTabClick },
            text: "X",
          });
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
