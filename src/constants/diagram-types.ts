export interface DiagramType {
  name: string;
  image: string;
}

export const DIAGRAM_TYPES: DiagramType[] = [
  {
    name: "Mind Maps",
    image: "/about/mindmap.svg",
  },
  {
    name: "Timelines",
    image: "/about/timeline.svg",
  },
  {
    name: "ZenUML",
    image: "/about/ZenUML.svg",
  },
  {
    name: "Sankey",
    image: "/about/sankey.svg",
  },
  {
    name: "XY Charts",
    image: "/about/xydiagram.svg",
  },
  {
    name: "Packet Diagrams",
    image: "/about/packet.svg",
  },
  {
    name: "Architecture",
    image: "/about/architecture.svg",
  },
];
