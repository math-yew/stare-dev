import React, { useRef } from "react";

interface DragAndDropUploaderProps {
  onFileChange: (file: File | null) => void;
  acceptedFileTypes?: string;
  label?: string;
}

const DragAndDropUploader: React.FC<DragAndDropUploaderProps> = ({
  onFileChange,
  acceptedFileTypes = "image/*",
  label = "Drop image here, or click to select",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div
      className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer border-gray-300 bg-white transition-colors duration-200 ease-in-out"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={label}
    >
      <input
        type="file"
        accept={acceptedFileTypes}
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-gray-600 text-lg">{label}</p>
    </div>
  );
};

export default DragAndDropUploader;