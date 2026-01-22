import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserStatistics } from './entity';
import { UserProblemBank } from '../problem-bank/entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserStatistics, UserProblemBank])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
