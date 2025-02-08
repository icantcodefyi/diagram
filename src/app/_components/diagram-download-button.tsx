"use client";

import { Button } from "@/components/ui/texturebutton";
import { Download, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { getCurrentTheme } from "@/lib/mermaid-config";

interface DiagramDownloadButtonProps {
  content: string;
  diagramId: string;
  name?: string | null;
  type: string;
  variant?: "minimal" | "secondary";
  size?: "default" | "sm";
  showLabel?: boolean;
  simpleMode?: boolean;
}

export function DiagramDownloadButton({
  diagramId,
  name,
  type,
  variant = "secondary",
  size = "sm",
  showLabel = true,
  simpleMode = false,
}: DiagramDownloadButtonProps) {
  const { toast } = useToast();

  const handleDownloadPNG = async () => {
    try {
      // Add a small delay to ensure the SVG is rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try multiple selectors to find the SVG
      let svgElement: SVGElement | null = null;
      const selectors = [
        `#${diagramId} svg`,
        `#diagram-${diagramId} svg`,
        `#${diagramId} .mermaid svg`,
        `#diagram-${diagramId} .mermaid svg`,
      ];

      for (const selector of selectors) {
        svgElement = document.querySelector(selector);
        if (svgElement) break;
      }

      if (!svgElement) {
        console.error("SVG element not found. Tried selectors:", selectors);
        console.log("Current diagramId:", diagramId);
        console.log("Available elements:", document.querySelectorAll("svg"));
        throw new Error("No diagram found - please try again");
      }

      // Get the current theme and set background color accordingly
      const currentTheme = getCurrentTheme();
      const isDarkTheme = ["dark", "forest"].includes(currentTheme);
      const backgroundColor = isDarkTheme ? "#0f172a" : "#ffffff"; // slate-900 for dark, white for light

      // Get the SVG dimensions
      const svgRect = svgElement.getBoundingClientRect();

      // Higher base scale and minimum size for better quality
      const minSize = 1920;
      const baseScale = 4;
      const scale = Math.max(
        baseScale,
        minSize / Math.min(svgRect.width, svgRect.height),
      );

      // Clone and enhance the SVG
      const svgClone = svgElement.cloneNode(true) as SVGElement;

      // Enhance SVG quality
      svgClone.setAttribute("width", String(svgRect.width));
      svgClone.setAttribute("height", String(svgRect.height));
      svgClone.setAttribute("shape-rendering", "geometricPrecision");
      svgClone.setAttribute("text-rendering", "geometricPrecision");

      // Add background that matches the theme
      const background = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      background.setAttribute("width", "100%");
      background.setAttribute("height", "100%");
      background.setAttribute("fill", backgroundColor);
      svgClone.insertBefore(background, svgClone.firstChild);

      // Convert SVG to a data URL with enhanced settings
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBase64 = window.btoa(unescape(encodeURIComponent(svgData)));
      const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      // Create a high-resolution canvas
      const canvas = document.createElement("canvas");
      canvas.width = svgRect.width * scale;
      canvas.height = svgRect.height * scale;

      // Get context with optimal settings
      const ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: false,
        desynchronized: true,
      });
      if (!ctx) throw new Error("Canvas context not supported");

      // Create a new image
      const img = new Image();

      // Set up image loading promise
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Set the image source
      img.src = dataUrl;

      // Wait for image to load
      await imageLoadPromise;

      // Apply high-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Use better compositing
      ctx.globalCompositeOperation = "source-over";

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scale with high-quality transform
      ctx.scale(scale, scale);

      // Draw image with crisp edges
      ctx.translate(0.5, 0.5);
      ctx.drawImage(img, 0, 0);
      ctx.translate(-0.5, -0.5);

      // Get the PNG blob with maximum quality
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 1.0),
      );

      if (!blob) throw new Error("Failed to create PNG");

      // Download the file
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${name ?? type}-diagram-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);

      toast({
        title: "Success",
        description: "High-resolution diagram downloaded as PNG",
        variant: "default",
        duration: 2000,
        className: "rounded",
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to download diagram",
        variant: "destructive",
        duration: 2000,
        className: "rounded",
      });
    }
  };

  const handleDownloadSVG = async () => {
    try {
      // Add a small delay to ensure the SVG is rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try multiple selectors to find the SVG
      let svgElement: SVGElement | null = null;
      const selectors = [
        `#${diagramId} svg`,
        `#diagram-${diagramId} svg`,
        `#${diagramId} .mermaid svg`,
        `#diagram-${diagramId} .mermaid svg`,
      ];

      for (const selector of selectors) {
        svgElement = document.querySelector(selector);
        if (svgElement) break;
      }

      if (!svgElement) {
        console.error("SVG element not found. Tried selectors:", selectors);
        console.log("Current diagramId:", diagramId);
        console.log("Available elements:", document.querySelectorAll("svg"));
        throw new Error("No diagram found - please try again");
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;

      // Get the current theme and set background color
      const currentTheme = getCurrentTheme();
      const isDarkTheme = ["dark", "forest"].includes(currentTheme);
      const backgroundColor = isDarkTheme ? "#0f172a" : "#ffffff";

      // Add background that matches the theme
      const background = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      background.setAttribute("width", "100%");
      background.setAttribute("height", "100%");
      background.setAttribute("fill", backgroundColor);
      svgClone.insertBefore(background, svgClone.firstChild);

      // Convert to string with proper dimensions
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${name ?? type}-diagram-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Diagram downloaded as SVG",
        variant: "default",
        duration: 2000,
        className: "rounded",
      });
    } catch (err) {
      console.error("SVG download error:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to download diagram",
        variant: "destructive",
        duration: 2000,
        className: "rounded",
      });
    }
  };

  return simpleMode ? (
    <Button
      variant="icon"
      size="icon"
      onClick={handleDownloadPNG}
      className="h-8 w-8"
    >
      <Download className="h-4 w-4" />
    </Button>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Download className="mr-2 h-4 w-4" />
          {showLabel && "Download"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadPNG}>
          Save as PNG
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDownloadSVG}>
          Save as SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
