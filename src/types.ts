export interface GameState {
  currentLevel: number;
  score: number;
  completed: boolean;
  elapsedTime: number;
}

export interface VerifyResponse {
  status: "success" | "error";
  message: string;
  plaintext?: string;
  next_room?: string;
  total_score?: number;
  elapsed_time?: number;
}
