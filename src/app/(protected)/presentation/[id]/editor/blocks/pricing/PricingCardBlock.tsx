import React, { useMemo, useCallback, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createPricingCardContent,
  type PricingCardContent,
} from "../definitions/pricing-card";
import { IconCheck, IconX, IconStar, IconTrash } from "@tabler/icons-react";
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
  const [tempIsRecommended, setTempIsRecommended] = useState(isRecommended);
  const [tempButtonLabel, setTempButtonLabel] = useState(buttonLabel);
  const isDark = theme.themeType === "dark";

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
        className={`w-full h-full flex flex-col rounded-2xl p-6 relative transition-all ${
          isRecommended ? "scale-[1.02] z-10" : ""
        }`}
        style={{
          background: isRecommended
            ? `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}05 100%)`
            : `${theme.primary}05`,
          border: isRecommended ? `2px solid ${theme.primary}` : "none",
        }}
      >
        {/* Recommended Badge */}
        {isRecommended && (
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white flex items-center gap-1"
            style={{ backgroundColor: theme.primary }}
          >
            <IconStar size={10} className="fill-current" />
            Popular
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-5 pb-5" style={{ borderBottom: `1px solid ${theme.primary}10` }}>
          <div style={{ color: `${theme.headingColor}80` }}>
            <ProseMirrorEditor
              key={`${block.id}-plan`}
              blockId={`${block.id}-plan`}
              value={planNameDoc}
              onChange={handlePlanNameChange}
              placeholder="Plan Name"
              className="text-sm font-medium mb-1 text-center uppercase tracking-wide"
            />
          </div>
          <div style={{ color: theme.headingColor }}>
            <ProseMirrorEditor
              key={`${block.id}-price`}
              blockId={`${block.id}-price`}
              value={priceDoc}
              onChange={handlePriceChange}
              placeholder="$0/mo"
              className="text-3xl font-bold text-center"
            />
          </div>
        </div>

        {/* Features List */}
        <div className="flex-1 space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 group/feature relative">
              <button 
                onClick={() => toggleFeature(index)}
                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: feature.included ? `${theme.primary}15` : `${theme.bodyColor}10`,
                  color: feature.included ? theme.primary : `${theme.bodyColor}40`,
                }}
              >
                {feature.included ? <IconCheck size={12} /> : <IconX size={12} />}
              </button>
              <div className="flex-1" style={{ color: theme.bodyColor }}>
                <ProseMirrorEditor
                  key={`${block.id}-feature-${index}`}
                  blockId={`${block.id}-feature-${index}`}
                  value={feature.text}
                  onChange={(doc) => updateFeatureText(index, doc)}
                  placeholder="Feature description"
                  className={`text-sm ${!feature.included && 'line-through opacity-40'}`}
                />
              </div>
              <button
                onClick={() => removeFeature(index)}
                className="opacity-0 group-hover/feature:opacity-100 p-1 rounded-lg transition-all hover:bg-red-500/10"
                style={{ color: "#ef4444" }}
                title="Remove Feature"
              >
                <IconTrash size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: isRecommended ? theme.primary : `${theme.primary}15`,
            color: isRecommended ? "#fff" : theme.primary,
          }}
          onClick={handleOpenEdit}
        >
          {buttonLabel}
        </button>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent
            className="sm:max-w-[400px]"
            style={{
              backgroundColor: isDark ? "rgba(20,20,24,0.98)" : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              border: "none",
            }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
                Pricing Card Settings
              </DialogTitle>
              <DialogDescription style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                Customize pricing display.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>Highlight as Popular</Label>
                <Switch
                  checked={tempIsRecommended}
                  onCheckedChange={setTempIsRecommended}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>Button Label</Label>
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
              <Button onClick={handleSave} style={{ backgroundColor: theme.primary }}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BlockWrapper>
  );
};
