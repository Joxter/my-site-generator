import { combine, createEffect, createEvent, createStore, sample } from "effector";
import { escapeHTML, getNameFromComponent } from "./utils.js";
import { getSavedData, saveData } from "./local-storage.js";

const initData = getSavedData();

let $pageCode = createStore(initData.page);
let $componentsCode = createStore(initData.components);
export let $data = createStore(initData.data);
let $selectedComponent = createStore("page");
export let $result = createStore("");
export let $showSourceCode = createStore(false);

export let addComponent = createEvent();
export let componentTabClicked = createEvent();
export let deleteComponentClicked = createEvent();
export let userCodeEdited = createEvent();
export let dataEdited = createEvent();
export let toggleSC = createEvent();

const yolkaFx = createEffect(({ page, components, data }) => {
  saveData(page, components, data);
  return fetch("http://localhost:8080/yolka", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page, components, data }),
  }).then((res) => res.json());
});

$showSourceCode.on(toggleSC, (s) => !s);

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

export const $viewResult = combine($result, $showSourceCode, (result, showSourceCode) => {
  if (!showSourceCode) {
    return result;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <title>page title</title>
</head>
<body>
  <pre>${escapeHTML(result)}</pre>
</body>
</html>`;
});

export let $tabs = $componentsCode.map((componentsCode) => {
  return componentsCode.map((code) => getNameFromComponent(code));
});

export let $viewCode = combine($pageCode, $componentsCode, $selectedComponent, (pageCode, componentsCode, selected) => {
  return selected === "page" ? pageCode : componentsCode[selected];
});

$selectedComponent.on(componentTabClicked, (state, tab) => tab);

sample({
  source: [$pageCode, $componentsCode, $data],
  clock: [userCodeEdited, dataEdited],
  fn: ([pageCode, componentsCode, data]) => {
    return {
      page: pageCode,
      components: componentsCode,
      data: data,
    };
  },
  target: yolkaFx,
});

$componentsCode
  .on(addComponent, (state) => {
    let name = `my-component-${Math.floor(Math.random() * 1000)}`;

    return [
      ...state,
      `<template name="${name}" props="" slots="">
<div>${name}</div>
<style>
</style>
</template>`,
    ];
  })
  .on(deleteComponentClicked, (state, id) => {
    let newState = [...state];
    newState.splice(id, 1);
    return newState;
  })
  .on(
    sample($selectedComponent, userCodeEdited, (s, p) => [s, p]),
    (state, [selected, ev]) => {
      if (selected !== "page") {
        let newState = [...state];
        newState[selected] = ev.target.value;
        return newState;
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
