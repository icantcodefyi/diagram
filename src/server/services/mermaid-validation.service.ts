import puppeteer from "puppeteer";
import type { ValidationResult } from "@/types/mermaid";

export async function validateMermaidDiagram(code: string): Promise<boolean> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Inject Mermaid and validation logic
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
        </head>
        <body>
          <div id="container" class="mermaid">${code}</div>
        </body>
      </html>
    `);

    // Add the validation function directly to the page context
    await page.addScriptTag({
      content: `
        window.validateDiagram = async function(diagramCode) {
          try {
            await mermaid.initialize({
              startOnLoad: false,
              securityLevel: 'strict'
            });

            await mermaid.parse(diagramCode);
            const { svg } = await mermaid.render('validate-diagram', diagramCode);
            return { isValid: !!svg, error: null };
          } catch (error) {
            return { 
              isValid: false, 
              error: error.message || 'Unknown error during validation'
            };
          }
        }
      `
    });

    // Wait for Mermaid and validation function to be ready
    await page.waitForFunction(() => 
      typeof window.mermaid !== 'undefined' && 
      typeof window.validateDiagram === 'function'
    );

    // Execute validation with proper error handling
    const results = await page.evaluate(async (diagramCode) => {
      return await window.validateDiagram(diagramCode);
    }, code) as ValidationResult;

    await browser.close();

    if (!results.isValid) {
      console.error('Mermaid validation failed:', results.error);
    }

    return results.isValid;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
} 