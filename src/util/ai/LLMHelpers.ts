import { OpenAIApi } from 'openai';
import { GPT4All } from 'gpt4all';
import fs from 'fs/promises';
import { BaseGuildTextChannel, ThreadChannel } from 'discord.js';

export abstract class LLMChat {
    abstract init(): Promise<void>;
    abstract prompt(message: string): Promise<string | null>;
    abstract close(): void;
    abstract channel: ThreadChannel | BaseGuildTextChannel;
    abstract lastMsg: string | null;
    abstract readonly model: string;
}

interface ChatGPTMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    name?: string;
}

export enum ChatGPTModel {
    CHATGPT = 'gpt-3.5-turbo',
    GPT4 = 'gpt-4',
}

export class ChatGPTChat extends LLMChat {
    private _messages: ChatGPTMessage[];
    private _openai: OpenAIApi;
    private _jailbreak: boolean;
    lastMsg: string | null = null;
    readonly model: ChatGPTModel;
    channel: ThreadChannel | BaseGuildTextChannel;
    constructor(
        channel: ThreadChannel | BaseGuildTextChannel,
        openai: OpenAIApi,
        model = ChatGPTModel.GPT4,
        jailbreak = false,
    ) {
        super();
        this._messages = [];
        this._openai = openai;
        this._jailbreak = jailbreak;
        this.model = model;
        this.channel = channel;
    }
    async init(): Promise<void> {
        this._messages.push({
            role: 'system',
            content: 'You are a helpful assistant.',
        });

        if (!this._jailbreak) {
            return;
        }

        const jailbreak = await fs.readFile('./assets/chatgpt_jailbreak.txt', 'utf-8');
        const jailbreakResponse = await fs.readFile('./assets/chatgpt_jailbreak_response.txt', 'utf-8');

        this._messages.push({
            role: 'user',
            content: jailbreak,
        });

        this._messages.push({
            role: 'assistant',
            content: jailbreakResponse,
        });
    }

    async prompt(message: string): Promise<string | null> {
        this._messages.push({
            role: 'user',
            content: message,
        });

        const completion = await this._openai.createChatCompletion({
            model: this.model,
            messages: this._messages,
            temperature: 1.05,
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

export class GPT4AllChat extends LLMChat {
    private _gpt: GPT4All;
    channel: ThreadChannel | BaseGuildTextChannel;
    lastMsg: string | null = null;
    readonly model = 'ScuffGPT';
    constructor(channel: ThreadChannel | BaseGuildTextChannel) {
        super();
        this.channel = channel;
        this._gpt = new GPT4All('gpt4all-lora-unfiltered-quantized');
    }
    async init(): Promise<void> {
        await this._gpt.init();
        await this._gpt.open();
    }

    async prompt(message: string): Promise<string | null> {
        const response = await this._gpt.prompt(message);

        if (response.length == 0) {
            return null;
        }

        return response;
    }

    close(): void {
        this._gpt.close();
    }
}
