import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { AgentManager } from '../agents/AgentManager';
import { LLMService } from '../services/llm.service';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        private agentManager: AgentManager,
        private llmService: LLMService
    ) {}

    async createTask(taskData: Partial<Task>): Promise<Task> {
        const task = this.taskRepository.create(taskData);
        await this.analyzeTask(task);
        return this.taskRepository.save(task);
    }

    private async analyzeTask(task: Task): Promise<void> {
        // Use LLM to analyze task requirements and identify needed capabilities
        const analysis = await this.llmService.analyzeTask(task.description);
        task.capabilities = analysis.requiredCapabilities;
        task.metadata = {
            ...task.metadata,
            analysis: analysis.details,
            estimatedSteps: analysis.steps
        };
    }

    async startTask(taskId: string): Promise<Task> {
        const task = await this.taskRepository.findOneOrFail({ where: { id: taskId } });
        const agent = await this.agentManager.findAvailableAgent(task.capabilities);

        if (!agent) {
            throw new Error('No suitable agent available for the task');
        }

        task.status = 'RUNNING';
        task.agentId = agent.id;
        task.startedAt = new Date();
        
        return this.taskRepository.save(task);
    }

    async pauseTask(taskId: string): Promise<Task> {
        const task = await this.taskRepository.findOneOrFail({ where: { id: taskId } });
        
        if (task.status !== 'RUNNING') {
            throw new Error('Only running tasks can be paused');
        }

        task.status = 'PAUSED';
        await this.agentManager.pauseAgent(task.agentId);
        
        return this.taskRepository.save(task);
    }

    async resumeTask(taskId: string): Promise<Task> {
        const task = await this.taskRepository.findOneOrFail({ where: { id: taskId } });
        
        if (task.status !== 'PAUSED') {
            throw new Error('Only paused tasks can be resumed');
        }

        task.status = 'RUNNING';
        await this.agentManager.resumeAgent(task.agentId);
        
        return this.taskRepository.save(task);
    }

    async updateTaskProgress(taskId: string, progress: any): Promise<Task> {
        const task = await this.taskRepository.findOneOrFail({ where: { id: taskId } });
        task.progress = progress;
        
        if (progress.current === progress.total) {
            task.status = 'COMPLETED';
            task.completedAt = new Date();
        }
        
        return this.taskRepository.save(task);
    }

    async getTaskWithChildren(taskId: string): Promise<Task[]> {
        return this.taskRepository.find({
            where: [
                { id: taskId },
                { parentTaskId: taskId }
            ],
            order: {
                createdAt: 'ASC'
            }
        });
    }

    async getAllActiveTasks(): Promise<Task[]> {
        return this.taskRepository.find({
            where: [
                { status: 'RUNNING' },
                { status: 'PAUSED' }
            ],
            order: {
                createdAt: 'DESC'
            }
        });
    }
}
