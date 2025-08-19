export interface ContentItem {
    url: string;
    title: string;
    content: string;
    summary?: string;
    keyTakeaways?: string[];
    metadata: {
        crawledAt: Date;
        wordCount: number;
        contentType: string;
    };
}

export interface AgentTask {
    type: 'crawl' | 'summarize' | 'extract_takeaways' | 'store' | 'query';
    input: any;
    metadata?: Record<string, any>;
}

export interface AgentResponse {
    success: boolean;
    data: any;
    error?: string;
    metadata?: Record<string, any>;
}

export interface VectorStoreDocument {
    pageContent: string;
    metadata: {
        url: string;
        title: string;
        chunkIndex: number;
        totalChunks: number;
        crawledAt: string;
    };
}
