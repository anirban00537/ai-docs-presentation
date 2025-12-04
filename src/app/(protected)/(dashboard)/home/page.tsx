"use client";

import * as React from "react";
import {
  Plus,
  Settings2,
  Send,
  Mic,
  X,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppleButton } from "@/components/editor/apple-button";

const PromptBox = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);

  React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);

  React.useLayoutEffect(() => {
    const textarea = internalTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (props.onChange) props.onChange(e);
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasValue = value.trim().length > 0 || imagePreview;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-3 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:border-border/30 dark:from-background dark:via-background dark:to-muted/10 w-full min-w-0",
        "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {imagePreview && (
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <div className="relative mb-2 w-fit rounded-2xl overflow-hidden">
            <button
              type="button"
              className="transition-transform hover:scale-105"
              onClick={() => setIsImageDialogOpen(true)}
            >
              <img
                src={imagePreview}
                alt="Image preview"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            </button>
            <button
              onClick={handleRemoveImage}
              className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 dark:bg-background/90 text-foreground shadow-md transition-colors hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <DialogContent className="max-w-4xl">
            <img
              src={imagePreview}
              alt="Full size preview"
              className="w-full max-h-[90vh] object-contain rounded-2xl"
            />
          </DialogContent>
        </Dialog>
      )}

      <textarea
        ref={internalTextareaRef}
        rows={1}
        value={value}
        onChange={handleInputChange}
        placeholder="Describe your presentation idea..."
        className="custom-scrollbar relative z-10 w-full resize-none border-0 bg-transparent p-3 text-foreground placeholder:text-muted-foreground focus:ring-0 focus-visible:outline-none min-h-[3rem] text-base leading-relaxed"
        {...props}
      />

      <div className="mt-1 flex items-center gap-2 px-1">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handlePlusClick}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">Attach image</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Attach image</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Settings2 className="h-4 w-4" />
                    <span>Tools</span>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Explore Tools</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span>AI Enhance</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Add Media</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings2 className="h-4 w-4" />
                <span>Customize Theme</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Mic className="h-5 w-5" />
                  <span className="sr-only">Record voice</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Record voice</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <AppleButton
                  type="submit"
                  variant="primary"
                  size="default"
                  disabled={!hasValue}
                  className="h-9 w-9 p-0"
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Create presentation</span>
                </AppleButton>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Create presentation</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
});

PromptBox.displayName = "PromptBox";

export default function HomePage() {
  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 md:py-20">
        {/* Premium Title Section */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            What Presentations do you want to create today?
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Describe your idea and let AI create stunning, professional
            presentations in seconds
          </p>
        </div>

        {/* Premium Prompt Box */}
        <div className="relative mb-8">
          {/* Glow effect behind the box */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50 animate-pulse pointer-events-none" />

          <PromptBox />
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">Try:</span>
          {[
            "Business pitch deck",
            "Product launch",
            "Educational slides",
            "Marketing campaign",
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
