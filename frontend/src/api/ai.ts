import client from './client';

export interface AIRecommendation {
  title: string;
  reason: string;
  match_score: number;
}

export interface AIInsights {
  strengths: string[];
  weaknesses: string[];
  action_plan: string;
}

export async function getAIRecommendations(): Promise<AIRecommendation[]> {
  const res = await client.get('/ai/recommendations');
  return res.data.data;
}

export async function getAIInsights(): Promise<AIInsights> {
  const res = await client.get('/ai/insights');
  return res.data.data;
}

export async function sendAIChat(query: string): Promise<string> {
  const res = await client.post('/ai/chat', { query });
  return res.data.reply;
}