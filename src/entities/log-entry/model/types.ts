export type LogEntry = {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  matched: boolean;
};
