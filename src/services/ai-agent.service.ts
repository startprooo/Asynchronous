import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Configuration, OpenAIApi } from 'openai';
import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';

@Injectable()
export class AIAgentService extends EventEmitter {
    private openai: OpenAIApi;
    private terminalProcess: ChildProcess | null = null;
    private sessionLogs: string[] = [];

    constructor() {
        super();
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai = new OpenAIApi(configuration);
        this.initializeTerminal();
    }

    private initializeTerminal(): void {
        this.terminalProcess = spawn('bash', [], {
            env: { ...process.env, TERM: 'xterm-256color' },
        });

        this.terminalProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            this.sessionLogs.push(output);
            this.emit('terminalOutput', output);
        });

        this.terminalProcess.stderr?.on('data', (data) => {
            const error = data.toString();
            this.sessionLogs.push(error);
            this.emit('terminalError', error);
        });
    }

    async executeCommand(command: string): Promise<string> {
        if (!this.terminalProcess) {
            throw new Error('Terminal not initialized');
        }

        return new Promise((resolve, reject) => {
            const outputBuffer: string[] = [];
            const errorBuffer: string[] = [];

            const onStdout = (data: Buffer) => {
                outputBuffer.push(data.toString());
            };

            const onStderr = (data: Buffer) => {
                errorBuffer.push(data.toString());
            };

            this.terminalProcess?.stdout?.on('data', onStdout);
            this.terminalProcess?.stderr?.on('data', onStderr);

            this.terminalProcess?.stdin?.write(command + '\n');

            const cleanup = () => {
                this.terminalProcess?.stdout?.removeListener('data', onStdout);
                this.terminalProcess?.stderr?.removeListener('data', onStderr);
            };

            setTimeout(() => {
                cleanup();
                if (errorBuffer.length > 0) {
                    reject(new Error(errorBuffer.join('')));
                } else {
                    resolve(outputBuffer.join(''));
                }
            }, 1000);
        });
    }

    async processNaturalLanguage(input: string): Promise<string> {
        const response = await this.openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI coding assistant that translates natural language instructions into specific coding tasks and terminal commands."
                },
                {
                    role: "user",
                    content: input
                }
            ],
            temperature: 0.2,
        });

        const suggestion = response.data.choices[0].message?.content || '';
        return suggestion;
    }

    async executeFileOperation(operation: {
        type: 'create' | 'modify' | 'delete';
        path: string;
        content?: string;
    }): Promise<void> {
        const fullPath = path.resolve(operation.path);

        switch (operation.type) {
            case 'create':
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(fullPath),
                    Buffer.from(operation.content || '')
                );
                break;

            case 'modify':
                const existingContent = await vscode.workspace.fs.readFile(
                    vscode.Uri.file(fullPath)
                );
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(fullPath),
                    Buffer.from(operation.content || '')
                );
                break;

            case 'delete':
                await vscode.workspace.fs.delete(vscode.Uri.file(fullPath));
                break;
        }
    }

    getSessionLogs(): string[] {
        return [...this.sessionLogs];
    }

    clearSessionLogs(): void {
        this.sessionLogs = [];
    }
}
