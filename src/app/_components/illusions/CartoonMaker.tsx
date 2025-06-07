'use client';
// import Image from 'next/image';
import React, { useState, useReducer, useRef, useEffect } from "react";
import type { Dispatch } from "react";

type Frame = string;
type FramesState = Frame[];

type FrameAction =
  | { type: "ADD_FRAME"; payload: Frame }
  | { type: "UPDATE_FRAME"; index: number; payload: Frame }
  | { type: "DELETE_FRAME"; index: number }
  | { type: "REORDER_FRAMES"; startIndex: number; endIndex: number };

const frameReducer = (state: FramesState, action: FrameAction): FramesState => {
  switch (action.type) {
    case "ADD_FRAME":
      return [...state, action.payload];
    case "UPDATE_FRAME":
      return state.map((frame, i) =>
        i === action.index ? action.payload : frame
      );
    case "DELETE_FRAME":
      return state.filter((_, i) => i !== action.index);
    case "REORDER_FRAMES":
      const newFrames = [...state];
      const [removed] = newFrames.splice(action.startIndex, 1);
      newFrames.splice(action.endIndex, 0, removed);
      return newFrames;
    default:
      return state;
  }
};

export default function CartoonMaker() {
  const [frames, dispatch] = useReducer(frameReducer, [] as FramesState);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [lineWidth, setLineWidth] = useState(2);
  const [lineColor, setLineColor] = useState("#000000");
  const [frameRate, setFrameRate] = useState(3);
  const [showNeighbors, setShowNeighbors] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false); // New state for loading indicator
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevCanvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isDrawing) return; // Prevent redraw while drawing
    const canvas = canvasRef.current;
    const prevCanvas = prevCanvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;

    if (canvas && prevCanvas && nextCanvas && backgroundCanvas) {
      const ctx = canvas.getContext("2d");
      const prevCtx = prevCanvas.getContext("2d");
      const nextCtx = nextCanvas.getContext("2d");
      const backgroundCtx = backgroundCanvas.getContext("2d");

      if (ctx && prevCtx && nextCtx && backgroundCtx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        prevCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        backgroundCtx.clearRect(
          0,
          0,
          backgroundCanvas.width,
          backgroundCanvas.height
        );
        backgroundCtx.fillStyle = showNeighbors ? "#ffffff00" : "#ffffff";
        backgroundCtx.fillRect(
          0,
          0,
          backgroundCanvas.width,
          backgroundCanvas.height
        );

        if (frames[currentFrame]) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = frames[currentFrame];
        }

        if (showNeighbors) {
          if (currentFrame > 0 && frames[currentFrame - 1]) {
            const prevImg = new Image();
            prevImg.onload = () => {
              prevCtx.drawImage(prevImg, 0, 0);
              const imageData = prevCtx.getImageData(
                0,
                0,
                prevCanvas.width,
                prevCanvas.height
              );
              for (let i = 0; i < imageData.data.length; i += 4) {
                if (
                  imageData.data[i + 3] > 0 &&
                  (imageData.data[i] < 255 ||
                    imageData.data[i + 1] < 255 ||
                    imageData.data[i + 2] < 255)
                ) {
                  imageData.data[i] = 0;
                  imageData.data[i + 1] = 0;
                  imageData.data[i + 2] = 255;
                }
              }
              prevCtx.putImageData(imageData, 0, 0);
            };
            prevImg.src = frames[currentFrame - 1];
          }

          if (currentFrame < frames.length - 1 && frames[currentFrame + 1]) {
            const nextImg = new Image();
            nextImg.onload = () => {
              nextCtx.drawImage(nextImg, 0, 0);
              const imageData = nextCtx.getImageData(
                0,
                0,
                nextCanvas.width,
                nextCanvas.height
              );
              for (let i = 0; i < imageData.data.length; i += 4) {
                if (
                  imageData.data[i + 3] > 0 &&
                  (imageData.data[i] < 255 ||
                    imageData.data[i + 1] < 255 ||
                    imageData.data[i + 2] < 255)
                ) {
                  imageData.data[i] = 255;
                  imageData.data[i + 1] = 255;
                  imageData.data[i + 2] = 0;
                }
              }
              nextCtx.putImageData(imageData, 0, 0);
            };
            nextImg.src = frames[currentFrame + 1];
          }
        }
      }
    }
  }, [currentFrame, frames, showNeighbors]);

  useEffect(() => {
    // Add a blank frame on mount if there are no frames yet
    if (frames.length === 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        dispatch({
          type: "ADD_FRAME",
          payload: canvas.toDataURL(),
        });
        setCurrentFrame(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to get coordinates from mouse or touch event
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    if ('touches' in e.nativeEvent) { // It's a TouchEvent
      const touch = e.nativeEvent.touches[0];
      const rect = canvas.getBoundingClientRect();
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else { // It's a MouseEvent
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default touch/mouse behavior (e.g., scrolling)
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        const { x, y } = getCoordinates(e, canvas);
        ctx.moveTo(x, y);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.strokeStyle = lineColor;
        // Draw a dot immediately for instant feedback
        ctx.lineTo(x + 0.01, y + 0.01);
        ctx.stroke();
        setIsDrawing(true);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default touch/mouse behavior
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.strokeStyle = lineColor;
        const { x, y } = getCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default touch/mouse behavior
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        dispatch({
          type: "UPDATE_FRAME",
          index: currentFrame,
          payload: canvas.toDataURL(),
        });
      }
    }
  };

  const addFrame = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        dispatch({
          type: "ADD_FRAME",
          payload: canvas.toDataURL(),
        });
        setCurrentFrame(frames.length);
      }
    }
  };

  const editFrame = (index: number) => {
    setCurrentFrame(index);
  };

  const deleteFrame = (index: number) => {
    dispatch({ type: "DELETE_FRAME", index });
    if (currentFrame >= frames.length - 1 && currentFrame > 0) {
      setCurrentFrame(currentFrame - 1);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, endIndex: number) => {
    e.preventDefault();
    const startIndex = parseInt(e.dataTransfer.getData("text/plain"));
    dispatch({
      type: "REORDER_FRAMES",
      startIndex,
      endIndex,
    });
  };

  let width = 600;
  let height = width * 3 / 4;

  const generateVideo = async () => {
    if (frames.length === 0) return;

    setIsGeneratingVideo(true); // Show loading indicator
    setVideoUrl(null); // Clear previous video URL

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) {
      setIsGeneratingVideo(false);
      return;
    }

    // Pre-load all images
    const loadedImages: HTMLImageElement[] = await Promise.all(
      frames.map((frameSrc) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = frameSrc;
        });
      })
    ) as HTMLImageElement[];

    const stream = offscreenCanvas.captureStream(frameRate);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setVideoUrl(URL.createObjectURL(blob));
      setIsGeneratingVideo(false); // Hide loading indicator
    };

    mediaRecorder.start();

    let frameIndex = 0;
    let lastFrameTime = performance.now();
    const frameDuration = 1000 / frameRate; // Milliseconds per frame

    const animate = (currentTime: DOMHighResTimeStamp) => {
      if (frameIndex < loadedImages.length) {
        if (currentTime - lastFrameTime >= frameDuration) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
          ctx.drawImage(loadedImages[frameIndex], 0, 0);
          frameIndex++;
          lastFrameTime = currentTime;
        }
        requestAnimationFrame(animate);
      } else {
        mediaRecorder.stop();
      }
    };

    requestAnimationFrame(animate);
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = "animation.webm";
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center">
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <div className="max-w-7xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Animation Creator
        </h1>

        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Line Width</label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Line Color</label>
            <input
              type="color"
              value={lineColor}
              onChange={(e) => setLineColor(e.target.value)}
              className="w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Frame Rate</label>
            <input
              type="number"
              min="0.1"
              max="6"
              step="0.1"
              value={frameRate}
              onChange={(e) => setFrameRate(parseFloat(e.target.value))}
              className="w-20 border rounded p-1"
            />
          </div>
          <button
            onClick={addFrame}
            className="bg-blue-500 text-white px-6 py-1 rounded hover:bg-blue-600"
          >
            +
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <div>
            <div
              className="relative"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <canvas
                ref={prevCanvasRef}
                width={width}
                height={height}
                touch-action= {"none"}
                className="absolute top-0 left-0 border rounded shadow"
              />
              <canvas
                ref={nextCanvasRef}
                width={width}
                height={height}
                style={{ opacity: 0.5 }}
                touch-action= {"none"}
                className="absolute top-0 left-0 border rounded shadow"
              />
              <canvas
                ref={backgroundCanvasRef}
                width={width}
                height={height}
                touch-action= {"none"}
                className="absolute top-0 left-0 border rounded shadow"
              />
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ opacity: showNeighbors ? 0.5 : 1 }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                touch-action= {"none"}
                className="absolute top-0 left-0 border bg-transparent rounded shadow cursor-crosshair"
              />
            </div>
          </div>

          <div className="w-32 flex flex-col gap-2">
            {frames.map((frame, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`border p-2 rounded bg-white shadow cursor-grab ${
                  index === currentFrame ? "border-blue-500" : ""
                }`}
              >
                <img src={frame} alt={`Frame ${index}`} className="w-full" />
                <div className="flex justify-between mt-1">
                  <button
                    onClick={() => editFrame(index)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteFrame(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={generateVideo}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={isGeneratingVideo} // Disable button while generating
          >
            {isGeneratingVideo ? "Generating..." : "Animate!"}
          </button>
          <div className="flex items-center ml-4">
            <input
              type="checkbox"
              checked={showNeighbors}
              onChange={(e) => setShowNeighbors(e.target.checked)}
            />
            <label className="text-sm font-medium ml-2">
              Show Neighboring Slides
            </label>
          </div>
        </div>

        {videoUrl && (
          <div className="mt-4 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Animation Preview</h2>
            <video
              src={videoUrl}
              controls
              className="w-full max-w-2xl rounded shadow"
            />
            <button
              onClick={downloadVideo}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mt-2"
            >Download</button>
          </div>
        )}
      </div>
    </div>
  );
}
