import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class LLMService {
    private openai: OpenAIApi;

    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai = new OpenAIApi(configuration);
    }

    async analyzeTask(description: string): Promise<{
        requiredCapabilities: string[];
        details: any;
        steps: any[];
    }> {
        const prompt = `
        Analyze the following task and break it down into steps:
        "${description}"
        
        Provide:
        1. Required capabilities (browser automation, file system access, etc.)
        2. Detailed analysis
        3. Step-by-step breakdown
        
        Response format:
        {
            "requiredCapabilities": ["capability1", "capability2"],
            "details": { "key points and analysis" },
            "steps": [{"name": "step name", "description": "step details"}]
        }
        `;

        const response = await this.openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });

        try {
            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            throw new Error('Failed to parse LLM response');
        }
    }

    async generateSubtasks(task: any): Promise<any[]> {
        const prompt = `
        For the task: "${task.description}"
        With the analysis: ${JSON.stringify(task.metadata.analysis)}
        
        Generate a list of subtasks that can be executed in parallel when possible.
        Each subtask should be independent and atomic.
        
        Response format:
        [
            {
                "name": "subtask name",
                "description": "detailed description",
                "dependencies": ["parent task id or null"],
                "estimatedDuration": "in minutes",
                "requiredCapabilities": ["capability1", "capability2"]
            }
        ]
        `;

        const response = await this.openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });

        try {
            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            throw new Error('Failed to parse LLM response');
        }
    }

    async planExecution(task: any): Promise<any> {
        const prompt = `
        For the task: "${task.description}"
        With steps: ${JSON.stringify(task.metadata.steps)}
        
        Create an execution plan that:
        1. Identifies parallel execution opportunities
        2. Handles dependencies between steps
        3. Includes error handling and recovery strategies
        
        Response format:
        {
            "executionGraph": {
                "nodes": ["step ids"],
                "edges": [{"from": "step1", "to": "step2"}]
            },
            "errorHandling": {
                "stepId": {
                    "retryStrategy": "strategy details",
                    "fallbackAction": "action details"
                }
            }
        }
        `;

        const response = await this.openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });

        try {
            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            throw new Error('Failed to parse LLM response');
        }
    }
}
