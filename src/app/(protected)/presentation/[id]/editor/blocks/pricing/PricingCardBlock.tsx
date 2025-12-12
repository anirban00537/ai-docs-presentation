import React, { useMemo, useCallback, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createPricingCardContent,
  type PricingCardContent,
} from "../definitions/pricing-card";
import { withAlpha } from "../utils";
import { Check, X, Star, Trash2, Plus } from "lucide-react";
import { createParagraphContent } from "../definitions/common";
import { BlockWrapper } from "../BlockWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PricingCardBlockProps {
  block: Block;
  onUpdate: (content: PricingCardContent) => void;
  theme: Theme;
  placeholder?: string;
  isEditable?: boolean;
}

export const PricingCardBlock: React.FC<PricingCardBlockProps> = ({
  block,
  onUpdate,
  theme,
  isEditable = true,
}) => {
  const content = (block.content as PricingCardContent) || createPricingCardContent();
  const { isRecommended, buttonLabel, features } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Local state for modal
  const [tempIsRecommended, setTempIsRecommended] = useState(isRecommended);
  const [tempButtonLabel, setTempButtonLabel] = useState(buttonLabel);

  const planNameDoc = useMemo(() => {
    if (content?.planName?.type === "doc") return content.planName;
    return createPricingCardContent().planName;
  }, [content]);

  const priceDoc = useMemo(() => {
    if (content?.price?.type === "doc") return content.price;
    return createPricingCardContent().price;
  }, [content]);

  const handlePlanNameChange = useCallback(
    (newDoc: any) => {
      onUpdate({ ...content, planName: newDoc });
    },
    [content, onUpdate]
  );

  const handlePriceChange = useCallback(
    (newDoc: any) => {
      onUpdate({ ...content, price: newDoc });
    },
    [content, onUpdate]
  );

  const toggleRecommended = () => {
    onUpdate({ ...content, isRecommended: !content.isRecommended });
  };

  const toggleFeature = (index: number) => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], included: !newFeatures[index].included };
    onUpdate({ ...content, features: newFeatures });
  };

  const updateFeatureText = (index: number, newDoc: any) => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], text: newDoc };
    onUpdate({ ...content, features: newFeatures });
  };

  const addFeature = () => {
    onUpdate({
      ...content,
      features: [...content.features, { text: createParagraphContent(), included: true }],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = content.features.filter((_, i) => i !== index);
    onUpdate({ ...content, features: newFeatures });
  };

  const handleOpenEdit = () => {
    setTempIsRecommended(isRecommended);
    setTempButtonLabel(buttonLabel);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      isRecommended: tempIsRecommended,
      buttonLabel: tempButtonLabel,
    });
    setIsEditOpen(false);
  };

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addFeature} className="h-full" theme={theme}>
      <div
        className={`w-full h-full flex flex-col rounded-2xl p-8 relative transition-all duration-300 ${
          isRecommended ? "transform scale-105 shadow-xl z-10" : "opacity-90 hover:opacity-100"
        }`}
        style={{
          backgroundColor: theme.cardBackground || "white",
          border: isRecommended 
            ? `2px solid ${theme.primary}` 
            : `1px solid ${withAlpha(theme.primary, 0.1)}`,
          boxShadow: isRecommended 
            ? `0 20px 40px -10px ${withAlpha(theme.primary, 0.2)}`
            : "none",
        }}
      >
        {/* Recommended Badge */}
        {isRecommended && (
          <div 
            className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1 shadow-md"
            style={{ backgroundColor: theme.primary }}
          >
            <Star className="w-3 h-3 fill-current" />
            Recommended
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8 pb-8 border-b relative group/header" style={{ borderColor: withAlpha(theme.bodyColor, 0.1) }}>
          <div style={{ color: withAlpha(theme.headingColor, 0.5) }}>
            <ProseMirrorEditor
              key={`${block.id}-plan`}
              blockId={`${block.id}-plan`}
              value={planNameDoc}
              onChange={handlePlanNameChange}
              placeholder="Plan Name"
              className="text-lg font-bold mb-2 text-center uppercase tracking-wide"
            />
          </div>
          <div className="flex justify-center items-baseline" style={{ color: theme.headingColor }}>
             <ProseMirrorEditor
              key={`${block.id}-price`}
              blockId={`${block.id}-price`}
              value={priceDoc}
              onChange={handlePriceChange}
              placeholder="$0/mo"
              className="text-4xl font-extrabold text-center"
            />
          </div>
        </div>

        {/* Features List */}
        <div className="flex-1 space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 group/feature relative">
              <button 
                onClick={() => toggleFeature(index)}
                className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: feature.included ? withAlpha(theme.primary, 0.1) : withAlpha(theme.bodyColor, 0.05),
                  color: feature.included ? theme.primary : withAlpha(theme.bodyColor, 0.3),
                }}
              >
                {feature.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </button>
              <div className="flex-1" style={{ color: theme.bodyColor }}>
                 <ProseMirrorEditor
                  key={`${block.id}-feature-${index}`}
                  blockId={`${block.id}-feature-${index}`}
                  value={feature.text}
                  onChange={(doc) => updateFeatureText(index, doc)}
                  placeholder="Feature description"
                  className={`text-sm ${!feature.included && 'line-through opacity-50'}`}
                />
              </div>
              <button
                onClick={() => removeFeature(index)}
                className="opacity-0 group-hover/feature:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                title="Remove Feature"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="w-full py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg relative group/btn"
          style={{
            backgroundColor: isRecommended ? theme.primary : withAlpha(theme.primary, 0.05),
            color: isRecommended ? 'white' : theme.primary,
          }}
          onClick={handleOpenEdit}
        >
          {buttonLabel}
          <div className="absolute top-1 right-1 opacity-0 group-hover/btn:opacity-100">
             <Edit2 className="w-3 h-3" />
          </div>
        </button>

         <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Pricing Card</DialogTitle>
              <DialogDescription>
                Customize layout and details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="recommended-mode">Recommended Plan</Label>
                <Switch
                  id="recommended-mode"
                  checked={tempIsRecommended}
                  onCheckedChange={setTempIsRecommended}
                />
              </div>

               <div className="space-y-2">
                <Label>Button Label</Label>
                <Input
                  value={tempButtonLabel}
                  onChange={(e) => setTempButtonLabel(e.target.value)}
                  placeholder="e.g. Get Started"
                />
              </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BlockWrapper>
  );
};

// Start Icon helper
function Edit2({ className }: { className?: string }) {
  return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
  )
}
