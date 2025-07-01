// components/SpinningSpirals.tsx
import React, { useRef, useEffect, useState } from "react";

const SpinningSpirals: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numWraps1, setNumWraps1] = useState<number>(3.0);
  const [rotationSpeed1, setRotationSpeed1] = useState<number>(0);
  const [numWraps2, setNumWraps2] = useState<number>(3.0);
  const [rotationSpeed2, setRotationSpeed2] = useState<number>(0);
  const [rotation1, setRotation1] = useState<number>(0);
  const [rotation2, setRotation2] = useState<number>(0);

  // Define the drawSpiral function inside the component or memoize it
  const drawSpiral = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    maxRadius: number,
    numWraps: number,
    rotation: number,
    color: string,
    mirrored: boolean = false
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    numWraps = mirrored ? -numWraps : numWraps;

    const totalAngle = numWraps * Math.PI * 2;
    const steps = 1000;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = totalAngle * t + rotation;
      const radius = maxRadius * t;
      const finalAngle = angle;

      let x = centerX + radius * Math.cos(finalAngle);
      let y = centerY + radius * Math.sin(finalAngle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Ensure context is available

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(centerX, centerY) * 0.9;

      // Update rotations - use functional updates to prevent stale closures
      setRotation1((prev) => prev + rotationSpeed1 / 100);
      setRotation2((prev) => prev + rotationSpeed2 / 100);

      // Draw first spiral
      drawSpiral(
        ctx,
        centerX,
        centerY,
        maxRadius,
        numWraps1,
        rotation1,
        "#333333"
      );

      // Draw second spiral (mirrored)
      drawSpiral(
        ctx,
        centerX,
        centerY,
        maxRadius,
        numWraps2,
        rotation2,
        "#333333",
        true
      );

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    numWraps1,
    rotationSpeed1,
    numWraps2,
    rotationSpeed2,
    rotation1, // Include rotation1 and rotation2 as dependencies to trigger re-render for updates
    rotation2,
    drawSpiral // Include drawSpiral if it were to be defined outside and passed in
  ]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-10">
      <h1 className="text-3xl font-bold mb-6">Spinning Spirals</h1>

      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        className="border border-gray-300 bg-white mb-6"
      ></canvas>

      <div className="w-[500px] flex flex-row justify-between">
        <div className="w-[40%] bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-600 text-center">
            Spiral 1
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Speed: {rotationSpeed1}
            </label>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.2"
              value={rotationSpeed1}
              onChange={(e) => setRotationSpeed1(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs">
              <span>Counter-clockwise</span>
              <span>Clockwise</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Wraps: {numWraps1.toFixed(1)}
            </label>
            <input
              type="range"
              min=".5"
              max="10"
              step="0.1"
              value={numWraps1}
              onChange={(e) => setNumWraps1(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="w-[40%] bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-600 text-center">
            Spiral 2
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Speed: {rotationSpeed2}
            </label>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.2"
              value={rotationSpeed2}
              onChange={(e) => setRotationSpeed2(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs">
              <span>Counter-clockwise</span>
              <span>Clockwise</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Wraps: {numWraps2.toFixed(1)}
            </label>
            <input
              type="range"
              min=".5"
              max="10"
              step="0.1"
              value={numWraps2}
              onChange={(e) => setNumWraps2(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinningSpirals;