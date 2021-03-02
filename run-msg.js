import { readdirSync, readFileSync, writeFileSync, unlink } from "fs";
import commandLineArgs from "command-line-args";
import { msg } from "./src";

const optionDefinitions = [
  { name: "components", alias: "c", type: String },
  { name: "page", alias: "p", type: String },
];

const options = commandLineArgs(optionDefinitions);
// node ./src/run-msg.js -v ./components -p ./page/index.html
// { components: './components', page: './page/index.html' }

console.log(options);

const page = readFileSync("./demo/index.html").toString();
const components = readdirSync("./demo/components").map(name => {
  return readFileSync(`./demo/components/${name}`).toString();
});

const result = msg(components, page, {}, {cssInline: true});

// console.log(result.html);
writeFileSync("./demo/result/index.html", result.html);
// writeFileSync("./demo/result/style.css", result.css);
// console.log();
