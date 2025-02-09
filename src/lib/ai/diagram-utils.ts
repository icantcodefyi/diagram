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

export const cleanJsonResponse = (text: string): string => {
  // Remove markdown code block syntax and any extra whitespace
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  
  // Find the first { and last } to extract just the JSON object
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("No valid JSON object found in response");
  }
  
  return cleaned.slice(startIndex, endIndex + 1);
};