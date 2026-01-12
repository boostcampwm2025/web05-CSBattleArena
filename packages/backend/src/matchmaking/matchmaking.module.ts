import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { InMemoryMatchQueue } from './queue/in-memory-queue';

@Module({
  providers: [MatchmakingService, InMemoryMatchQueue],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
