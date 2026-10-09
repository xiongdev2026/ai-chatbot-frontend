export interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  sessionId?: string;
  loading?: boolean;
  isError?: boolean;
  confidenceScore?: number;
  retrievedChunks?: { id: string; content: string; similarity: number; sourceType?: string; sourceTitle?: string; }[];
  responseTimeMs?: number;
  canonicalAnswer?: string; // Database canonical answer for comparison
}

export interface ApiChatLog {
  id: string;
  answer: string;
  question: string;
  createdAt: string;
  sessionId: string;
  confidenceScore?: number;
  retrievedChunks?: { id: string; content: string; similarity: number; sourceType?: string; sourceTitle?: string; }[];
  responseTimeMs?: number;
  canonicalAnswer?: string; // Database canonical answer for comparison
}