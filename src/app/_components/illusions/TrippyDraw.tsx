// components/TrippyDraw.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import html2canvas from "html2canvas";

interface Point {
  x: number;
  y: number;
}

const TrippyDraw: React.FC = () => {
  const bottomCanvasRef = useRef<HTMLCanvasElement>(null);
  const middleCanvasRef = useRef<HTMLCanvasElement>(null);
  const topCanvasRef = useRef<HTMLCanvasElement>(null);
  const patternRef = useRef<HTMLDivElement>(null); // Type for div element
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [showIllusion, setShowIllusion] = useState<boolean>(false);
  const lastPoint = useRef<Point | null>(null);

  // Initialize canvases and pattern
  useEffect(() => {
    const bottomCanvas = bottomCanvasRef.current;
    const middleCanvas = middleCanvasRef.current;
    const topCanvas = topCanvasRef.current;
    const patternDiv = patternRef.current;

    if (!bottomCanvas || !middleCanvas || !topCanvas || !patternDiv) {
      console.error("One or more canvas/pattern refs are null.");
      return;
    }

    const bottomCtx = bottomCanvas.getContext("2d");
    const middleCtx = middleCanvas.getContext("2d");
    const topCtx = topCanvas.getContext("2d");

    if (!bottomCtx || !middleCtx || !topCtx) {
      console.error("Could not get 2D context for one or more canvases.");
      return;
    }

    const patternCanvas = document.createElement("canvas");
    const patternCtx = patternCanvas.getContext("2d");

    if (!patternCtx) {
      console.error("Could not get 2D context for pattern canvas.");
      return;
    }

    patternCanvas.width = 30; // Match the pattern div dimensions
    patternCanvas.height = 30;

    // Draw pattern onto the temporary canvas
    html2canvas(patternDiv, { scale: 1, canvas: patternCanvas }).then(
      (canvas) => {
        const pattern = middleCtx.createPattern(canvas, "repeat");
        if (pattern) {
          middleCtx.fillStyle = pattern;
          middleCtx.fillRect(0, 0, 600, 600);

          // Mirror the pattern for the bottom canvas
          bottomCtx.translate(600, 0);
          bottomCtx.scale(-1, 1);
          bottomCtx.fillStyle = pattern;
          bottomCtx.fillRect(0, 0, 600, 600);
          bottomCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
        }
      }
    );

    // Set up top canvas for drawing
    topCtx.lineWidth = 30;
    topCtx.lineCap = "round";
  }, []); // Empty dependency array ensures this runs once on mount

  // Syncs the opacity (alpha channel) of the middle canvas based on the top canvas
  const syncCanvasOpacities = useCallback(() => {
    const topCanvas = topCanvasRef.current;
    const middleCanvas = middleCanvasRef.current;
    if (!topCanvas || !middleCanvas) {
      return;
    }

    const topCtx = topCanvas.getContext("2d");
    const middleCtx = middleCanvas.getContext("2d");

    if (!topCtx || !middleCtx) {
      return;
    }

    const width = topCanvas.width;
    const height = topCanvas.height;

    const topImageData = topCtx.getImageData(0, 0, width, height);
    const middleImageData = middleCtx.getImageData(0, 0, width, height);
    const topData = topImageData.data;
    const middleData = middleImageData.data;

    for (let i = 3; i < topData.length; i += 4) {
      middleData[i] = topData[i]; // Set alpha (opacity) of middle canvas to match top
    }

    middleCtx.putImageData(middleImageData, 0, 0);
  }, []); // Dependencies are stable refs

  // Handles showing/hiding the illusion effect
  useEffect(() => {
    const middleCanvas = middleCanvasRef.current;
    const patternDiv = patternRef.current;
    if (!middleCanvas || !patternDiv) return;

    const middleCtx = middleCanvas.getContext("2d");
    if (!middleCtx) return;

    if (showIllusion) {
      syncCanvasOpacities();
    } else {
      // Re-draw the original pattern on the middle canvas when illusion is off
      middleCtx.clearRect(0, 0, 600, 600);
      html2canvas(patternDiv, { scale: 1 }).then((canvas) => {
        const pattern = middleCtx.createPattern(canvas, "repeat");
        if (pattern) {
          middleCtx.fillStyle = pattern;
          middleCtx.fillRect(0, 0, 600, 600);
        }
      });
    }
  }, [showIllusion, syncCanvasOpacities]);

  // Mouse event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const topCanvas = topCanvasRef.current;
    if (!topCanvas) return;

    const rect = topCanvas.getBoundingClientRect();
    lastPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const topCtx = topCanvas.getContext("2d");
    if (topCtx) {
      topCtx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const topCanvas = topCanvasRef.current;
    if (!topCanvas || !lastPoint.current) return;

    const topCtx = topCanvas.getContext("2d");
    if (!topCtx) return;

    const rect = topCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle top canvas (drawing/erasing)
    topCtx.globalCompositeOperation = isErasing
      ? "destination-out"
      : "source-over";
    topCtx.lineWidth = isErasing ? 35 : 30;
    topCtx.strokeStyle = isErasing ? "rgba(0,0,0,1)" : "#000";
    topCtx.beginPath();
    topCtx.moveTo(lastPoint.current.x, lastPoint.current.y);
    topCtx.lineTo(x, y);
    topCtx.stroke();

    lastPoint.current = { x, y };

    // Optimization: Only sync opacity while drawing if illusion is active
    if (showIllusion) {
      syncCanvasOpacities();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-[600px] h-[600px]">
        <canvas
          ref={bottomCanvasRef}
          width={600}
          height={600}
          className="absolute top-0 left-0"
        />
        <canvas
          ref={middleCanvasRef}
          width={600}
          height={600}
          className="absolute top-0 left-0"
        />
        <canvas
          ref={topCanvasRef}
          width={600}
          height={600}
          className="absolute top-0 left-0 cursor-crosshair"
          style={{ opacity: showIllusion ? 0 : 1 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
      <div className="mt-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showIllusion}
            onChange={() => setShowIllusion(!showIllusion)}
          />
          Show Illusion
        </label>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setIsErasing(false)}
        >
          Draw
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => setIsErasing(true)}
        >
          Erase
        </button>
      </div>
      {/* Hidden pattern div - used by html2canvas to create the pattern */}
      <div
        ref={patternRef}
        className="absolute w-[30px] h-[30px] bg-gray-500 opacity-1"
        style={{
          background: `
            linear-gradient(45deg, #000 0%, #555 30%, #555 70%, #fff 100%) 0 0 / 15px 15px,
            linear-gradient(45deg, #fff 0%, #555 30%, #555 70%, #000 100%) 0 15px / 15px 15px,
            linear-gradient(45deg, #fff 0%, #555 30%, #555 70%, #000 100%) 15px 0 / 15px 15px,
            linear-gradient(45deg, #000 0%, #555 30%, #555 70%, #fff 100%) 15px 15px / 15px 15px
          `,
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default TrippyDraw;