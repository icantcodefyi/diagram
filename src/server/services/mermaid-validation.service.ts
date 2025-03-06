import { run } from '@mermaid-js/mermaid-cli';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function validateMermaidDiagram(code: string): Promise<boolean> {
  try {
    // Write diagram to temporary file
    const tempFile = path.join(process.cwd(), 'temp-diagram.mmd') as `${string}.mmd`;
    const tempOutput = path.join(process.cwd(), 'temp-output.svg') as `${string}.svg`;
    await fs.writeFile(tempFile, code);

    // Validate using mermaid-cli run function
    await run(tempFile, tempOutput);

    // Clean up
    await fs.unlink(tempFile);
    await fs.unlink(tempOutput);
    return true;
  } catch (error) {
    console.error('Mermaid validation error:', error);
    return false;
  }
} 