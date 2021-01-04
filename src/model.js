import { createStore, createEvent } from "effector";

export const codeChanged = createEvent();
export const codeLoaded = createEvent();
export const $input = createStore("");
export const $validationOutput = createStore("-");

$input.on(codeChanged, (_, e) => e.target.value).on(codeLoaded, (_, code) => code);
