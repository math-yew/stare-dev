// components/InvertedColor.tsx
import React, { useState, useRef, useCallback } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";

interface DotPosition {
  x: number;
  y: number;
  isModal: boolean;
}

const InvertedColor: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [invertedImageSrc, setInvertedImageSrc] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  const [addDot, setAddDot] = useState<boolean>(false);
  const [dotPosition, setDotPosition] = useState<DotPosition | null>(null);
  const invertedImageRef = useRef<HTMLImageElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        invertImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const invertImage = useCallback(async (imageDataUrl: string) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("2D context not supported.");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]; // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
      }

      ctx.putImageData(imageData, 0, 0);
      setInvertedImageSrc(canvas.toDataURL());
    };
    img.src = imageDataUrl;
  }, []);

  const generateModalImage = useCallback(async () => {
    if (!invertedImageSrc) return null;

    const invertedImage = invertedImageRef.current;
    if (!invertedImage) return null; // Ensure invertedImageRef is not null

    const invertedWidth = invertedImage.width;
    const invertedHeight = invertedImage.height;
    const img = new Image();

    return new Promise<string | null>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("2D context not supported.");
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (addDot && dotPosition) {
          const dotSize = (10 / invertedWidth) * img.width;
          const modalImageDotX = (dotPosition.x / invertedWidth) * img.width;
          const modalImageDotY = (dotPosition.y / invertedHeight) * img.height;
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(modalImageDotX, modalImageDotY, dotSize, 0, 2 * Math.PI);
          ctx.fill();
        }
        resolve(canvas.toDataURL());
      };
      img.src = invertedImageSrc;
    });
  }, [invertedImageSrc, addDot, dotPosition]);

  const openModal = useCallback(async () => {
    const combinedImage = await generateModalImage();
    setModalImageSrc(combinedImage);
    setIsModalOpen(true);
    document.body.classList.add("overflow-hidden");
  }, [generateModalImage]);

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc(null);
    document.body.classList.remove("overflow-hidden");
  };

  const handleImageClick = (event: MouseEvent<HTMLImageElement>, isModal: boolean = false) => {
    if (!addDot) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDotPosition({ x, y, isModal });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Inverter
        </h1>

        <div
          className="relative border-dashed border-2 border-gray-400 rounded-lg p-6 md:p-10 text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {imageSrc ? (
            <div className="flex flex-col items-center">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="w-9/10 mx-auto rounded-md mb-4"
              />
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 005.656 0L28 32m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 005.656 0L28 32"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop an image here, or{" "}
                <span className="text-indigo-600 hover:underline">
                  click to select a file
                </span>
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>

        {invertedImageSrc && (
          <div className="mt-8 flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Inverted Image
            </h2>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={addDot}
                onChange={() => {
                  setAddDot(!addDot);
                  if (addDot) setDotPosition(null); // Clear dot when unchecked
                }}
                className="mr-2"
              />
              <span className="text-gray-800">Add Dot</span>
            </label>
            <div className="relative w-9/10 mx-auto">
              <img
                ref={invertedImageRef}
                src={invertedImageSrc}
                alt="Inverted"
                className="w-full rounded-md shadow-lg mb-4 cursor-pointer"
                onClick={(e) => handleImageClick(e, false)}
              />
              {addDot && dotPosition && !dotPosition.isModal && (
                <div
                  ref={dotRef}
                  className="absolute w-4 h-4 bg-red-500 rounded-full"
                  style={{
                    left: `${dotPosition.x}px`,
                    top: `${dotPosition.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <button
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={openModal}
              >
                Full Screen
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="relative w-full h-full flex justify-center items-center max-w-screen-lg max-h-screen-lg">
              <button
                className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 focus:outline-none"
                onClick={closeModal}
              >
                &times;
              </button>
              {modalImageSrc && (
                <img
                  src={modalImageSrc}
                  alt="Enlarged Image"
                  className="max-w-full max-h-full object-contain cursor-pointer"
                  onClick={(e) => handleImageClick(e, true)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvertedColor;