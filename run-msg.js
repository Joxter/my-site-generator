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

const components = readdirSync("./demo/components").map(name => {
  return readFileSync(`./demo/components/${name}`).toString();
});

const page1 = readFileSync("./demo/pages/index.html").toString();
const result1 = msg(components, page1, {}, { cssInline: true });
writeFileSync("./demo/result/index.html", result1.html);

const page2 = readFileSync("./demo/pages/cv.html").toString();
const result2 = msg(
  components,
  page2,
  {
    skills: [
      { title: "JavaScript", exp: "7 years exp", text: "Have a strong understanding of fundamental things." },
      { title: "React", exp: "3 years exp", text: "Understand the good and bad parts of the React-stack." },
      { title: "HTML, CSS", exp: "8 years exp", text: "Adaptive layout, BEM, preprocessors." },
    ],
  },
  { cssInline: true }
);
writeFileSync("./demo/result/cv.html", result2.html);
