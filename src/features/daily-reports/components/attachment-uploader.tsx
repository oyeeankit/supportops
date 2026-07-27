"use client";

import * as React from "react";
import { UploadCloud, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type FileItem = {
  id: string;
  file: File;
  name: string;
  size: string;
};

export function AttachmentUploader({
  onFilesChange,
}: {
  onFilesChange?: (files: File[]) => void;
}) {
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: FileItem[] = Array.from(e.target.files).map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
    }));

    const updated = [...files, ...newFiles];
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated.map((u) => u.file));
  };

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated.map((u) => u.file));
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border/80 hover:border-primary/60 dark:hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/40 dark:bg-slate-900/10 flex flex-col items-center justify-center space-y-2 group"
      >
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">
            Click to upload attachments <span className="text-muted-foreground font-normal">(Optional)</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            PNG, JPG, PDF, MP4, or LOG files up to 10MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.log,.txt"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card text-xs font-semibold"
            >
              <div className="flex items-center gap-2 min-w-0">
                <File className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[300px] text-foreground">{item.name}</span>
                <span className="text-[10px] text-muted-foreground font-normal">({item.size})</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeFile(item.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
