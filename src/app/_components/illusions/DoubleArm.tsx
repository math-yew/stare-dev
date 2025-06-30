// components/DoubleArm.tsx
import React, { useState, useEffect, useRef } from "react";

const DoubleArm: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed1, setSpeed1] = useState<number>(0.5); // rev/s
  const [speed2, setSpeed2] = useState<number>(1); // rev/s
  const animationRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null); // Off-screen canvas for permanent trail

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const length1 = 100;
    const length2 = 80;
    let angle1 = 0;
    let angle2 = 0;

    // Create an off-screen canvas for the permanent blue trail
    trailCanvasRef.current = document.createElement("canvas");
    trailCanvasRef.current.width = canvas.width;
    trailCanvasRef.current.height = canvas.height;
    const trailCtx = trailCanvasRef.current.getContext("2d");

    if (!trailCtx) return;

    const animate = () => {
      // Clear only the main canvas to redraw black lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate angles
      angle1 += (speed1 * Math.PI * 2) / 60;
      angle2 += (speed2 * Math.PI * 2) / 60;

      // Calculate positions
      const x1 = centerX + length1 * Math.cos(angle1);
      const y1 = centerY + length1 * Math.sin(angle1);
      const x2 = x1 + length2 * Math.cos(angle2);
      const y2 = y1 + length2 * Math.sin(angle2);

      // Draw black lines (temporary, redrawn each frame)
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw center dot
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw blue trail on off-screen canvas (permanent)
      if (lastPointRef.current) {
        trailCtx.beginPath();
        trailCtx.strokeStyle = "blue";
        trailCtx.lineWidth = 1;
        trailCtx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        trailCtx.lineTo(x2, y2);
        trailCtx.stroke();
      }
      lastPointRef.current = { x: x2, y: y2 };

      // Copy the trail canvas onto the main canvas
      if(trailCanvasRef.current) ctx.drawImage(trailCanvasRef.current, 0, 0);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed1, speed2]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Also clear the trail canvas
    const trailCanvas = trailCanvasRef.current;
    if (trailCanvas) {
      const trailCtx = trailCanvas.getContext("2d");
      if (trailCtx) {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      }
    }
    lastPointRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Double Arm Art</h1>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="bg-white border border-gray-300 mb-4"
      />
      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Line Speed: {speed1.toFixed(1)} rev/s
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={speed1}
            onChange={(e) => setSpeed1(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Second Line Speed: {speed2.toFixed(1)} rev/s
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={speed2}
            onChange={(e) => setSpeed2(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <button
          onClick={handleClear}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DoubleArm;