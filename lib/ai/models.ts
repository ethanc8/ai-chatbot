// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemini-1.5-pro-002',
    label: 'Gemini 1.5 Pro 002',
    apiIdentifier: 'gemini-1.5-pro-002',
    description: 'Google latest stable model',
  },
  {
    id: 'gemini-exp-1114',
    label: 'Gemini-Exp 1114',
    apiIdentifier: 'gemini-exp-1114',
    description: 'Google experimental model',
  },
  {
    id: 'gemini-exp-1121',
    label: 'Gemini-Exp 1121',
    apiIdentifier: 'gemini-exp-1121',
    description: 'Google experimental model',
  },
  {
    id: 'learnlm-1.5-pro-experimental',
    label: 'LearnLM 1.5 Pro',
    apiIdentifier: 'learnlm-1.5-pro-experimental',
    description: 'Google experimental tutoring model',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-1.5-pro-002';
