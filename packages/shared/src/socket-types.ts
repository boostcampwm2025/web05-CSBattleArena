import {
  OpponentLevelInfo,
  OpponentProfile,
  OpponentTierInfo,
  TierInfo,
} from "./constant";
import { Question } from "./constant";
import { MySubmission, OpponentSubmission, Solution } from "./constant";

// 클라이언트에서 서버로 보내는 요청 객체는 interface로, 이외의 모든 요청, 응답 객체는 type으로 선언
// 네이밍 컨벤션은 요청 객체 마지막에 Dto, 응답 객체 마지막에 Ack 추가

// #region Matching

// match:enqueue C -> S (Ack)
export type MatchEnqueueAck = { ok: true } | { ok: false; message: string };

// match:dequeue C -> S (Ack)
export type MatchDequeueAck = { ok: true } | { ok: false; message: string };

// match:found S -> C
export type MatchFoundDto = {
  opponent: {
    profile: OpponentProfile;
    tierInfo: OpponentTierInfo;
    levelInfo: OpponentLevelInfo;
  };
};

// match:end S -> C
export type MatchEndDto = {
  isWin: boolean;
  my: {
    score: number;
    correctCnt: number;
    tierChange: { tierInfo: TierInfo; delta: number };
  };
  opponent: {
    score: number;
    correctCnt: number;
    tierChange: { tierInfo: TierInfo; delta: number };
  };
  questionHistory: {
    question: Question;
    mySubmission: MySubmission;
    opponentSubmission: OpponentSubmission;
    solution: Solution;
  }[];
};

// #endregion

// #region Round

// round:ready S -> C
export type RoundReadyDto = {
  durationSec: number;
  roundIndex: number;
  totalRounds: number;
};

// round:start S -> C
export type RoundStartDto = {
  curRoundIndex: number;
  durationSec: number;
  question: Question;
};

// round:end S -> C
export type RoundEndDto = {
  curRoundIndex: number;
  durationSec: number;
  question: Question;
  mySubmission: MySubmission;
  opponentSubmission: OpponentSubmission;
  solution: Solution;
};

// round:tick S -> C
export type RoundTickDto = { remainedSec: number };

// submit:answer C -> S (Ack)
export interface SubmitAnswerDto {
  answer: string;
}
export type SubmitAnswerAck = { ok: true } | { ok: false; message: string };

// opponent:submitted S -> C

// #endregion

// #region Error S -> C
export type ErrorDto = { message: string };

// error

// #endregion
