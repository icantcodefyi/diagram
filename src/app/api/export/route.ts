/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const execAsync = promisify(exec);

// 5 minute cache duration
const CACHE_DURATION = 300;
// 30 second timeout for generation
const TIMEOUT = 30000;

export async function POST(req: Request) {
  try {
    const { content, type } = await req.json();
    
    // Generate content hash for caching
    const contentHash = crypto.createHash('md5').update(content).digest('hex');
    
    // Create temporary directory with unique hash
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `mermaid-${contentHash}-`));
    const inputFile = path.join(tmpDir, 'input.mmd');
    const outputFile = path.join(tmpDir, 'output.png');
    
    // Write diagram content to temporary file
    await fs.writeFile(inputFile, content);
    
    // Execute mmdc command with optimized flags
    const cmd = `npx -p @mermaid-js/mermaid-cli mmdc -i ${inputFile} -o ${outputFile} --backgroundColor white --scale 2 --pdfFit`;
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Generation timeout')), TIMEOUT);
    });
    
    await Promise.race([execAsync(cmd), timeoutPromise]);
    
    // Stream the file instead of loading it into memory
    const stream = createReadStream(outputFile);
    
    // Clean up temporary files in the background
    void fs.rm(tmpDir, { recursive: true, force: true });
    
    // Return streamed response with caching headers
    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${type}-diagram.png"`,
        'Cache-Control': `public, max-age=${CACHE_DURATION}`,
        'ETag': `"${contentHash}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    // More specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Failed to export diagram';
    return NextResponse.json({ error: errorMessage }, { 
      status: error instanceof Error && error.message === 'Generation timeout' ? 504 : 500 
    });
  }
} 