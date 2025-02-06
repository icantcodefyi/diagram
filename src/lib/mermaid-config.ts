import mermaid from "mermaid";

export const initializeMermaid = () => {
  mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "arial",
    logLevel: "error",
    flowchart: {
      curve: "basis",
      padding: 20,
    },
    sequence: {
      actorMargin: 50,
      messageMargin: 40,
    },
    er: {
      layoutDirection: "TB",
      minEntityWidth: 100,
    },
    journey: {
      taskMargin: 50,
    },
    gitGraph: {
      showCommitLabel: true,
    },
    c4: {
      diagramMarginY: 50,
      c4ShapeMargin: 20,
    },
  });
};

export const renderMermaidDiagram = async (diagram: string, elementId: string) => {
  const element = document.querySelector(elementId);
  if (!element) return;

  // Clear previous content
  element.innerHTML = "";

  // Create a new div for the diagram
  const diagramDiv = document.createElement("div");
  diagramDiv.className = "mermaid";
  diagramDiv.textContent = diagram;

  // Add the new div to the container
  element.appendChild(diagramDiv);

  // Render the diagram
  await mermaid.run({
    nodes: [diagramDiv],
  });
}; 