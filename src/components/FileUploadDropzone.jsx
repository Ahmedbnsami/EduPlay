import { useState, useRef } from 'react';
import { CloudUpload, FileText, CheckCircle2, X } from 'lucide-react';

export default function FileUploadDropzone({
  file,
  onFileSelect,
  onFileRemove,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileSelect(droppedFile);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) onFileSelect(selectedFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5 animate-fade-in-up-delay-1">
      {/* Dropzone */}
      <div
        id="file-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          comic-border
          comic-shadow-lg
          bg-surface-container
          p-10 sm:p-14
          flex flex-col items-center justify-center
          cursor-pointer
          transition-all duration-150
          ${
            isDragOver
              ? 'drag-over'
              : 'hover:bg-outline-variant/20'
          }
        `}
      >
        {/* Upload Icon */}
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center comic-border comic-shadow-sm mb-5">
          <CloudUpload className="w-7 h-7 text-white" />
        </div>

        {/* Heading */}
        <h3 className="text-xl sm:text-2xl font-black text-text-main uppercase text-center">
          Drag &amp; drop your file here
        </h3>

        <p className="text-sm text-text-muted mt-1.5 font-medium">
          or{' '}
          <span className="text-primary font-bold underline underline-offset-2">
            click to browse
          </span>
        </p>

        {/* File Type Pills */}
        <div className="flex items-center gap-2.5 mt-5">
          {['PDF', 'DOCX', 'TXT'].map((fmt) => (
            <span
              key={fmt}
              className="comic-border bg-surface-container px-3.5 py-1 text-xs font-bold uppercase text-text-main"
            >
              {fmt}
            </span>
          ))}
        </div>

        <input
          ref={fileInputRef}
          id="file-input"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Uploaded File Card */}
      {file && (
        <div
          id="uploaded-file-card"
          className="
            flex items-center justify-between
            bg-surface-container
            comic-border
            comic-shadow-sm
            px-5 py-4
            animate-fade-in-up
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/15 comic-border flex items-center justify-center">
              <FileText className="w-5 h-5 text-danger" />
            </div>

            <div>
              <p className="text-sm font-bold text-text-main">
                {file.name}
              </p>

              <p className="text-xs text-text-muted font-medium">
                {Math.ceil(file.size / 1024 / 4)} pages ·{' '}
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />

            <button
              id="remove-file-button"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="
                p-1
                text-danger
                hover:bg-danger/10
                rounded
                transition-colors
                duration-150
                cursor-pointer
              "
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}