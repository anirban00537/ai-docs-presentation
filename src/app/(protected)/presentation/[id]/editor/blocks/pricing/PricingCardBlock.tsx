import React, { useMemo, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createPricingCardContent,
  type PricingCardContent,
} from "../definitions/pricing-card";
import { withAlpha } from "../utils";
import { Check, X, Star } from "lucide-react";
import { getDefaultHeadingContent } from "../definitions/common";
import { createParagraphContent } from "../definitions/common";
import { nanoid } from "nanoid";

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
  const content = block.content as PricingCardContent;
  const isRecommended = content.isRecommended;

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

  return (
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
         {/* Toggle Recommended Button (for editing only) */}
        <button 
          onClick={toggleRecommended}
          className="absolute top-0 right-0 p-1 opacity-0 group-hover/header:opacity-50 hover:!opacity-100 transition-opacity"
          title="Toggle Recommended"
        >
          <Star className={`w-4 h-4 ${isRecommended ? 'fill-current' : ''}`} style={{ color: isRecommended ? '#Eab308' : theme.bodyColor || '#ccc' }} />
        </button>

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
        {content.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 group/feature">
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
          </div>
        ))}
         <button 
          onClick={addFeature}
          className="w-full py-2 text-xs text-center border border-dashed rounded-lg transition-all opacity-0 group-hover:opacity-100"
          style={{
             color: withAlpha(theme.bodyColor, 0.5),
             borderColor: withAlpha(theme.bodyColor, 0.2),
          }}
        >
          + Add Feature
        </button>
      </div>

      {/* CTA Button */}
      <button
        className="w-full py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"
        style={{
          backgroundColor: isRecommended ? theme.primary : withAlpha(theme.primary, 0.05),
          color: isRecommended ? 'white' : theme.primary,
        }}
      >
        {content.buttonLabel}
      </button>
    </div>
  );
};
