import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuizGameService } from './quiz-game.service';
import { QuizService } from './quiz.service';
import { ClovaClientService } from './clova/clova-client.service';
import { QuizRoundStore } from './quiz-round.store';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [QuizGameService, QuizService, ClovaClientService, QuizRoundStore],
})
export class QuizModule {}
