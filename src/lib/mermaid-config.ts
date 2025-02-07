import mermaid from "mermaid";

export type MermaidTheme = 
  | "default" 
  | "forest" 
  | "dark" 
  | "neutral" 
  | "base";

const defaultConfig = {
  startOnLoad: false,
  securityLevel: "strict",
  theme: "default",
  logLevel: "error",
  mermaid: "11.4.1",
  fontFamily: "arial",
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
} as const;

let currentTheme: MermaidTheme = "default";
const svgCache = new Map<string, string>();

export const initializeMermaid = async (theme: MermaidTheme = "default") => {
  currentTheme = theme;
  
  mermaid.initialize({
    ...defaultConfig,
    theme,
  });
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
    // Initialize with current theme
    mermaid.initialize({
      ...defaultConfig,
      theme: currentTheme
    });
    
    // First try parsing
    try {
      await mermaid.parse(diagram);
    } catch (parseError) {
      console.error('Mermaid parse error:', parseError);
      throw parseError;
    }
    
    // Generate unique ID
    const uniqueId = `mermaid-${elementId.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear previous content
    element.innerHTML = '';
    
    // Render if parsing succeeded
    try {
      const { svg } = await mermaid.render(uniqueId, diagram);
      
      if (svg) {
        element.innerHTML = svg;
      } else {
        throw new Error('Failed to generate SVG');
      }
    } catch (renderError) {
      console.error('Mermaid render error:', renderError);
      throw renderError;
    }
  } catch (error) {
    console.error('Failed to render diagram:', error);
    throw error;
  }
};

export const changeTheme = async (theme: MermaidTheme) => {
  if (currentTheme === theme) return;
  
  currentTheme = theme;
  await initializeMermaid(theme);
  
  // Clear cache when theme changes
  svgCache.clear();
};

export const getCurrentTheme = (): MermaidTheme => currentTheme; 