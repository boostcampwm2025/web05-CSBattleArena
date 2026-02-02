export type MatchType = "multi" | "single";

export type AnswerStatus = "incorrect" | "partial" | "correct";

export type SubmissionResult = {
  status: AnswerStatus;
  submittedAnswer: string;
  solvedAt: Date;
};
export type MySubmission = Pick<SubmissionResult, "status" | "submittedAnswer">;
export type OpponentSubmission = Pick<SubmissionResult, "submittedAnswer">;

export type Solution = {
  bestAnswer: string;
  explanation: string;
  aiFeedback: string;
};
