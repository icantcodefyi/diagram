// Specialized prompts for each diagram type to generate better visualizations
import { type DiagramType } from "./diagram";

export const DIAGRAM_PROMPTS: Record<DiagramType, string> = {
  flowchart: `Generate a flowchart that clearly shows process flow and decision points. Focus on:
- Clear start and end points
- Decision nodes with yes/no or multiple paths
- Process steps in rectangular boxes
- Proper arrow directions and flow
- Logical grouping of related steps
- Clear labels for each step and decision`,

  sequenceDiagram: `Create a sequence diagram showing interactions between systems/actors. Include:
- All participating actors/systems at the top
- Time-ordered messages flowing between participants
- Clear message labels with direction
- Activation boxes to show processing time
- Alternative paths where relevant
- Response messages
- Proper use of synchronous/asynchronous calls`,

  classDiagram: `Design a class diagram showing object-oriented structure. Include:
- Class names in PascalCase
- Attributes with proper types
- Methods with parameters and return types
- Relationships (inheritance, composition, aggregation)
- Proper visibility modifiers (+, -, #)
- Interface implementations
- Meaningful associations between classes`,

  stateDiagram: `Create a state diagram showing system states and transitions. Focus on:
- Clear initial and final states
- State names that represent conditions
- Transition events and guards
- Composite states where relevant
- Entry and exit actions
- Transition labels showing triggers/actions
- State descriptions where needed`,

  erDiagram: `Design an entity-relationship diagram for data modeling. Include:
- Entity names in singular form
- Attributes with proper data types
- Primary and foreign keys
- Relationship types (one-to-one, one-to-many, many-to-many)
- Cardinality constraints
- Optional vs required relationships
- Meaningful relationship labels`,

  gantt: `Create a Gantt chart for project timeline visualization. Include:
- Clear section definitions
- Task dependencies
- Start and end dates
- Task duration
- Milestone markers
- Parallel tasks where applicable
- Critical path identification`,

  pie: `Generate a pie chart showing data distribution. Focus on:
- Clear segment labels
- Percentage or absolute values
- Logical ordering of segments
- Title describing the data
- Limited number of segments (max 8)
- Clear value formatting
- Proper syntax for values`,

  quadrant: `Create a quadrant diagram for strategic analysis. Include:
- Clear axis labels
- Meaningful quadrant titles
- Well-distributed items
- Clear item labels
- Proper positioning
- Logical grouping
- Axis scales if relevant`,

  requirementDiagram: `Design a requirement diagram showing system specifications. Include:
- Clear requirement IDs
- Requirement types
- Dependencies between requirements
- Risk levels
- Verification method
- Status indicators
- Proper containment relationships`,

  gitgraph: `Visualize a git workflow with branches and commits. Focus on:
- Main/master branch as base
- Feature branch creation points
- Merge commits
- Cherry-picks if relevant
- Branch names and commit messages
- Proper branching strategy
- Timeline consistency`,

  c4: `Create a C4 diagram showing system architecture. Include:
- Clear system boundaries
- Component relationships
- Technology stack labels
- Data flow directions
- Security boundaries
- Interface definitions
- Clear hierarchy levels`,

  mindmap: `Design a mindmap for concept organization. Focus on:
- Central theme
- Main branches
- Sub-topics
- Logical grouping
- Hierarchical structure
- Clear labels
- Balanced distribution`,

  timeline: `Create a timeline showing chronological events. Include:
- Clear event dates
- Event descriptions
- Logical time progression
- Event categories
- Important milestones
- Period markers
- Proper time spacing`,

  zenuml: `Generate a ZenUML sequence diagram with natural syntax. Focus on:
- Actor definitions
- Method calls
- Return values
- Conditional logic
- Loops and iterations
- Error handling
- Clear message flow`,

  sankey: `Create a Sankey diagram showing flow quantities. Include:
- Clear node labels
- Flow directions
- Quantity values
- Color coding
- Source and target nodes
- Flow thickness
- Proper value distribution`,

  xy: `Generate an XY plot for data correlation. Focus on:
- Axis labels
- Data points
- Trend lines
- Scale definition
- Legend if needed
- Data point labels
- Proper value ranges`,

  packet: `Design a packet diagram showing network flow. Include:
- Protocol layers
- Packet structure
- Header information
- Payload data
- Flow direction
- Timing information
- Protocol-specific details`,

  kanban: `Create a Kanban board showing workflow status. Include:
- Clear column definitions
- Task cards
- Priority levels
- Task categories
- WIP limits
- Swimlanes if needed
- Status indicators`,

  architecture: `Design a system architecture diagram. Focus on:
- System components
- Integration points
- Data flow
- Technology stack
- Security zones
- Scalability aspects
- Infrastructure elements`
};