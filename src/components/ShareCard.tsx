"use client";

import type { ProjectionResults } from "@/lib/types";

type Platform = "facebook" | "reddit";

interface ShareCardProps {
  results: ProjectionResults;
  platform: Platform;
}

export function ShareCard({ results: _results, platform: _platform }: ShareCardProps) {
  // Platform-specific dimensions (both Facebook and Reddit use 1200x630)
  const dimensions = { width: 1200, height: 630 };

  return (
    <div
      id="share-card-template"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        background: "linear-gradient(135deg, #E8D5C4 0%, #F5E6D3 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Lato, sans-serif",
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.3)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50px",
          left: "-50px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "50px 80px",
          color: "#22304B",
          textAlign: "center",
        }}
      >
        {/* Main Message */}
        <div
          style={{
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              lineHeight: "1.3",
              color: "#1E2B4D",
              marginBottom: "24px",
            }}
          >
            This is for my therapist friends
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "400",
              lineHeight: "1.5",
              color: "#22304B",
              opacity: 0.9,
            }}
          >
            Check out{" "}
            <span
              style={{
                fontWeight: "700",
                color: "#1E2B4D",
              }}
            >
              caseloadcalculator.com
            </span>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "28px",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            maxWidth: "800px",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontWeight: "500",
              lineHeight: "1.6",
              color: "#22304B",
              margin: 0,
            }}
          >
            It&apos;s a really cool tool to help you plan the financial details of your practice.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#1E2B4D",
            }}
          >
            Nesso
          </div>
        </div>
      </div>
    </div>
  );
}
