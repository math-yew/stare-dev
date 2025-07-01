import React, { useRef, useEffect, useState } from 'react';

// Define an interface for the pattern structure
interface Pattern {
  id: number;
  angle1: number;
  angle2: number;
  angle3: number;
  angle4: number;
  midPoint1: number;
  midPoint2: number;
  midPoint3: number;
  midPoint4: number;
}

const GradientPattern: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle1, setAngle1] = useState<number>(45);
  const [angle2, setAngle2] = useState<number>(45);
  const [angle3, setAngle3] = useState<number>(45);
  const [angle4, setAngle4] = useState<number>(45);
  const [midPoint1, setMidPoint1] = useState<number>(50);
  const [midPoint2, setMidPoint2] = useState<number>(50);
  const [midPoint3, setMidPoint3] = useState<number>(50);
  const [midPoint4, setMidPoint4] = useState<number>(50);
  const [savedPatterns, setSavedPatterns] = useState<Pattern[]>([]);

  // Update the canvas whenever pattern changes
  useEffect(() => {
    updateCanvas();
  }, [angle1, angle2, angle3, angle4, midPoint1, midPoint2, midPoint3, midPoint4]);

  const updateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Ensure context is not null

    const tileSize = 15;
    const canvasWidth = 600;
    const canvasHeight = 600;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Function to draw a single gradient tile
    const drawGradientTile = (
      x: number,
      y: number,
      angle: number,
      midPoint: number,
      startColor: string,
      endColor: string
    ) => {
      // Convert angle to radians
      const rad = (angle * Math.PI) / 180;
      // Calculate gradient start and end points for a 15x15 tile
      const length = Math.sqrt(2) * tileSize;
      const x1 = x + tileSize / 2 - (Math.cos(rad) * length) / 2;
      const y1 = y + tileSize / 2 - (Math.sin(rad) * length) / 2;
      const x2 = x + tileSize / 2 + (Math.cos(rad) * length) / 2;
      const y2 = y + tileSize / 2 + (Math.sin(rad) * length) / 2;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(midPoint / 100, '#555');
      gradient.addColorStop(1, endColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, tileSize, tileSize);
    };

    // Draw the 2x2 tile pattern repeatedly across the canvas
    for (let x = 0; x < canvasWidth; x += tileSize * 2) {
      for (let y = 0; y < canvasHeight; y += tileSize * 2) {
        // Tile 1: Top-left
        drawGradientTile(x, y, angle1, midPoint1, '#000', '#fff');
        // Tile 2: Top-right
        drawGradientTile(x + tileSize, y, angle3, midPoint3, '#fff', '#000');
        // Tile 3: Bottom-left
        drawGradientTile(x, y + tileSize, angle2, midPoint2, '#fff', '#000');
        // Tile 4: Bottom-right
        drawGradientTile(x + tileSize, y + tileSize, angle4, midPoint4, '#000', '#fff');
      }
    }
  };

  const savePattern = () => {
    const newPattern: Pattern = {
      id: Date.now(),
      angle1,
      angle2,
      angle3,
      angle4,
      midPoint1,
      midPoint2,
      midPoint3,
      midPoint4,
    };
    setSavedPatterns([...savedPatterns, newPattern]);
  };

  const loadPattern = (pattern: Pattern) => {
    setAngle1(pattern.angle1);
    setAngle2(pattern.angle2);
    setAngle3(pattern.angle3);
    setAngle4(pattern.angle4);
    setMidPoint1(pattern.midPoint1);
    setMidPoint2(pattern.midPoint2);
    setMidPoint3(pattern.midPoint3);
    setMidPoint4(pattern.midPoint4);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Pattern Generator</h1>

      <div className="flex gap-8 mb-8 p-4">
        <div className="flex flex-col gap-4 w-[25%]">
          <div className="p-2 shadow-xl rounded-md flex flex-col items-center">
            <h2 style={{ fontWeight: '700', fontSize: '1.2em' }}>Upper Left</h2>
            <div className="slider-group">
              <label>Angle: {angle1}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle1}
                onChange={(e) => setAngle1(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="slider-group">
              <label>Bright / Dark: {midPoint1}%</label>
              <input
                type="range"
                min="1"
                max="99"
                value={midPoint1}
                onChange={(e) => setMidPoint1(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="p-2 shadow-xl rounded-md flex flex-col items-center">
            <h2 style={{ fontWeight: '700', fontSize: '1.2em' }}>Lower Left</h2>
            <div className="slider-group">
              <label>Angle: {angle2}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle2}
                onChange={(e) => setAngle2(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="slider-group">
              <label>Bright / Dark: {midPoint2}%</label>
              <input
                type="range"
                min="1"
                max="99"
                value={midPoint2}
                onChange={(e) => setMidPoint2(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="w-[600px] h-[600px] flex flex-col justify-center w-50%]">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="border border-gray-300"
          />
          <button
            onClick={savePattern}
            className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
          >
            Save
          </button>
        </div>

        <div className="flex flex-col gap-4 w-[25%]">
          <div className="p-2 shadow-xl rounded-md flex flex-col items-center">
            <h2 style={{ fontWeight: '700', fontSize: '1.2em' }}>Upper Right</h2>
            <div className="slider-group">
              <label>Angle: {angle3}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle3}
                onChange={(e) => setAngle3(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="slider-group">
              <label>Bright / Dark: {midPoint3}%</label>
              <input
                type="range"
                min="1"
                max="99"
                value={midPoint3}
                onChange={(e) => setMidPoint3(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="p-2 shadow-xl rounded-md flex flex-col items-center">
            <h2 style={{ fontWeight: '700', fontSize: '1.2em' }}>Lower Right</h2>
            <div className="slider-group">
              <label>Angle: {angle4}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle4}
                onChange={(e) => setAngle4(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="slider-group">
              <label>Bright / Dark: {midPoint4}%</label>
              <input
                type="range"
                min="1"
                max="99"
                value={midPoint4}
                onChange={(e) => setMidPoint4(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {savedPatterns.length > 0 && (
        <div className="w-full max-w-4xl p-4 shadow-xl rounded-md">
          <h2 className="text-xl font-semibold mb-2">Saved Patterns</h2>
          <div className="flex flex-wrap gap-2">
            {savedPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => loadPattern(pattern)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center"
              >
                <div
                  className="w-8 h-8 mr-2 border border-gray-400"
                  style={{
                    background: `
                      linear-gradient(${pattern.angle1}deg, #000 0%, #555 ${pattern.midPoint1}%, #fff 100%) 0 0px / 15px 15px,
                      linear-gradient(${pattern.angle2}deg, #fff 0%, #555 ${pattern.midPoint2}%, #000 100%) 0 15px / 15px 15px,
                      linear-gradient(${pattern.angle3}deg, #fff 0%, #555 ${pattern.midPoint3}%, #000 100%) 15px 0 / 15px 15px,
                      linear-gradient(${pattern.angle4}deg, #000 0%, #555 ${pattern.midPoint4}%, #fff 100%) 15px 15px / 15px 15px
                    `,
                    backgroundRepeat: 'no-repeat',
                  }}
                ></div>
                Pattern #{savedPatterns.indexOf(pattern) + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradientPattern;