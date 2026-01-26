export class TierHistoryItemDto {
  tier: string;
  tierPoint: number;
  changedAt: Date;
}

export class TierHistoryResponseDto {
  tierHistory: TierHistoryItemDto[];
}
