import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum FeedbackCategory {
  BUG = 'bug',
  CONTENT = 'content',
  OTHER = 'other',
}

export class CreateFeedbackDto {
  @IsEnum(FeedbackCategory)
  @IsNotEmpty()
  category: FeedbackCategory;

  @IsString()
  @IsNotEmpty()
  content: string;
}
