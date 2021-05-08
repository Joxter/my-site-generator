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
const page2 = readFileSync("./demo/pages/cv.html").toString();

const result = msg(
  components,
  [page1, page2],
  {
    skills: [
      { title: "JavaScript", exp: "7 years exp", text: "Have a strong understanding of fundamental things." },
      { title: "React", exp: "3 years exp", text: "Understand the good and bad parts of the React-stack." },
      { title: "HTML, CSS", exp: "8 years exp", text: "Adaptive layout, BEM, preprocessors." },
    ],
  },
  { cssInline: true }
);

writeFileSync("./demo/result/index.html", result.pages[0].html);
writeFileSync("./demo/result/cv.html", result.pages[1].html);
