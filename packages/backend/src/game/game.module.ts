import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameSessionManager } from './game-session-manager';
import { MatchmakingModule } from '../matchmaking/matchmaking.module';
import { QuizModule } from '../quiz/quiz.module';
import { Match, Round, RoundAnswer } from '../match/entity';

import { RoundProgressionService } from './round-progression.service';
import { RoundTimer } from './round-timer';

@Module({
  imports: [MatchmakingModule, QuizModule, TypeOrmModule.forFeature([Match, Round, RoundAnswer])],
  providers: [GameGateway, GameService, GameSessionManager, RoundProgressionService, RoundTimer],
  exports: [GameSessionManager],
})
export class GameModule {}
