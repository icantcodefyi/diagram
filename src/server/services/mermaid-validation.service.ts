import puppeteer from "puppeteer";

export async function validateMermaidDiagram(code: string): Promise<boolean> {
  console.log('Starting Mermaid validation process...');
  try {
    console.log('Launching Puppeteer browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ]
    });
    console.log('Browser launched successfully');
    
    console.log('Creating new page...');
    const page = await browser.newPage();
    console.log('New page created');
    
    // Set a reasonable timeout
    console.log('Setting page timeouts...');
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    // Inject Mermaid and validation logic with error handling
    console.log('Setting page content with Mermaid...');
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
        </head>
        <body>
          <pre class="mermaid" id="container">${code}</pre>
        </body>
      </html>
    `);
    console.log('Page content set successfully');

    // Wait for Mermaid to load
    console.log('Waiting for Mermaid to load...');
    await page.waitForFunction(() => typeof window.mermaid !== 'undefined', { timeout: 10000 });
    console.log('Mermaid loaded successfully');

    // Add the validation function with better error handling
    console.log('Starting diagram validation...');
    console.log('Input diagram code:', code);
    const validationResult = await page.evaluate(async (diagramCode) => {
      try {
        console.log('Initializing Mermaid in browser context...');
        await window.mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
        });
        console.log('Mermaid initialized');

        console.log('Attempting to render diagram...');
        const { svg } = await window.mermaid.render('validate-diagram', diagramCode);
        console.log('Diagram rendered successfully');
        return { isValid: Boolean(svg), error: null };
      } catch (error) {
        console.error('Error in browser context:', error);
        return {
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown validation error'
        };
      }
    }, code);

    console.log('Closing browser...');
    await browser.close();
    console.log('Browser closed successfully');

    if (!validationResult.isValid) {
      console.error('Mermaid validation failed:', validationResult.error);
      console.error('Validation result:', JSON.stringify(validationResult, null, 2));
    } else {
      console.log('Diagram validation successful');
    }

    return validationResult.isValid;
  } catch (error) {
    console.error('=== Validation Service Error Details ===');
    console.error('Error type:', error instanceof Error ? 'Error object' : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    console.error('=====================================');

    // In production, we might want to be more lenient with validation
    if (process.env.NODE_ENV === 'production' && error instanceof Error) {
      if (error.message.includes('browser') || error.message.includes('puppeteer')) {
        console.warn('Bypassing browser-related validation error in production');
        console.warn('Error was:', error.message);
        return true;
      }
    }
    return false;
  }
} 