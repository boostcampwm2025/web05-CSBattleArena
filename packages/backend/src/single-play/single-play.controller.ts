import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { SinglePlayService } from './single-play.service';
import { GetQuestionsDto, SubmitAnswerDto } from './dto';

@Controller('api/singleplay')
export class SinglePlayController {
  constructor(private readonly singlePlayService: SinglePlayService) {}

  /**
   * 카테고리 목록 조회 API
   * GET /api/singleplay/categories
   */
  @Get('categories')
  async getCategories(): Promise<{ categories: Array<{ id: number; name: string | null }> }> {
    const categories = await this.singlePlayService.getCategories();

    return { categories };
  }

  /**
   * 문제 요청 API
   * GET /api/singleplay/questions?categoryId=1,2,3
   */
  @Get('questions')
  async getQuestions(@Query(ValidationPipe) query: GetQuestionsDto) {
    // 쉼표로 구분된 categoryId를 배열로 변환
    const categoryIds = query.categoryId
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    const questions = await this.singlePlayService.getQuestions(categoryIds);

    return { questions };
  }

  /**
   * 정답 제출 요청 API
   * POST /api/singleplay/submit
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitAnswer(@Body(ValidationPipe) submitDto: SubmitAnswerDto) {
    return await this.singlePlayService.submitAnswer(submitDto.questionId, submitDto.answer);
  }
}
