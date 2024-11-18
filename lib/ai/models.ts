// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemini-exp-1114',
    label: 'Gemini Experimental 1114',
    apiIdentifier: 'gemini-exp-1114',
    description: 'Google experimental model',
  },
  {
    id: 'gemini-1.5-pro-002',
    label: 'Gemini 1.5 Pro 002',
    apiIdentifier: 'gemini-1.5-pro-002',
    description: 'Google latest stable model',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-1.5-pro-002';
