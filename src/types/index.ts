export interface Content {
    id?: string;
    url?: string;
    title?: string;
    body: string;
    metadata?: Record<string, any>;
    enrichments?: ContentEnrichment[];
    categories?: string[];
}

export interface ContentEnrichment {
    type: 'summary' | 'keywords' | 'sentiment' | 'entities';
    data: any;
    timestamp: number;
}

export interface AnalysisResult {
    query: string;
    result: any;
    timestamp: number;
}
