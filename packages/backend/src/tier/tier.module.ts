import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TierService } from './tier.service';
import { Tier, UserTierHistory } from './entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tier, UserTierHistory])],
  providers: [TierService],
  exports: [TierService],
})
export class TierModule {}
