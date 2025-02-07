import mermaid from "mermaid";

export type MermaidTheme = 
  | "default" 
  | "forest" 
  | "dark" 
  | "neutral" 
  | "base";

const defaultConfig = {
  startOnLoad: true,
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
} as const;

let initialized = false;
let currentTheme: MermaidTheme = "default";
const svgCache = new Map<string, string>();

export const initializeMermaid = async (theme: MermaidTheme = "default") => {
  currentTheme = theme;
  
  mermaid.initialize({
    ...defaultConfig,
    theme,
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
    // Ensure Mermaid is initialized with current theme
    await initializeMermaid(currentTheme);
    
    // Check cache first - include theme in cache key
    const cacheKey = `${diagram}-${elementId}-${currentTheme}`;
    const cachedSvg = svgCache.get(cacheKey);
    
    if (cachedSvg) {
      element.innerHTML = cachedSvg;
      return;
    }
    
    // Generate a unique ID for this render using elementId to ensure uniqueness
    const uniqueId = `mermaid-${elementId.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear previous content
    element.innerHTML = '';
    
    try {
      // Re-initialize mermaid with current theme before rendering
      mermaid.initialize({
        ...defaultConfig,
        theme: currentTheme
      });
      
      // If parsing succeeds, render the diagram
      const { svg } = await mermaid.render(uniqueId, diagram);
      
      if (svg) {
        element.innerHTML = svg;
        // Cache the result with theme
        svgCache.set(cacheKey, svg);
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

export const changeTheme = async (theme: MermaidTheme) => {
  if (currentTheme === theme) return;
  
  currentTheme = theme;
  await initializeMermaid(theme);
  
  // Clear cache when theme changes
  svgCache.clear();
};

export const getCurrentTheme = (): MermaidTheme => currentTheme; 