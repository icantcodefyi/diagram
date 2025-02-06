"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle diagram generation
    console.log("Generating diagram for:", prompt);
  };

  return (
    <div className="container mx-auto min-h-screen p-4">
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <h1 className="text-center text-3xl font-bold">Generate Diagram</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-48 w-full p-4"
              placeholder="Describe the diagram you want to generate..."
            />
            <div className="flex justify-end">
              <Button variant="primary" type="submit">Generate</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
