# Diagram Generator

An AI-powered diagram generation tool that uses Gemini and Mermaid.js to create beautiful, accurate diagrams from natural language descriptions.

## 🌟 Features

- **AI-Powered Diagram Generation**: Leverages Gemini AI to understand natural language descriptions and convert them into diagrams
- **Multiple Diagram Types**: Supports 20+ different diagram types including:
  - Flowcharts
  - Sequence Diagrams
  - Class Diagrams
  - Entity Relationship Diagrams
  - State Diagrams
  - Gantt Charts
  - Git Graphs
  - And more!
- **Smart Type Detection**: Automatically determines the most suitable diagram type for your description
- **Validation & Error Handling**: Ensures generated diagrams are syntactically correct and renders properly
- **Modern UI/UX**: Beautiful and responsive interface built with Next.js and Tailwind CSS
- **Real-time Preview**: Instant visualization of generated diagrams
- **Export Options**: Save diagrams in various formats

## 🚀 Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini AI
- **Diagram Rendering**: Mermaid.js
- **Database**: Prisma with PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Radix UI, Tailwind CSS
- **Development**: ESLint, Prettier, TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Google Cloud API Key (for Gemini AI)

## 🛠️ Setup

1. Clone the repository:
```bash
git clone https://github.com/icantcodefyi/diagram.git
cd diagram
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
- Database URL
- Google Cloud API Key
- Other necessary credentials

4. Set up the database:
```bash
bun db:generate
bun db:push
```

5. Start the development server:
```bash
bun dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

1. Visit the application in your browser
2. Enter a natural language description of the diagram you want to create
3. The AI will automatically determine the best diagram type and generate the appropriate Mermaid.js code
4. Preview the diagram in real-time
5. Export or share your diagram as needed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=icantcodefyi/diagram&type=Date)](https://star-history.com/#icantcodefyi/diagram&Date)