"use client";

import { Button } from "@/components/ui/button";
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

interface DiagramDownloadButtonProps {
  content: string;
  diagramId: string;
  name?: string | null;
  type: string;
  variant?: "default" | "secondary";
  size?: "default" | "sm";
  showLabel?: boolean;
}

export function DiagramDownloadButton({
  content,
  diagramId,
  name,
  type,
  variant = "secondary",
  size = "sm",
  showLabel = true,
}: DiagramDownloadButtonProps) {
  const { toast } = useToast();

  const handleDownloadPNG = async () => {
    try {
      let svgElement: SVGElement | null;
      if (diagramId.startsWith("modal-diagram-")) {
        svgElement = document.querySelector(`#${diagramId} svg`);
      } else {
        svgElement = document.querySelector(`#diagram-${diagramId} svg`);
      }

      if (!svgElement) {
        console.error("SVG element not found with ID:", diagramId);
        throw new Error("No diagram found");
      }

      // Get the SVG dimensions
      const svgRect = svgElement.getBoundingClientRect();

      // Higher base scale and minimum size for better quality
      const minSize = 1920; // Increased from 800 to 1920 (Full HD width)
      const baseScale = 4; // Increased base scale from 2 to 4
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

      // Ensure white background in SVG
      const background = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      background.setAttribute("width", "100%");
      background.setAttribute("height", "100%");
      background.setAttribute("fill", "white");
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

      // Draw white background
      ctx.fillStyle = "white";
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
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to download diagram",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDownloadSVG = async () => {
    try {
      // Fix the selector to work with both modal and regular diagrams
      let element: SVGElement | null;
      if (diagramId.startsWith("modal-diagram-")) {
        element = document.querySelector(`#${diagramId} svg`);
      } else {
        element = document.querySelector(`#diagram-${diagramId} svg`);
      }

      if (!element) {
        console.error("SVG element not found with ID:", diagramId);
        throw new Error("No diagram found");
      }

      const svgData = new XMLSerializer().serializeToString(element);
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
      });
    } catch (err) {
      console.error("SVG download error:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to download diagram",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Download className="h-4 w-4" />
          {showLabel && "Download"}
          <ChevronDown className="h-4 w-4" />
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
