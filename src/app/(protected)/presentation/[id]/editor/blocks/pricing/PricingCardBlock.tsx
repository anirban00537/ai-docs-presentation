import React, { useMemo, useCallback, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
  createPricingCardContent,
  type PricingCardContent,
} from "../definitions/pricing-card";
import { IconCheck, IconX, IconStar, IconTrash } from "@tabler/icons-react";
import { createParagraphContent } from "@/types/presentation";
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
import { CommonCard } from "../CommonCard";

interface PricingCardBlockProps {
  block: Block;
  onUpdate: (content: PricingCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
  isEditable?: boolean;
}

export const PricingCardBlock: React.FC<PricingCardBlockProps> = ({
  block,
  onUpdate,
  theme,
  isEditable = true,
  readOnly = false,
}) => {
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
    newFeatures[index] = {
      ...newFeatures[index],
      included: !newFeatures[index].included,
    };
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
      features: [
        ...content.features,
        { text: createParagraphContent(), included: true },
      ],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = content.features.filter((_, i) => i !== index);
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
        className="w-full h-full p-6"
      >
        <div className="w-full h-full flex flex-col relative transition-all">
          {/* Header */}
          <div
            className="text-center mb-5 pb-5"
            style={{ borderBottom: `1px solid ${theme.primary}10` }}
          >
            <div style={{ color: `${theme.headingColor}80` }}>
              <ProseMirrorEditor
                key={`${block.id}-plan`}
                blockId={`${block.id}-plan`}
                value={planNameDoc}
                onChange={handlePlanNameChange}
                placeholder="Plan Name"
                className="text-sm font-medium mb-1 text-center uppercase tracking-wide"
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
                className="text-3xl font-bold text-center"
                theme={theme}
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Features List */}
          <div className="flex-1 space-y-3 mb-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 group/feature relative"
              >
                <button
                  onClick={!readOnly ? () => toggleFeature(index) : undefined}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${!readOnly ? 'cursor-pointer' : ''}`}
                  style={{
                    backgroundColor: feature.included
                      ? `${theme.primary}15`
                      : `${theme.bodyColor}10`,
                    color: feature.included
                      ? theme.primary
                      : `${theme.bodyColor}40`,
                  }}
                >
                  {feature.included ? (
                    <IconCheck size={12} />
                  ) : (
                    <IconX size={12} />
                  )}
                </button>
                <div className="flex-1" style={{ color: theme.bodyColor }}>
                  <ProseMirrorEditor
                    key={`${block.id}-feature-${index}`}
                    blockId={`${block.id}-feature-${index}`}
                    value={feature.text}
                    onChange={(doc) => updateFeatureText(index, doc)}
                    placeholder="Feature description"
                    className={`text-sm ${
                      !feature.included && "line-through opacity-40"
                    }`}
                    theme={theme}
                    readOnly={readOnly}
                  />
                </div>
                {!readOnly && (
                  <button
                    onClick={() => removeFeature(index)}
                    className="opacity-0 group-hover/feature:opacity-100 p-1 rounded-lg transition-all hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                    title="Remove Feature"
                  >
                    <IconTrash size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: `${theme.primary}15`,
              color: theme.primary,
            }}
            onClick={handleOpenEdit}
          >
            {buttonLabel}
          </button>
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
};
