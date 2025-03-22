// Supported Mermaid diagram types with their descriptions
export const DIAGRAM_TYPES = {
  flowchart: "Process flows, workflows, and general flow diagrams",
  sequenceDiagram: "Interactions between systems, API flows, and message sequences",
  classDiagram: "Object-oriented structures, class relationships, and system architecture",
  stateDiagram: "State machines, transitions, and system states",
  erDiagram: "Database schemas, entity relationships, and data models",
  gantt: "Project timelines, schedules, and task dependencies",
  pie: "Statistical distributions and proportional data",
  quadrant: "2x2 matrices, SWOT analysis, and strategic planning",
  requirementDiagram: "System requirements, dependencies, and specifications",
  gitgraph: "Git workflows, branching strategies, and version control",
  c4: "System context, containers, components, and code architecture",
  mindmap: "Hierarchical structures, brainstorming, and concept maps",
  timeline: "Chronological events, historical data, and time-based flows",
  zenuml: "UML sequence diagrams with a more natural syntax",
  sankey: "Flow quantities, data transfers, and resource distributions",
  xy: "Scatter plots, line graphs, and data correlations",
  packet: "Network packets, protocol flows, and data transmission",
  kanban: "Project management, task organization, and workflow status",
  architecture: "System architecture, component relationships, and infrastructure"
} as const;

export type DiagramType = keyof typeof DIAGRAM_TYPES;

// Example suggestions for different diagram types
export const EXAMPLE_SUGGESTIONS: Record<DiagramType, string> = {
  flowchart: "Create a workflow showing the user registration process",
  sequenceDiagram: "Show the API communication between frontend and backend",
  classDiagram: "Describe the class structure of a blog system",
  stateDiagram: "Illustrate the states of an order processing system",
  erDiagram: "Design a database schema for a social media platform",
  gantt: "Plan the development phases of a new feature",
  pie: "Show the distribution of user types in the system",
  quadrant: "Create a risk assessment matrix",
  requirementDiagram: "Document system requirements for authentication",
  gitgraph: "Visualize the git branching strategy",
  c4: "Show the system architecture of a microservices app",
  mindmap: "Brainstorm features for a new product",
  timeline: "Display the project milestones",
  zenuml: "Describe the login sequence with detailed interactions",
  sankey: "Show data flow between system components",
  xy: "Plot user engagement over time",
  packet: "Illustrate the network protocol flow",
  kanban: "Organize development tasks by status",
  architecture: "Design the overall system infrastructure"
}; 