import mermaid from "mermaid";

let initialized = false;

export const initializeMermaid = async () => {
  if (initialized) return;
  
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
  
  initialized = true;
};

export const validateDiagram = async (diagram: string): Promise<boolean> => {
  try {
    const { svg } = await mermaid.render('validate-diagram', diagram);
    return !!svg;
  } catch (error) {
    console.warn('Client-side diagram validation failed:', error);
    return false;
  }
};

export const renderMermaidDiagram = async (diagram: string, elementId: string) => {
  const element = document.querySelector(elementId);
  if (!element) return;

  try {
    // Ensure Mermaid is initialized
    await initializeMermaid();
    
    // Generate a unique ID for this render
    const uniqueId = `mermaid-${Date.now()}`;
    
    // Clear previous content
    element.innerHTML = '';
    
    try {
      // First try to parse the diagram
      await mermaid.parse(diagram);
      
      // If parsing succeeds, render the diagram
      const { svg } = await mermaid.render(uniqueId, diagram);
      
      if (svg) {
        element.innerHTML = svg;
      }
    } catch (parseError) {
      console.error('Mermaid parse error:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Failed to render diagram:', error);
    throw error;
  }
}; 