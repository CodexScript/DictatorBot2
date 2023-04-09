import { OpenAIApi } from 'openai';

abstract class LLMChat {
    abstract init(): Promise<void>;
    abstract prompt(message: string): Promise<string | null>;
    abstract close(): void;
}

interface ChatGPTMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    name?: string;
}

export class ChatGPTChat extends LLMChat {
    private _messages: ChatGPTMessage[];
    private _openai: OpenAIApi;
    constructor(openai: OpenAIApi) {
        super();
        this._messages = [];
        this._openai = openai;
    }
    async init(): Promise<void> {
        this._messages.push({
            role: 'system',
            content: 'You are a helpful assistant. You exist within a Discord bot application.',
        });
    }

    async prompt(message: string): Promise<string | null> {
        this._messages.push({
            role: 'user',
            content: message,
        });

        const completion = await this._openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: this._messages,
        });

        if (completion.data.choices.length == 0 || completion.data.choices[0].message === undefined) {
            return null;
        }

        this._messages.push(completion.data.choices[0].message);

        return completion.data.choices[0].message.content;
    }
    close(): void {
        this._messages = [];
    }
}
