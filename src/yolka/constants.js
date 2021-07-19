export const COMPONENT_ATTRS = {
  NAME: "name",
  PROPS: "props",
  SLOTS: "slots",
};

export const NODE_SPEC_ATTRS = {
  IF: "y-if",
  FOR: "y-for",
  SLOT: "slot", // todo что-то выглядит неуместно
};

export const ElementType = {
  Component: "component",
  Slot: "slot",
  Page: "page",
  Root: "root",
  Directive: "directive",
  Doctype: "doctype",
  Comment: "comment",
  CDATA: "CDATA", // "cdata" ???
  Script: "Script",
  Style: "style",
  Tag: "tag",
  Text: "text",
  TextWithData: "text-with-data",
};
