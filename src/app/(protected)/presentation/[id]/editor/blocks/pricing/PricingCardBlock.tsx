import React, { useMemo, useCallback, useState, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument, PricingFeature } from "@/types/presentation";
import {
  createPricingCardContent,
  type PricingCardContent,
} from "../definitions";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";

import { BlockWrapper } from "../../block/BlockWrapper";
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
import { CommonCard } from "../CommonCard";

interface PricingCardBlockProps {
  block: Block;
  onUpdate: (content: PricingCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
  isEditable?: boolean;
}

export const PricingCardBlock = memo(function PricingCardBlock({
  block,
  onUpdate,
  theme,
  isEditable = true,
  readOnly = false,
}: PricingCardBlockProps) {
  const content =
    (block.content as PricingCardContent) || createPricingCardContent();
  const { buttonLabel, features } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempButtonLabel, setTempButtonLabel] = useState(buttonLabel);
  const isDark = theme.themeType === "dark";

  const planNameDoc = useMemo(() => {
    return content?.planName ?? createPricingCardContent().planName;
  }, [content]);

  const priceDoc = useMemo(() => {
    return content?.price ?? createPricingCardContent().price;
  }, [content]);

  const handlePlanNameChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({ ...content, planName: newDoc });
    },
    [content, onUpdate]
  );

  const handlePriceChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({ ...content, price: newDoc });
    },
    [content, onUpdate]
  );

  const toggleFeature = (index: number) => {
    const newFeatures = [...content.features];
    newFeatures[index] = {
      ...newFeatures[index],
      included: !newFeatures[index].included,
    };
    onUpdate({ ...content, features: newFeatures });
  };

  const updateFeatureText = (index: number, newDoc: ProseMirrorDocument) => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], text: newDoc };
    onUpdate({ ...content, features: newFeatures });
  };

  const addFeature = () => {
    onUpdate({
      ...content,
      features: [...content.features, { text: "", included: true }],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = content.features.filter(
      (_: PricingFeature, i: number) => i !== index
    );
    onUpdate({ ...content, features: newFeatures });
  };

  const handleOpenEdit = () => {
    setTempButtonLabel(buttonLabel);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      buttonLabel: tempButtonLabel,
    });
    setIsEditOpen(false);
  };

  return (
    <BlockWrapper
      onEdit={!readOnly ? handleOpenEdit : undefined}
      onAdd={!readOnly ? addFeature : undefined}
      className="h-full"
      theme={theme}
      readOnly={readOnly}
    >
      <CommonCard 
        theme={theme} 
        className="w-full h-full transition-all duration-300 hover:shadow-xl"
      >
        <div 
          className="w-full h-full flex flex-col relative p-10 overflow-hidden"
          style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
        >
          {/* Minimal Gradient Background Blob */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
            style={{ backgroundColor: theme.primary }}
          />

          {/* Header */}
          <div
            className="text-center mb-8 pb-8 relative z-10"
            style={{ borderBottom: `2px solid ${theme.primary}10` }}
          >
            <div style={{ color: `${theme.headingColor}60` }}>
              <ProseMirrorEditor
                key={`${block.id}-plan`}
                blockId={`${block.id}-plan`}
                value={planNameDoc}
                onChange={handlePlanNameChange}
                placeholder="Plan Name"
                className="text-[11px] font-black mb-3 text-center uppercase tracking-[0.2em]"
                theme={theme}
                readOnly={readOnly}
              />
            </div>
            <div style={{ color: theme.headingColor }}>
              <ProseMirrorEditor
                key={`${block.id}-price`}
                blockId={`${block.id}-price`}
                value={priceDoc}
                onChange={handlePriceChange}
                placeholder="$0/mo"
                className="text-4xl font-black text-center tracking-tighter"
                theme={theme}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 mb-10 relative z-10">
            {features.map((feature: PricingFeature, index: number) => (
              <div
                key={index}
                className="flex items-center gap-4 group/feature relative"
              >
                <button
                  onClick={!readOnly ? () => toggleFeature(index) : undefined}
                  className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all border shadow-sm ${
                    !readOnly ? "active:scale-95" : ""
                  }`}
                  style={{
                    backgroundColor: feature.included
                      ? `${theme.primary}10`
                      : `${theme.primary}05`,
                    borderColor: feature.included
                      ? `${theme.primary}25`
                      : `${theme.primary}10`,
                    color: feature.included
                      ? theme.primary
                      : `${theme.bodyColor}30`,
                    backdropFilter: "blur(4px)"
                  }}
                >
                  {feature.included ? (
                    <IconCheck size={14} strokeWidth={3} />
                  ) : (
                    <IconX size={14} strokeWidth={2.5} className="opacity-40" />
                  )}
                </button>
                <div className="flex-1" style={{ color: theme.bodyColor }}>
                  <ProseMirrorEditor
                    key={`${block.id}-feature-${index}`}
                    blockId={`${block.id}-feature-${index}`}
                    value={feature.text}
                    onChange={(doc) => updateFeatureText(index, doc)}
                    placeholder="Feature description"
                    className={`text-base font-medium tracking-tight ${
                      !feature.included && "line-through opacity-30"
                    }`}
                    theme={theme}
                    readOnly={readOnly}
                  />
                </div>
                {!readOnly && (
                  <button
                    onClick={() => removeFeature(index)}
                    className="opacity-0 group-hover/feature:opacity-100 p-2 rounded-xl transition-all hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                    title="Remove Feature"
                  >
                    <IconTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-auto relative z-10">
            <button
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/10 border"
              style={{
                backgroundColor: theme.primary,
                borderColor: `${theme.primary}20`,
                color: "#ffffff",
              }}
              onClick={handleOpenEdit}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </CommonCard>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          style={{
            backgroundColor: isDark
              ? "rgba(20,20,24,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
              Pricing Card Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Customize pricing display.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>
                Button Label
              </Label>
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
            <Button
              onClick={handleSave}
              style={{ backgroundColor: theme.primary }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
});
