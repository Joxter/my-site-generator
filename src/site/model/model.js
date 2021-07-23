import { combine, createEffect, createEvent, createStore, sample } from "effector";
import { EMPTY_PAGE, GET_EMPTY_COMPONENT } from "./constants.js";

let $pageCode = createStore(EMPTY_PAGE);
let $componentsCode = createStore({}); // {[name]: "code",...}
let $selectedComponent = createStore("page");
export let $data = createStore("");
export let $result = createStore("");

export let addComponent = createEvent();
export let componentTabClicked = createEvent();
export let userCodeEdited = createEvent();
export let dataEdited = createEvent();

const yolkaFx = createEffect(({ pages, components, data }) => {
  return fetch("http://localhost:8080/yolka", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pages, components, data }),
  }).then((res) => res.json());
});

$result.on(yolkaFx.doneData, (state, res) => {
  if (res.ok) {
    return res.ok.pages[0];
  } else {
    return res;
  }
});
$result.on(yolkaFx.failData, (state, err) => {
  return err;
});

export let $tabs = combine($pageCode, $componentsCode, (pageCode, componentsCode) => {
  return Object.keys(componentsCode);
});

export let $viewCode = combine($pageCode, $componentsCode, $selectedComponent, (pageCode, componentsCode, selected) => {
  return selected === "page" ? pageCode : componentsCode[selected];
});

$selectedComponent.on(componentTabClicked, (state, tab) => tab);

sample({
  source: [$pageCode, $componentsCode, $data],
  fn: ([pageCode, componentsCode, data]) => {
    return {
      pages: [pageCode],
      components: Object.values(componentsCode),
      data: data,
    };
  },
  target: yolkaFx,
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

$data.on(dataEdited, (state, ev) => ev.target.value);

$pageCode.on(
  sample($selectedComponent, userCodeEdited, (s, p) => [s, p]),
  (state, [selected, ev]) => {
    if (selected === "page") {
      return ev.target.value;
    }
  }
);
