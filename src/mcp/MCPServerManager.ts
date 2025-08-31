import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface MCPServerConfig {
    command: string;
    args: string[];
    env?: Record<string, string>;
}

export interface MCPServerOptions {
    name: string;
    config: MCPServerConfig;
}

export class MCPServerManager extends EventEmitter {
    private servers: Map<string, ChildProcess> = new Map();
    private configs: Map<string, MCPServerConfig>;

    constructor(mcpConfig: Record<string, MCPServerConfig>) {
        super();
        this.configs = new Map(Object.entries(mcpConfig));
    }

    async startServer(name: string): Promise<void> {
        if (this.servers.has(name)) {
            return; // Server already running
        }

        const config = this.configs.get(name);
        if (!config) {
            throw new Error(`No configuration found for MCP server: ${name}`);
        }

        const process = spawn(config.command, config.args, {
            env: { ...process.env, ...config.env },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.servers.set(name, process);

        process.stdout.on('data', (data) => {
            this.emit('serverOutput', { name, type: 'stdout', data: data.toString() });
        });

        process.stderr.on('data', (data) => {
            this.emit('serverOutput', { name, type: 'stderr', data: data.toString() });
        });

        process.on('exit', (code) => {
            this.servers.delete(name);
            this.emit('serverExit', { name, code });
        });

        // Wait for server to be ready
        await this.waitForServerReady(process);
    }

    async stopServer(name: string): Promise<void> {
        const server = this.servers.get(name);
        if (server) {
            server.kill();
            this.servers.delete(name);
        }
    }

    async stopAllServers(): Promise<void> {
        for (const [name] of this.servers) {
            await this.stopServer(name);
        }
    }

    private waitForServerReady(process: ChildProcess): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Server startup timeout'));
            }, 30000);

            const onData = (data: Buffer) => {
                const output = data.toString();
                if (output.includes('Server ready')) {
                    clearTimeout(timeout);
                    process.stdout.removeListener('data', onData);
                    resolve();
                }
            };

            process.stdout.on('data', onData);
        });
    }

    isServerRunning(name: string): boolean {
        return this.servers.has(name);
    }

    getRunningServers(): string[] {
        return Array.from(this.servers.keys());
    }
}
