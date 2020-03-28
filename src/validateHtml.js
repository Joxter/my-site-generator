import { createEffect, createEvent } from "effector";
import { $validationOutput, $input } from "./model";

export const validateButtonClicked = createEvent();

const validateFx = createEffect({
  handler: code => {
    return fetch("https://validator.w3.org/nu/?out=json", {
      method: "POST",
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      },
      body: code
    }).then(response => {
      return response.json().catch(() => {
        throw response;
      });
    });
  }
});

validateFx.fail.watch(({ error }) => {
  throw error;
});

$validationOutput
  .on(validateFx.finally, (_, { result }) => JSON.stringify(result, null, 2))
  .reset(validateFx);

validateButtonClicked.watch(() => {
  validateFx(htmpWrap($input.getState()));
});

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
