import { UserInfo } from '../../game/interfaces/user.interface';

export interface QueueSession {
  sessionId: string;
  socketId: string;
  userId: string;
  userInfo: UserInfo;
}
