import commandLineArgs from "command-line-args";
import { readdirSync, readFileSync } from "fs";

const optionDefinitions = [
  { name: "components", alias: "v", type: String },
  { name: "page", alias: "p", type: String },
];

const options = commandLineArgs(optionDefinitions);
// node ./src/run-msg.js -v ./components -p ./page/index.html
// { components: './components', page: './page/index.html' }

console.log(options);

// readdirSync('')