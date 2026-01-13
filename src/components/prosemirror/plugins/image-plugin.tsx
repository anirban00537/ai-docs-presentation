"use client";

import React, { useState, useCallback } from "react";
import { EditorView } from "prosemirror-view";
import { Node as ProseMirrorNode } from "prosemirror-model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface ImageNodeViewProps {
  node: ProseMirrorNode;
  view: EditorView;
  getPos: () => number | undefined;
  onUpdate: (attrs: { imageUrl: string; alt: string; title: string }) => void;
}

// Image placeholder card component
const ImagePlaceholder: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 hover:border-gray-400 cursor-pointer transition-all duration-200 group"
    >
      <div className="p-4 rounded-full bg-gray-200/80 group-hover:bg-gray-300/80 transition-colors">
        <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-gray-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">
          Click to add an image
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Enter a URL to display an image
        </p>
      </div>
    </div>
  );
};

// Image display component
const ImageDisplay: React.FC<{
  imageUrl: string;
  alt: string;
  onClick: () => void;
}> = ({ imageUrl, alt, onClick }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 p-6 border border-red-200 rounded-xl bg-red-50/50 cursor-pointer"
      >
        <ImageIcon className="w-6 h-6 text-red-400" />
        <p className="text-sm text-red-500">Failed to load image</p>
        <p className="text-xs text-red-400">Click to update URL</p>
      </div>
    );
  }

  return (
    <figure
      onClick={onClick}
      className="relative cursor-pointer group rounded-lg overflow-hidden"
    >
      <img
        src={imageUrl}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-auto max-h-[500px] object-contain rounded-lg transition-all duration-200 group-hover:opacity-90"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1.5 bg-white/90 rounded-full text-sm font-medium text-gray-700 shadow-sm">
            Click to edit
          </span>
        </div>
      </div>
    </figure>
  );
};

// URL input modal component
type ImageUrlModalProps = {
  open: boolean;
  initialUrl: string;
  onSubmit: (url: string) => void;
  onClose: () => void;
};

export const ImageUrlModal: React.FC<ImageUrlModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialUrl = "",
}) => {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (url.trim()) {
        onSubmit(url.trim());
        setUrl("");
      }
    },
    [url, onSubmit]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose();
        setUrl(initialUrl);
      }
    },
    [onClose, initialUrl]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Insert Image
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="image-url" className="text-sm font-medium text-gray-700">
              Image URL
            </label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Enter the URL of the image you want to insert
            </p>
          </div>
          {url && (
            <div className="border rounded-lg p-2 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img
                src={url}
                alt="Preview"
                className="max-h-32 w-auto mx-auto rounded object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Insert Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main image node component for React rendering
interface ImageNodeComponentProps {
  imageUrl: string;
  alt: string;
  onUpdateUrl: (url: string) => void;
}

export const ImageNodeComponent: React.FC<ImageNodeComponentProps> = ({
  imageUrl,
  alt,
  onUpdateUrl,
}) => {
  const [modalOpen, setModalOpen] = useState(!imageUrl);

  const handleClick = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (url: string) => {
      onUpdateUrl(url);
      setModalOpen(false);
    },
    [onUpdateUrl]
  );

  const handleClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div className="my-2" contentEditable={false}>
      {imageUrl ? (
        <ImageDisplay imageUrl={imageUrl} alt={alt} onClick={handleClick} />
      ) : (
        <ImagePlaceholder onClick={handleClick} />
      )}
      <ImageUrlModal
        open={modalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialUrl={imageUrl}
      />
    </div>
  );
};
