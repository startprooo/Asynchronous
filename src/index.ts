import { WebSocket } from 'ws';
import { createClient } from 'redis';
import { AgentManager } from './agents/AgentManager';
import { MCPServer } from './mcp/MCPServer';
import { MCPServerManager } from './mcp/MCPServerManager';
import { BrowserAutomation } from './browser/BrowserAutomation';
import express from 'express';
import { Server as HttpServer } from 'http';
import path from 'path';

export class AsyncSystem {
    private app: express.Application;
    private httpServer: HttpServer;
    private agentManager: AgentManager;
    private mcpServer: MCPServer;
    private mcpManager: MCPServerManager;
    private browserAutomation: BrowserAutomation;
    private redisClient: ReturnType<typeof createClient>;
    private wsServer: WebSocket.Server;

    constructor() {
        this.initializeSystem();
    }

    private async initializeSystem() {
        // Initialize Redis client
        this.redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        await this.redisClient.connect();

        // Initialize WebSocket server
        this.wsServer = new WebSocket.Server({ port: 8080 });
        
        // Initialize core components
        this.agentManager = new AgentManager(this.redisClient);
        this.mcpServer = new MCPServer();
        this.browserAutomation = new BrowserAutomation();

        this.setupWebSocketHandlers();
    }

    private setupWebSocketHandlers() {
        this.wsServer.on('connection', (ws: WebSocket) => {
            ws.on('message', async (message: string) => {
                const data = JSON.parse(message);
                await this.handleMessage(data, ws);
            });
        });
    }

    private async handleMessage(data: any, ws: WebSocket) {
        // Handle different types of messages and route to appropriate agents
        const { type, payload } = data;
        
        switch (type) {
            case 'AGENT_TASK':
                await this.agentManager.handleTask(payload);
                break;
            case 'BROWSER_ACTION':
                await this.browserAutomation.executeAction(payload);
                break;
            case 'MCP_REQUEST':
                await this.mcpServer.handleRequest(payload);
                break;
            default:
                ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
    }
}
