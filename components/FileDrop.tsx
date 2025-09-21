"use client";

import { useRef, DragEvent, useState } from "react";
import clsx from "clsx";

interface FileDropProps {
  label: string;
  accept: string;
  maxSize: number; // bytes
  file?: File;
  preview?: string; // URL for image preview
  onFileSelect: (file: File) => void;
  isImage?: boolean; // true if preview should be shown as <img>
}

function FileDrop({
  label,
  accept,
  maxSize,
  file,
  preview,
  onFileSelect,
  isImage = false,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (!e.dataTransfer.files?.length) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile.size > maxSize) {
      alert(`${label} must be smaller than ${maxSize / 1024 / 1024}MB`);
      return;
    }
    onFileSelect(droppedFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > maxSize) {
      alert(`${label} must be smaller than ${maxSize / 1024 / 1024}MB`);
      return;
    }
    onFileSelect(selectedFile);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={clsx(
        "border-2 border-dashed rounded p-6 text-center cursor-pointer transition mb-1",
        dragActive ? "border-red-500 bg-red-50" : "border-gray-300"
      )}
    >
      {preview && isImage ? (
        <img src={preview} alt="Preview" className="max-h-40 mx-auto mb-2" />
      ) : file ? (
        <p className="text-green-700 text-sm truncate">{file.name}</p>
      ) : (
        <p className="text-gray-500 text-sm">{label}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleChange}
      />
    </div>
  );
}

export { FileDrop };
