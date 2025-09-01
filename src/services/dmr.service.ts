import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

interface ChatMessage {
    role: string;
    content: string;
}

interface ModelResponse {
    id: string;
    name: string;
    status: string;
}

@Injectable()
export class DMRService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = process.env.DOCKER_MODEL_RUNNER_BASE_URL || 'http://localhost:12434';
    }

    async listModels(): Promise<ModelResponse[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/models`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to list models: ${error.message}`);
            }
            throw error;
        }
    }

    async createChatCompletion(model: string, messages: ChatMessage[]) {
        try {
            const response = await axios.post(`${this.baseUrl}/engines/llama.cpp/v1/chat/completions`, {
                model,
                messages,
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to create chat completion: ${error.message}`);
            }
            throw error;
        }
    }

    async createEmbeddings(model: string, input: string[]) {
        try {
            const response = await axios.post(`${this.baseUrl}/engines/llama.cpp/v1/embeddings`, {
                model,
                input,
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to create embeddings: ${error.message}`);
            }
            throw error;
        }
    }
}
