declare global {
  interface Window {
    mermaid: {
      initialize: (config: { startOnLoad: boolean; securityLevel: string }) => Promise<void>;
      parse: (code: string) => Promise<void>;
      render: (id: string, code: string) => Promise<{ svg: string }>;
    };
    validateDiagram: (code: string) => Promise<{ isValid: boolean; error: string | null }>;
  }
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
} 