import { createStore, createEvent, guard, sample } from "effector";
import { $input, codeChanged, codeLoaded, renderPage } from "./model";

export const $iframeBody = createStore(null);
export const $iframeContent = createStore("empty");

export const iframeLoaded = createEvent();
export const updateIframeContent = createEvent();

$iframeBody.on(iframeLoaded, (_, bodyEl) => bodyEl);

sample({
  source: [$iframeBody, $input],
  clock: guard($input, {
    filter: $iframeBody.map(el => !!el),
  }),
}).watch(([bodyEl, content]) => {
  bodyEl.innerHTML = renderPage(content);
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
