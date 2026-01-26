import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProblemBankService } from './problem-bank.service';
import { GetProblemBankQueryDto } from './dto/get-problem-bank-query.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { ProblemBankResponseDto, ProblemBankStatisticsDto } from './dto/problem-bank-response.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('problem-bank')
@Controller('problem-bank')
export class ProblemBankController {
  constructor(private readonly problemBankService: ProblemBankService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '문제 은행 목록 조회',
    description: '사용자가 풀었던 문제 목록을 조회합니다. 필터링 및 페이지네이션을 지원합니다.',
  })
  @ApiQuery({
    name: 'categoryIds',
    required: false,
    description: '카테고리 ID 목록',
    type: [Number],
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    enum: ['easy', 'medium', 'hard'],
    description: '난이도 필터',
  })
  @ApiQuery({
    name: 'result',
    required: false,
    enum: ['correct', 'incorrect', 'partial'],
    description: '결과 필터',
  })
  @ApiQuery({ name: 'isBookmarked', required: false, type: Boolean, description: '북마크 필터' })
  @ApiQuery({ name: 'search', required: false, type: String, description: '검색어' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 항목 수 (기본값: 10)',
  })
  @ApiResponse({
    status: 200,
    description: '문제 은행 목록 조회 성공',
    type: ProblemBankResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getProblemBank(@Query() query: GetProblemBankQueryDto, @Req() req: RequestWithUser) {
    const userId = Number(req.user.id);

    return this.problemBankService.getProblemBank(userId, query);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '학습 통계 조회',
    description: '사용자의 문제 풀이 통계를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공',
    type: ProblemBankStatisticsDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getStatistics(@Req() req: RequestWithUser) {
    const userId = Number(req.user.id);

    return this.problemBankService.getStatistics(userId);
  }

  @Patch(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '북마크 업데이트',
    description: '문제의 북마크 상태를 업데이트합니다.',
  })
  @ApiParam({ name: 'id', description: '문제 은행 항목 ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '북마크 업데이트 성공',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '항목을 찾을 수 없음' })
  updateBookmark(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookmarkDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = Number(req.user.id);

    return this.problemBankService.updateBookmark(userId, id, dto);
  }
}
