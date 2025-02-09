export const removeStyles = (diagram: string): string => {
return diagram
.replace(/style\s+[^\n]+/g, "")
    .replace(/class\s+[^\n]+/g, "")
    .replace(/classDef\s+[^\n]+/g, "")
    .replace(/linkStyle\s+[^\n]+/g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();
};

export const formatDiagramCode = (code: string): string => {
  // Remove code block markers
  let formattedCode = code.replace(/```mermaid\n?|\n?```/g, "").trim();

  // Handle potential duplicate diagram type declarations
  const diagramTypes = [
    "mindmap",
    "flowchart",
    "sequenceDiagram",
    "zenuml",
    "sankey",
    "timeline",
    "xy",
    "packet",
    "kanban",
    "architecture",
    "classDiagram",
    "erDiagram",
    "gantt",
    "pie",
    "stateDiagram",
    "journey",
    "quadrant",
    "requirementDiagram",
    "gitgraph",
    "c4"
  ];
  for (const type of diagramTypes) {
    const regex = new RegExp(`${type}\\s+${type}`, "g");
    formattedCode = formattedCode.replace(regex, type);
  }

  // Remove empty lines at start and end
  return formattedCode.replace(/^\s*[\r\n]/gm, "").trim();
}; 