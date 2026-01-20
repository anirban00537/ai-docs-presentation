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
import { useSavePrompt } from "@/app/(protected)/docs/[id]/hooks/use-outline";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSubscriptionStatus, usePlanTiers } from "@/hooks/use-subscription";
import { trackEvent } from "@/components/analytics/trackEvent";

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
        "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:card-in-from-top-2 data-[side=left]:card-in-from-right-2 data-[side=right]:card-in-from-left-2 data-[side=top]:card-in-from-bottom-2",
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

// --- The Final, Self-Contained PromptBox Component ---
interface PromptBoxProps {
  className?: string;
  name?: string;
  defaultValue?: string;
  onError?: (error: string) => void;
  onSubmit?: (value: string, numberOfCards: number) => void;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  ({ className, onError, onSubmit, defaultValue = "", ...props }, ref) => {
    const router = useRouter();
    const savePromptMutation = useSavePrompt();
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = React.useState(defaultValue);
    const { data: subscriptionStatus, isLoading: isLoadingStatus } =
      useSubscriptionStatus();
    const { data: planTiersData } = usePlanTiers();

    // Set default number of cards based on user's limit (default to 5 or their limit, whichever is lower)
    const defaultCards = React.useMemo(() => {
      if (subscriptionStatus?.slideLimit) {
        return Math.min(5, subscriptionStatus.slideLimit).toString();
      }
      return "5";
    }, [subscriptionStatus?.slideLimit]);

    const [numberOfCards, setNumberOfCards] =
      React.useState<string>(defaultCards);

    // Update numberOfCards when settings load
    React.useEffect(() => {
      if (subscriptionStatus?.slideLimit && !isLoadingStatus) {
        const currentCards = parseInt(numberOfCards);
        const limit = subscriptionStatus.slideLimit;
        // If current selection exceeds limit, reset to a valid value
        if (currentCards > limit) {
          setNumberOfCards(Math.min(5, limit).toString());
        }
      }
    }, [subscriptionStatus?.slideLimit, isLoadingStatus, numberOfCards]);

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

      const cards = parseInt(numberOfCards);
      if (isNaN(cards) || cards < 1) {
        onError?.("Please select a valid number of cards");
        return;
      }

      // Check slide limit (default to 5 for free tier)
      const slideLimit = subscriptionStatus?.slideLimit || 5;
      if (cards > slideLimit) {
        onError?.(
          `Your plan allows up to ${slideLimit} slides per document. Please upgrade to create more slides.`
        );
        return;
      }

      if (onSubmit) {
        trackEvent('prompt_submit_custom', 'engagement', `${cards}_cards`);
        onSubmit(value.trim(), cards);
        return;
      }

      trackEvent('prompt_submit_start', 'engagement', `${cards}_cards`);

      savePromptMutation.mutate(
        {
          prompt: value.trim(),
          numberOfCards: cards,
        },
        {
          onSuccess: (response) => {
            if (response.success && response.data?.id) {
              trackEvent('prompt_submit_success', 'engagement', response.data.id);
              // Redirect to outline page
              router.push(`/create/outline/${response.data.id}`);
            } else {
              // Handle API response with success: false
              const errorMessage = response.message || "Failed to save prompt";
              trackEvent('prompt_submit_fail', 'engagement', errorMessage);

              // Check if it's a credit-related error
              if (
                errorMessage.toLowerCase().includes("insufficient credits") ||
                errorMessage.toLowerCase().includes("credits")
              ) {
                toast.error(errorMessage, {
                  duration: 10000,
                  action: {
                    label: "Upgrade",
                    onClick: () => {
                      trackEvent('insufficient_credits_upgrade_click', 'engagement', 'prompt_box');
                      window.location.href = "/subscription";
                    },
                  },
                });
              } else {
                toast.error(errorMessage, { duration: 5000 });
              }

              onError?.(errorMessage);
            }
          },
          onError: (err: any) => {
            const errorMessage =
              err?.response?.data?.message ||
              err?.message ||
              "An unexpected error occurred";

            trackEvent('prompt_submit_error', 'engagement', errorMessage);
            toast.error(errorMessage, { duration: 5000 });

            onError?.(errorMessage);
          },
        }
      );
    };

    const hasValue = value.trim().length > 0;

    // --- Dynamic Placeholder Logic ---
    const placeholders = React.useMemo(
      () => [
        "Create a deck about AI in Modern Healthcare...",
        "Design a pitch for a Sustainable Fashion startup...",
        "Explain Quantum Physics to a fifth grader...",
        "Develop a marketing plan for a boutique coffee shop...",
      ],
      []
    );

    const [currentPlaceholderIndex, setCurrentPlaceholderIndex] =
      React.useState(0);
    const [placeholderText, setPlaceholderText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
      const currentFullText = placeholders[currentPlaceholderIndex];
      const typingSpeed = isDeleting ? 40 : 80;
      const pauseDuration = isDeleting ? 100 : 2000;

      const handleTyping = () => {
        if (!isDeleting && placeholderText === currentFullText) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && placeholderText === "") {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % placeholders.length
          );
        } else {
          setPlaceholderText((prev) =>
            isDeleting
              ? prev.substring(0, prev.length - 1)
              : currentFullText.substring(0, prev.length + 1)
          );
        }
      };

      const timeout = setTimeout(handleTyping, typingSpeed);
      return () => clearTimeout(timeout);
    }, [placeholderText, isDeleting, currentPlaceholderIndex, placeholders]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "flex flex-col rounded-[24px] p-2 transition-all duration-300 bg-slate-50 shadow-depth-3 border border-slate-200 focus-within:shadow-xl focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-slate-200 cursor-text",
            className
          )}
        >
          <textarea
            ref={internalTextareaRef}
            rows={1}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="custom-scrollbar w-full resize-none border-0 bg-transparent p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:outline-none min-h-12"
            {...props}
          />

          <div className="mt-0.5 p-1 pt-0">
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Number of Cards Select */}
                <Select
                  value={numberOfCards}
                  onValueChange={(v) => {
                    trackEvent('prompt_cards_change', 'engagement', v);
                    setNumberOfCards(v);
                  }}
                  disabled={isLoadingStatus}
                >
                  <SelectTrigger className="h-8 w-fit gap-2 px-2 text-xs border-0 bg-transparent hover:bg-secondary/10 transition-colors focus:ring-0">
                    <SelectValue
                      placeholder={isLoadingStatus ? "Loading..." : "Cards"}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-secondary/10 max-h-[300px]">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-secondary/10">
                      <p className="text-[10px] text-muted-foreground/70">
                        Tip: cards are like slides
                      </p>
                    </div>
                    {(() => {
                      // User's current slide limit (default to free tier: 5 slides)
                      const slideLimit = subscriptionStatus?.slideLimit || 5;

                      // Get plan tiers from API (fallback to defaults)
                      const tiers = planTiersData?.tiers || [
                        { name: "Free", planName: "free", slideLimit: 5 },
                        { name: "Go Plan", planName: "go_plan", slideLimit: 20 },
                        { name: "Plus Plan", planName: "plus", slideLimit: 35 },
                        { name: "Pro Plan", planName: "pro", slideLimit: 50 },
                      ];

                      // Generate card options: 1-20 (all numbers), then 25, 30, 35, 40, 50 (max 50)
                      const cardOptions = [
                        ...Array.from({ length: 20 }, (_, i) => i + 1),
                        25,
                        30,
                        35,
                        40,
                        50,
                      ];

                      // Helper to find which tier a card count belongs to (first tier that can accommodate it)
                      const getTierForCardCount = (cardCount: number): string | null => {
                        // If user already has access, no label needed
                        if (cardCount <= slideLimit) return null;

                        // Find the first tier that can accommodate this card count
                        // (tiers are sorted by price/slideLimit ascending)
                        for (const tier of tiers) {
                          if (cardCount <= tier.slideLimit && tier.slideLimit > slideLimit) {
                            // Extract short name from plan name (e.g., "go_plan" -> "GO", "plus" -> "PLUS")
                            const shortName = tier.planName
                              .replace(/_plan$/i, "")
                              .replace(/plan$/i, "")
                              .trim()
                              .toUpperCase();
                            return shortName || tier.name.toUpperCase();
                          }
                        }

                        // If no tier found that can accommodate, it's beyond all plans
                        return null;
                      };

                      // Map tier names to colors
                      const tierColors: Record<string, string> = {
                        GO: "bg-emerald-500 text-white",
                        PLUS: "bg-blue-500 text-white",
                        PRO: "bg-indigo-600 text-white",
                      };

                      return cardOptions.map((num) => {
                        const isSelected = numberOfCards === num.toString();
                        const tierLabel = getTierForCardCount(num);

                        return (
                          <SelectItem
                            key={num}
                            value={num.toString()}
                            className={cn(
                              "focus:bg-secondary/10 flex items-center justify-between",
                              isSelected && "bg-secondary/20"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {isSelected && (
                                <svg
                                  className="h-3 w-3 text-primary"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              {num} {num === 1 ? "card" : "cards"}
                            </span>
                            {tierLabel && (
                              <span
                                className={cn(
                                  "ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                  tierColors[tierLabel] || "bg-gray-500 text-white"
                                )}
                              >
                                {tierLabel}
                              </span>
                            )}
                          </SelectItem>
                        );
                      });
                    })()}
                  </SelectContent>
                </Select>

                {/* Right-aligned buttons container */}
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-4 w-px bg-secondary/10 mr-1" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="submit"
                        disabled={!hasValue || savePromptMutation.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-coral-glow hover:scale-105 disabled:bg-primary/40 disabled:shadow-none"
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
