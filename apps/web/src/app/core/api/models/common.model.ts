export interface ApiSuccess {
  status: 'success';
}

export interface Contact {
  riotId: string;
  discordTag: string | null;
  whatsapp: string | null;
}

export interface Reputation {
  score: number;
  positive: number;
  negative: number;
  total: number;
  label: string;
}

export interface ApiErrorPayload {
  status: 'fail' | 'error';
  message: string;
}
