export default interface GPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GPTChoice[];
}

export interface GPTChoice {
  text: string;
  index: number;
  finish_reason: string;
}
