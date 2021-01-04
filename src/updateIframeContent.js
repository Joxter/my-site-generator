import { createStore, createEvent, guard, sample, merge } from "effector";
import { $input, codeChanged, codeLoaded } from "./model";
import { msg } from "./msg";

export const $iframeBody = createStore(null);
export const $iframeContent = createStore("empty");
export const $isSourceCode = createStore(true);

export const iframeLoaded = createEvent();
export const updateIframeContent = createEvent();
export const toggleSourceCode = createEvent();

$iframeBody.on(iframeLoaded, (_, bodyEl) => bodyEl);
$isSourceCode.on(toggleSourceCode, (_, checked) => checked);

sample({
  source: [$iframeBody, $input, $isSourceCode],
  clock: merge([
    guard($input, {
      filter: $iframeBody.map(el => !!el),
    }),
    toggleSourceCode,
  ]),
}).watch(([bodyEl, content, isSourceCode]) => {
  const [html, css] = msg(content);

  if (isSourceCode) {
    bodyEl.innerHTML = `<pre></pre>`;
    bodyEl.firstElementChild.innerText = `${html}\n<style>\n${css}\n</style>`;
  } else {
    bodyEl.innerHTML = `${html}\n<style>\n${css}\n</style>`;
  }
});

sample($input, codeChanged).watch(input => {
  localStorage.setItem("user-input", input);
});

iframeLoaded.watch(() => {
  const result = localStorage.getItem("user-input");

  if (result != null) {
    codeLoaded(result);
  }
});
