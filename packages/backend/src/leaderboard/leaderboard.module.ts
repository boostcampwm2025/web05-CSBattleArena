import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { UserStatistics } from '../user/entity/user-statistics.entity';
import { UserProblemBank } from '../problem-bank/entity/user-problem-bank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserStatistics, UserProblemBank])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
