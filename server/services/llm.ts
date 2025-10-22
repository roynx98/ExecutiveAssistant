import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type LLMProvider = 'gemini' | 'openai' | 'anthropic';

const DEFAULT_PROVIDER: LLMProvider = (process.env.LLM_PROVIDER as LLMProvider) || 'gemini';

interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateText(
  messages: LLMMessage[],
  options?: {
    provider?: LLMProvider;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const provider = options?.provider || DEFAULT_PROVIDER;
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? 1000;

  switch (provider) {
    case 'gemini':
      return generateWithGemini(messages, temperature, maxTokens);
    case 'openai':
      return generateWithOpenAI(messages, temperature, maxTokens);
    case 'anthropic':
      return generateWithAnthropic(messages, temperature, maxTokens);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

async function generateWithGemini(
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not found');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const prompt = systemMessage 
    ? `${systemMessage}\n\n${userMessages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`
    : userMessages.map(m => m.content).join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
    config: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  return response.text || '';
}

async function generateWithOpenAI(
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not found');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages.map(m => ({
      role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices[0]?.message?.content || '';
}

async function generateWithAnthropic(
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found');
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemMessage = messages.find(m => m.role === 'system')?.content;
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: maxTokens,
    temperature,
    system: systemMessage,
    messages: userMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  });

  const content = response.content[0];
  return content.type === 'text' ? content.text : '';
}

export async function generateEmailDraft(
  threadContext: string,
  tone: 'casual' | 'business-casual' | 'formal' = 'business-casual'
): Promise<string> {
  const toneInstructions = {
    casual: 'Write in a casual, friendly tone as if talking to a colleague or friend.',
    'business-casual': 'Write in a professional but approachable tone suitable for business communications.',
    formal: 'Write in a formal, professional tone suitable for important business matters.',
  };

  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: `You are an AI assistant helping draft email replies. ${toneInstructions[tone]} Keep replies concise and actionable. Avoid fluff.`,
    },
    {
      role: 'user',
      content: `Draft a reply to this email thread:\n\n${threadContext}\n\nProvide 3 subject line options if this is a new thread.`,
    },
  ];

  return generateText(messages, { temperature: 0.8 });
}
