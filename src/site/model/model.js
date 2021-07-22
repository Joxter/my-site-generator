import { combine, createEvent, createStore, sample } from "effector";
import { EMPTY_PAGE, GET_EMPTY_COMPONENT } from "./constants.js";

let $pageCode = createStore(EMPTY_PAGE);
let $componentsCode = createStore([]); // {[name]: "code",...}
let $selectedComponent = createStore("page");
let $data = createStore("");

let addComponent = createEvent();
let componentTabClicked = createEvent();
let userCodeEdited = createEvent();

export let $viewCode = combine($pageCode, $componentsCode, $selectedComponent, (pageCode, componentsCode, selected) => {
  return selected === "page" ? pageCode : componentsCode[selected];
});

$selectedComponent.on(componentTabClicked, (state, ev) => {
  console.log(ev);
});

$componentsCode
  .on(addComponent, (state) => {
    const newComponent = GET_EMPTY_COMPONENT();

    return {
      ...state,
      [newComponent.name]: newComponent.code,
    };
  })
  .on(
    sample($selectedComponent, userCodeEdited, (s, p) => [s, p]),
    (state, [selected, ev]) => {
      if (state[selected]) {
        return {
          [selected]: ev.target.value,
        };
      }
    }
  );

$pageCode.on(
  sample($selectedComponent, userCodeEdited, (s, p) => [s, p]),
  (state, [selected, ev]) => {
    if (selected === "page") {
      return ev.target.value;
    }
  }
);
