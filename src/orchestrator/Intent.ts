export type Intent = {
    action: 'crawl' | 'summarize' | 'extract_takeaways' | 'build_knowledge_base' | 'query_knowledge_base' | 'full_analysis';
    entities: {
        urls?: string[];
        question?: string | null;
        domain?: string;
    };
    confidence: number;
}