"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareCard } from "@/components/ShareCard";
import type { ProjectionResults } from "@/lib/types";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: ProjectionResults;
  platform: 'facebook' | 'reddit';
}

export function ShareModal({ open, onOpenChange, results, platform }: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      // Generate and download image for Facebook/Reddit
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `caseload-calculator-${platform}-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          onOpenChange(false);
        }
      }, "image/png");
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Share via {platform === 'facebook' ? 'Facebook' : 'Reddit'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Live Preview */}
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
            <p className="text-base font-semibold text-gray-700 mb-4 text-center">
              Preview
            </p>
            <div
              className="w-full overflow-hidden relative mx-auto"
              style={{
                height: "315px",
                maxWidth: "100%"
              }}
            >
              <div
                style={{
                  transform: "scale(0.5)",
                  transformOrigin: "top center",
                  position: "absolute",
                  left: "50%",
                  top: "0",
                  marginLeft: "-600px",
                }}
              >
                <div ref={cardRef}>
                  <ShareCard results={results} platform={platform} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 bg-[#FAB5A7] hover:bg-[#FAB5A7]/90 text-black"
            >
              {isGenerating ? "Generating..." : "Download Image"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
