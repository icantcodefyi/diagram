import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { content, type } = await req.json();
    
    // Create temporary directory
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mermaid-'));
    const inputFile = path.join(tmpDir, 'input.mmd');
    const outputFile = path.join(tmpDir, 'output.png');
    
    // Write diagram content to temporary file
    await fs.writeFile(inputFile, content);
    
    // Execute mmdc command
    await execAsync(`npx -p @mermaid-js/mermaid-cli mmdc -i ${inputFile} -o ${outputFile}`);
    
    // Read the generated PNG file
    const pngBuffer = await fs.readFile(outputFile);
    
    // Clean up temporary files
    await fs.rm(tmpDir, { recursive: true });
    
    // Return the PNG file
    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${type}-diagram.png"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export diagram' }, { status: 500 });
  }
} 