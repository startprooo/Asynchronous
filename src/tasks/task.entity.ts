import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: ['PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    })
    status: string;

    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>;

    @Column('jsonb', { nullable: true })
    progress: {
        current: number;
        total: number;
        steps: Array<{
            name: string;
            status: string;
            output?: any;
        }>;
    };

    @Column('text', { array: true, default: [] })
    capabilities: string[];

    @Column({ nullable: true })
    agentId: string;

    @Column({ nullable: true })
    parentTaskId: string;

    @Column('jsonb', { nullable: true })
    result: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    startedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: true })
    error: string;
}
