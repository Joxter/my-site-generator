import { readdirSync, readFileSync, writeFileSync, unlink } from "fs";
import commandLineArgs from "command-line-args";
import { yolka } from "./src/index.js";

const optionDefinitions = [
  { name: "components", alias: "c", type: String },
  { name: "page", alias: "p", type: String },
];

const options = commandLineArgs(optionDefinitions);

console.log(options);

const components = readdirSync("./demo/components").map((name) => {
  return readFileSync(`./demo/components/${name}`).toString();
});

const page1 = readFileSync("./demo/pages/index.html").toString();
const page2 = readFileSync("./demo/pages/cv.html").toString();

const result = yolka({})(components, [page1, page2]).render(
  {
    skills: [
      { title: "JavaScript", exp: "7 years exp", text: "Have a strong understanding of fundamental things." },
      { title: "React", exp: "3 years exp", text: "Understand the good and bad parts of the React-stack." },
      { title: "HTML, CSS", exp: "8 years exp", text: "Adaptive layout, BEM, preprocessors." },
    ],
  },
  { cssInline: true }
);

writeFileSync("./demo/result/index.html", result.pages[0]);
writeFileSync("./demo/result/cv.html", result.pages[1]);
