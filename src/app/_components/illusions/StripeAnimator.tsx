import React, { useState, useRef, useEffect, DragEvent } from "react";

// Define interfaces for better type safety
interface ImageData {
  id: number;
  dataUrl: string | ArrayBuffer | null;
}

interface ThumbnailProps {
  id: number;
  imgSrc: string | ArrayBuffer | null;
  onDelete: (id: number) => void;
  index: number;
  onDragStart: (event: DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, index: number) => void;
  draggable: boolean;
}

// Global drag state
const useDragState = (() => {
  let draggingId: number | null = null;
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const setState = (newState: { draggingId: number | null }) => {
    if (newState.draggingId !== undefined) {
      draggingId = newState.draggingId;
    }
    listeners.forEach((listener) => listener());
  };

  return {
    get draggingId() {
      return draggingId;
    },
    subscribe,
    setState,
  };
})();

// Thumbnail component
const Thumbnail: React.FC<ThumbnailProps> = ({
  id,
  imgSrc,
  onDelete,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  draggable,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const handleDragStart = (event: DragEvent<HTMLDivElement>) =>
    onDragStart(event, index);
  const handleDragOver = (event: DragEvent<HTMLDivElement>) =>
    onDragOver(event);
  const handleDrop = (event: DragEvent<HTMLDivElement>) =>
    onDrop(event, index);

  return (
    <div
      ref={ref}
      className="relative w-20 h-15 cursor-grab rounded border border-gray-300 shadow-md"
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ opacity: draggable && useDragState.draggingId === id ? 0.5 : 1 }}
    >
      <img
        src={imgSrc as string}
        alt="Thumbnail"
        className="h-full w-full object-contain"
      />
      <button
        onClick={() => onDelete(id)}
        className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-xs text-white focus:outline-none"
      >
        X
      </button>
    </div>
  );
};

const StripeAnimator: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const svgContainerRef = useRef<SVGSVGElement>(null);
  const svgStripeOverlayRef = useRef<SVGSVGElement>(null);
  const nextImageId = useRef(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
  const unsubscribe = useDragState.subscribe(() => {
    setUploadedImages((prev) => [...prev]); // Force re-render to update opacity
  });
  return () => { unsubscribe(); };
}, []);

  useEffect(() => {
    const svgContainer = svgContainerRef.current;
    const svgStripeOverlay = svgStripeOverlayRef.current;

    if (!svgContainer || !svgStripeOverlay) return;

    const goalWidth = 600;
    const lineQty = 60;
    const frames = Math.max(2, uploadedImages.length);
    const roughDensity = Math.ceil(goalWidth / lineQty);
    const density = roughDensity;
    const containerWidth = lineQty * density;
    const containerHeight = (containerWidth * 2) / 3;
    const numStripes = lineQty;
    const stripeWidth = (density * (frames - 1)) / frames;
    const animationDuration = 35; // seconds

    svgContainer.setAttribute("width", containerWidth.toString());
    svgContainer.setAttribute("height", containerHeight.toString());
    svgContainer.setAttribute(
      "viewBox",
      `0 0 ${containerWidth} ${containerHeight}`,
    );

    svgStripeOverlay.setAttribute("width", containerWidth.toString());
    svgStripeOverlay.setAttribute("height", containerHeight.toString());
    svgStripeOverlay.setAttribute(
      "viewBox",
      `0 0 ${containerWidth} ${containerHeight}`,
    );

    let styleElement = document.getElementById("stripe-animation-style");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "stripe-animation-style";
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      @keyframes moveStripes {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-${density}px);
        }
      }
      .animated-mask-stripes-group {
        animation: moveStripes ${animationDuration}s linear infinite;
      }
      .animated-overlay-stripe {
        fill: rgba(0, 0, 0, 0.7); /* Color of the moving SVG stripes */
        animation: moveStripes ${
          animationDuration / numStripes
        }s linear infinite;
      }
    `;

    // Clear existing overlay stripes
    while (svgStripeOverlay.firstChild) {
      svgStripeOverlay.removeChild(svgStripeOverlay.firstChild);
    }

    // Generate SVG rect elements for the moving overlay stripes
    for (let i = 0; i < numStripes; i++) {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("x", `${i * density}`);
      rect.setAttribute("y", "0");
      rect.setAttribute("width", `${stripeWidth}`);
      rect.setAttribute("height", "100%");
      rect.classList.add("animated-overlay-stripe");
      svgStripeOverlay.appendChild(rect);
    }

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [uploadedImages.length]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = nextImageId.current++;
        setUploadedImages((prevImages) => [
          ...prevImages,
          { id, dataUrl: reader.result },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (idToDelete: number) => {
    setUploadedImages((prevImages) =>
      prevImages.filter((imgData) => imgData.id !== idToDelete),
    );
  };

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    useDragState.setState({ draggingId: uploadedImages[index].id });
    setDraggedIndex(index);
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, dropIndex: number) => {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newImages = [...uploadedImages];
      const [draggedItem] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedItem);
      setUploadedImages(newImages);
    }
    useDragState.setState({ draggingId: null });
    setDraggedIndex(null);
  };

  const goalWidth = 600;
  const lineQty = 60;
  const frames = Math.max(2, uploadedImages.length);
  const roughDensity = Math.ceil(goalWidth / lineQty);
  const density = roughDensity;
  const containerWidth = lineQty * density;
  const containerHeight = (containerWidth * 2) / 3;
  // const numStripes = lineQty; // Already defined in useEffect, though this is a good place to recalculate if needed for render
  const stripeWidth = (density * (frames - 1)) / frames;
  const offsetDistance = density / frames;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 font-sans">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Stripe Animator</h1>
      <div className="mb-4 flex space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="rounded-md border border-gray-300 p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-8 flex max-w-2xl flex-wrap justify-center gap-3">
        {uploadedImages.map((imageData, index) => (
          <Thumbnail
            key={imageData.id}
            id={imageData.id}
            imgSrc={imageData.dataUrl}
            onDelete={handleDelete}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggable={true}
          />
        ))}
      </div>

      <div className="relative aspect-[3/2] w-full max-w-xl overflow-hidden rounded-lg border-4 border-gray-300 shadow-xl">
        {/* Main SVG for masked images */}
        <svg
          ref={svgContainerRef}
          className="absolute left-0 top-0 z-0"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            {uploadedImages.map((imageData, imageIndex) => {
              const stripeOffset = offsetDistance * imageIndex;
              return (
                <mask
                  key={`mask-${imageData.id}`}
                  id={`mask-${imageData.id}`}
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  maskUnits="userSpaceOnUse"
                  maskContentUnits="userSpaceOnUse"
                >
                  <rect
                    x="0"
                    y="0"
                    width={containerWidth}
                    height={containerHeight}
                    fill="white"
                  />
                  <g
                    className="animated-mask-stripes-group"
                    style={{ transform: `translateX(${stripeOffset}px)` }}
                  >
                    {Array.from({ length: lineQty }).map((_, i) => (
                      <rect
                        key={`mask-stripe-${imageData.id}-${i}`}
                        x={i * density}
                        y="0"
                        width={stripeWidth}
                        height={containerHeight}
                        fill="black"
                      />
                    ))}
                  </g>
                </mask>
              );
            })}
          </defs>
          {uploadedImages.map((imageData) => (
            <image
              key={`image-${imageData.id}`}
              xlinkHref={imageData.dataUrl as string}
              x="0"
              y="0"
              width={containerWidth}
              height={containerHeight}
              mask={`url(#mask-${imageData.id})`}
              preserveAspectRatio="xMidYMid meet"
            />
          ))}
        </svg>

        {/* Overlay SVG for the moving black stripes */}
        <svg
          ref={svgStripeOverlayRef}
          className="absolute left-0 top-0 z-10"
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        ></svg>
      </div>
    </div>
  );
};

export default StripeAnimator;