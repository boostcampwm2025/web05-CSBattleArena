export class TierHistoryItemDto {
  tier: string;
  tierPoint: number;
  tierChange: number | null;
  changedAt: Date;
}

export class TierHistoryResponseDto {
  tierHistory: TierHistoryItemDto[];
}
