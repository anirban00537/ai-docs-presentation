"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSavePrompt } from "@/app/(protected)/presentation/[id]/hooks/use-outline";
import { useRouter } from "next/navigation";

// --- Utility Function & Radix Primitives ---
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    showArrow?: boolean;
  }
>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow && <TooltipPrimitive.Arrow className="-my-px fill-popover" />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 5.25L12 18.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.75 12L12 5.25L5.25 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// --- The Final, Self-Contained PromptBox Component ---
interface PromptBoxProps {
  className?: string;
  name?: string;
  defaultValue?: string;
  onError?: (error: string) => void;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  ({ className, onError, defaultValue = "", ...props }, ref) => {
    const router = useRouter();
    const savePromptMutation = useSavePrompt();
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = React.useState(defaultValue);
    const [numberOfSlides, setNumberOfSlides] = React.useState<string>("5");

    // Update value when defaultValue prop changes
    React.useEffect(() => {
      if (defaultValue) {
        setValue(defaultValue);
      }
    }, [defaultValue]);

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!value.trim()) {
        onError?.("Please enter a prompt");
        return;
      }

      const slides = parseInt(numberOfSlides);
      if (isNaN(slides) || slides < 1 || slides > 50) {
        onError?.("Number of slides must be between 1 and 50");
        return;
      }

      savePromptMutation.mutate(
        {
          prompt: value.trim(),
          numberOfSlides: slides,
        },
        {
          onSuccess: (response) => {
            if (response.success && response.data?.id) {
              // Redirect to outline page
              router.push(`/create/outline/${response.data.id}`);
            } else {
              onError?.(response.message || "Failed to save prompt");
            }
          },
          onError: (err: any) => {
            onError?.(
              err?.response?.data?.message ||
                err?.message ||
                "An unexpected error occurred"
            );
          },
        }
      );
    };

    const hasValue = value.trim().length > 0;

    return (
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "flex flex-col rounded-[28px] p-2 transition-colors cursor-text",
            className
          )}
          style={{
            backgroundColor: "color-mix(in srgb, var(--secondary) 25%, var(--card))",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid color-mix(in srgb, var(--secondary) 40%, transparent)",
            boxShadow: `
              0 1px 0 0 color-mix(in srgb, var(--secondary) 30%, transparent) inset,
              0 -1px 0 0 color-mix(in srgb, var(--secondary) 20%, transparent) inset,
              0 8px 32px rgba(0, 0, 0, 0.08)
            `,
          }}
        >


          <textarea
            ref={internalTextareaRef}
            rows={1}
            value={value}
            onChange={handleInputChange}
            placeholder="Message..."
            className="custom-scrollbar w-full resize-none border-0 bg-transparent p-3 text-foreground placeholder:text-muted-foreground focus:ring-0 focus-visible:outline-none min-h-12"
            {...props}
          />

          <div className="mt-0.5 p-1 pt-0">
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Number of Slides Select */}
                <Select
                  value={numberOfSlides}
                  onValueChange={setNumberOfSlides}
                >
                  <SelectTrigger className="h-8 w-fit gap-2 px-2 text-xs border-0 bg-transparent hover:bg-secondary/20 transition-colors focus:ring-0">
                    <SelectValue placeholder="Slides" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-secondary/20">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()} className="focus:bg-secondary/20">
                        {num} {num === 1 ? "slide" : "slides"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Right-aligned buttons container */}
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-4 w-px bg-secondary/20 mr-1" />


                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="submit"
                        disabled={!hasValue || savePromptMutation.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/40"
                      >
                        {savePromptMutation.isPending ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <SendIcon className="h-6 w-6 text-bold" />
                        )}
                        <span className="sr-only">Send message</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" showArrow={true}>
                      <p>
                        {savePromptMutation.isPending
                          ? "Generating..."
                          : "Send"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </form>
    );
  }
);

PromptBox.displayName = "PromptBox";
