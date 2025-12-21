import { SubscriptionResponseDto } from './subscription-response.dto';
import { CreditBalanceResponseDto } from './credit-balance-response.dto';
import { FeatureResponseDto } from './feature-response.dto';

export class SubscriptionStatusDto {
  subscription: SubscriptionResponseDto | null;
  creditBalance: CreditBalanceResponseDto | null;
  isActive: boolean;
  hasCredits: boolean;
  features?: FeatureResponseDto | null;
}
