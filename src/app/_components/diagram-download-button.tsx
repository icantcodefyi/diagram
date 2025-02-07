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
      const svgElement = document.querySelector(`#diagram-${diagramId} svg`);
      if (!svgElement) throw new Error("No diagram found");

      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("Canvas context not supported");

      // Create a new image
      const img = new Image();
      img.crossOrigin = "anonymous";

      // Get the SVG dimensions
      const svgRect = svgElement.getBoundingClientRect();
      // Scale factor for higher quality (2x)
      const scale = 2;

      // Convert SVG to data URL with proper scaling
      const svgData = new XMLSerializer().serializeToString(svgElement);
      // Add width and height to the SVG string to ensure proper scaling
      const svgWithSize = svgData.replace(
        "<svg",
        `<svg width="${svgRect.width}" height="${svgRect.height}"`,
      );
      const svgBase64 = btoa(unescape(encodeURIComponent(svgWithSize)));
      const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      // Handle image loading
      img.onload = () => {
        // Set canvas dimensions with scaling
        canvas.width = svgRect.width * scale;
        canvas.height = svgRect.height * scale;

        // Apply better rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale the context to draw the image larger
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        // Convert to PNG and download with higher quality
        canvas.toBlob(
          (blob) => {
            if (!blob) throw new Error("Failed to create PNG");
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `${name ?? type}-diagram-${diagramId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
          },
          "image/png",
          1.0, // Maximum quality
        );
      };

      img.src = dataUrl;

      toast({
        title: "Success",
        description: "High-quality diagram downloaded as PNG",
        variant: "default",
        duration: 2000,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to download diagram",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const element = document.querySelector(`#diagram-${diagramId} svg`);
      if (!element) throw new Error("No diagram found");

      const svgData = new XMLSerializer().serializeToString(element);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${name ?? type}-diagram-${diagramId}.svg`;
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
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to download diagram",
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
