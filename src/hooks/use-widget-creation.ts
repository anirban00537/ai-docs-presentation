import { useTextCreation } from "@/components/editor/widgets/text/use-text-creation";
import { useListCardCreation } from "@/components/editor/widgets/list-card/use-list-card-creation";
import { useIconCardCreation } from "@/components/editor/widgets/icon-card/use-icon-card-creation";
import { useLabelCardCreation } from "@/components/editor/widgets/label-card/use-label-card-creation";
import { useImageCardCreation } from "@/components/editor/widgets/image-card/use-image-card-creation";
import { useNumberCardCreation } from "@/components/editor/widgets/number-card/use-number-card-creation";
import { useQuoteCreation } from "@/components/editor/widgets/quote/use-quote-creation";
import { useComparisonCardCreation } from "@/components/editor/widgets/comparison-card/use-comparison-card-creation";
import { usePricingCardCreation } from "@/components/editor/widgets/pricing-card/use-pricing-card-creation";
import { useTitleCardCreation } from "@/components/editor/widgets/title-card/use-title-card-creation";

export const useWidgetCreation = () => {
  const { handleAddText } = useTextCreation();
  const { handleAddFeatureCard } = useNumberCardCreation();

  const { handleAddIconCard } = useIconCardCreation();

  const { handleAddLabelCard } = useLabelCardCreation();
  const { handleAddImageCard } = useImageCardCreation();

  const { handleAddListCard } = useListCardCreation();

  const { handleAddQuote } = useQuoteCreation();
  const { handleAddComparisonCard } = useComparisonCardCreation();
  const { handleAddTitleCard } = useTitleCardCreation();
  const { handleAddPricingCard } = usePricingCardCreation();

  return {
    handleAddText,
    handleAddFeatureCard,
    handleAddIconCard,
    handleAddImageCard,
    handleAddLabelCard,
    handleAddListCard,
    handleAddQuote,
    handleAddComparisonCard,
    handleAddTitleCard,
    handleAddPricingCard,
  };
};
