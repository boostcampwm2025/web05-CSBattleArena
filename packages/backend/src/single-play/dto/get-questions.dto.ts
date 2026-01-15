import { IsNotEmpty, IsString } from 'class-validator';

export class GetQuestionsDto {
  @IsNotEmpty({ message: 'categoryId는 필수입니다.' })
  @IsString({ message: 'categoryId는 문자열이어야 합니다.' })
  categoryId: string;
}
