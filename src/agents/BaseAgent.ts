import {AgentResponse, AgentTask} from '../types';

export abstract class BaseAgent {
    protected name: string;

    protected constructor(name: string) {
        this.name = name;
    }

    abstract execute(task: AgentTask): Promise<AgentResponse>;

    getName(): string {
        return this.name;
    }

    protected createSuccessResponse(data: any, metadata?: Record<string, any>): AgentResponse {
        return {success: true, data, metadata};
    }

    protected createErrorResponse(error: string, metadata?: Record<string, any>): AgentResponse {
        return {success: false, data: null, error, metadata};
    }
}
