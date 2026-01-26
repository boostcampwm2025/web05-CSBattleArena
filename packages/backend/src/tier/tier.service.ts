import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tier } from './entity';

@Injectable()
export class TierService implements OnModuleInit {
  private readonly logger = new Logger(TierService.name);

  constructor(
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
  ) {}

  async onModuleInit() {
    await this.seedTiers();
  }

  private async seedTiers(): Promise<void> {
    try {
      this.logger.log('🌱 Seeding tier data...');

      const tiers = [
        { name: 'bronze', minPoints: 0, maxPoints: 999, iconUrl: null },
        { name: 'silver', minPoints: 1000, maxPoints: 1499, iconUrl: null },
        { name: 'gold', minPoints: 1500, maxPoints: 1999, iconUrl: null },
        { name: 'platinum', minPoints: 2000, maxPoints: 2499, iconUrl: null },
        { name: 'diamond', minPoints: 2500, maxPoints: 9999, iconUrl: null },
      ];

      for (const tierData of tiers) {
        const existing = await this.tierRepository.findOne({
          where: { name: tierData.name },
        });

        if (!existing) {
          await this.tierRepository.save(tierData);
        }
      }

      this.logger.log('✅ Tier seeding completed');
    } catch (error) {
      this.logger.error('❌ Tier seeding failed', error);
    }
  }
}
