import { Controller, Post, Get, Body, Sse, Delete, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AIAgentService } from '../services/ai-agent.service';

@Controller('api/agent')
export class AIAgentController {
    constructor(private readonly aiAgentService: AIAgentService) {}

    @Post('command')
    async executeCommand(@Body() body: { command: string }): Promise<{ output: string }> {
        const output = await this.aiAgentService.executeCommand(body.command);
        return { output };
    }

    @Post('natural-language')
    async processNaturalLanguage(@Body() body: { input: string }): Promise<{ suggestion: string }> {
        const suggestion = await this.aiAgentService.processNaturalLanguage(body.input);
        return { suggestion };
    }

    @Post('file-operation')
    async executeFileOperation(@Body() operation: {
        type: 'create' | 'modify' | 'delete';
        path: string;
        content?: string;
    }): Promise<{ success: boolean }> {
        await this.aiAgentService.executeFileOperation(operation);
        return { success: true };
    }

    @Sse('terminal-events')
    subscribeToTerminal(): Observable<MessageEvent> {
        return new Observable(observer => {
            const onOutput = (output: string) => {
                observer.next({ data: { type: 'output', content: output } });
            };

            const onError = (error: string) => {
                observer.next({ data: { type: 'error', content: error } });
            };

            this.aiAgentService.on('terminalOutput', onOutput);
            this.aiAgentService.on('terminalError', onError);

            return () => {
                this.aiAgentService.off('terminalOutput', onOutput);
                this.aiAgentService.off('terminalError', onError);
            };
        });
    }

    @Get('logs')
    getSessionLogs(): { logs: string[] } {
        return { logs: this.aiAgentService.getSessionLogs() };
    }

    @Delete('logs')
    clearSessionLogs(): { success: boolean } {
        this.aiAgentService.clearSessionLogs();
        return { success: true };
    }
}
