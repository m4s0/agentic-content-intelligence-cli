import {ScrapingAgent} from '../agents/ScrapingAgent';
import {SummaryAgent} from '../agents/SummaryAgent';
import {KeyTakeawaysAgent} from '../agents/KeyTakeawaysAgent';
import {KnowledgeBaseAgent} from '../agents/KnowledgeBaseAgent';
import {IntentClassifier} from './IntentClassifier';
import {ContentItem} from '../types';
import {Intent} from "./Intent";

export class ContentIntelligenceOrchestrator {
    private scrapingAgent: ScrapingAgent;
    private summaryAgent: SummaryAgent;
    private takeawaysAgent: KeyTakeawaysAgent;
    private knowledgeBaseAgent: KnowledgeBaseAgent;
    private intentClassifier: IntentClassifier;

    constructor() {
        this.scrapingAgent = new ScrapingAgent();
        this.summaryAgent = new SummaryAgent();
        this.takeawaysAgent = new KeyTakeawaysAgent();
        this.knowledgeBaseAgent = new KnowledgeBaseAgent();
        this.intentClassifier = new IntentClassifier();
    }

    async processPrompt(prompt: string): Promise<{
        intent: Intent;
        results: any;
        executionSummary: string;
    }> {
        // Classify user intent
        const intent = await this.intentClassifier.classifyIntent(prompt);

        // Execute based on intent
        let results: any;
        let executionSummary: string;

        switch (intent.action) {
            case 'crawl':
                results = await this.handleCrawl(intent);
                executionSummary = this.createCrawlSummary(results);
                break;

            case 'summarize':
                results = await this.handleSummarize(intent);
                executionSummary = this.createSummarizeSummary(results);
                break;

            case 'extract_takeaways':
                results = await this.handleExtractTakeaways(intent);
                executionSummary = this.createTakeawaysSummary(results);
                break;

            case 'build_knowledge_base':
                results = await this.handleBuildKnowledgeBase(intent);
                executionSummary = this.createKnowledgeBaseSummary(results);
                break;

            case 'query_knowledge_base':
                results = await this.handleQueryKnowledgeBase(intent);
                executionSummary = this.createQuerySummary(results);
                break;

            case 'full_analysis':
                results = await this.handleFullAnalysis(intent);
                executionSummary = this.createFullAnalysisSummary(results);
                break;

            default:
                throw new Error(`Unknown action: ${intent.action}`);
        }

        return {intent, results, executionSummary};
    }

    private async handleCrawl(intent: Intent): Promise<any> {
        if (!intent.entities.urls || intent.entities.urls.length === 0) {
            throw new Error('No URLs provided for crawling');
        }

        const response = await this.scrapingAgent.execute({
            type: 'crawl',
            input: {urls: intent.entities.urls}
        });

        if (!response.success) {
            throw new Error(response.error || 'Crawling failed');
        }

        return response.data;
    }

    private async handleSummarize(intent: Intent): Promise<any> {
        let contentItems: ContentItem[];

        if (intent.entities.urls && intent.entities.urls.length > 0) {
            // First crawl the URLs
            const crawlResponse = await this.scrapingAgent.execute({
                type: 'crawl',
                input: {urls: intent.entities.urls}
            });

            if (!crawlResponse.success) {
                throw new Error(crawlResponse.error || 'Failed to crawl URLs for summarization');
            }

            contentItems = crawlResponse.data;
        } else {
            throw new Error('No content available for summarization');
        }

        const summaryResponse = await this.summaryAgent.execute({
            type: 'summarize',
            input: {contentItems}
        });

        if (!summaryResponse.success) {
            throw new Error(summaryResponse.error || 'Summarization failed');
        }

        return summaryResponse.data;
    }

    private async handleExtractTakeaways(intent: Intent): Promise<any> {
        let contentItems: ContentItem[];

        if (intent.entities.urls && intent.entities.urls.length > 0) {
            const crawlResponse = await this.scrapingAgent.execute({
                type: 'crawl',
                input: {urls: intent.entities.urls}
            });

            if (!crawlResponse.success) {
                throw new Error(crawlResponse.error || 'Failed to crawl URLs for takeaway extraction');
            }

            contentItems = crawlResponse.data;
        } else {
            throw new Error('No content available for takeaway extraction');
        }

        const takeawaysResponse = await this.takeawaysAgent.execute({
            type: 'extract_takeaways',
            input: {contentItems}
        });

        if (!takeawaysResponse.success) {
            throw new Error(takeawaysResponse.error || 'Takeaway extraction failed');
        }

        return takeawaysResponse.data;
    }

    private async handleBuildKnowledgeBase(intent: Intent): Promise<any> {
        if (!intent.entities.urls || intent.entities.urls.length === 0) {
            throw new Error('No URLs provided for knowledge base building');
        }

        // Crawl content
        const crawlResponse = await this.scrapingAgent.execute({
            type: 'crawl',
            input: {urls: intent.entities.urls}
        });

        if (!crawlResponse.success) {
            throw new Error(crawlResponse.error || 'Failed to crawl content');
        }

        // Store in knowledge base
        const storeResponse = await this.knowledgeBaseAgent.execute({
            type: 'store',
            input: {contentItems: crawlResponse.data}
        });

        if (!storeResponse.success) {
            throw new Error(storeResponse.error || 'Failed to store content in knowledge base');
        }

        return {
            crawledContent: crawlResponse.data,
            storageResult: storeResponse.data,
            metadata: {
                ...crawlResponse.metadata,
                ...storeResponse.metadata
            }
        };
    }

    private async handleQueryKnowledgeBase(intent: Intent): Promise<any> {
        if (!intent.entities.question) {
            throw new Error('No question provided for knowledge base query');
        }

        const queryResponse = await this.knowledgeBaseAgent.execute({
            type: 'query',
            input: {question: intent.entities.question}
        });

        if (!queryResponse.success) {
            throw new Error(queryResponse.error || 'Knowledge base query failed');
        }

        return queryResponse.data;
    }

    private async handleFullAnalysis(intent: Intent): Promise<any> {
        if (!intent.entities.urls || intent.entities.urls.length === 0) {
            throw new Error('No URLs provided for full analysis');
        }

        // Step 1: Crawl content
        const crawlResponse = await this.scrapingAgent.execute({
            type: 'crawl',
            input: {urls: intent.entities.urls}
        });

        if (!crawlResponse.success) {
            throw new Error(crawlResponse.error || 'Failed to crawl content');
        }

        let contentItems = crawlResponse.data;

        // Step 2: Generate summaries
        const summaryResponse = await this.summaryAgent.execute({
            type: 'summarize',
            input: {contentItems}
        });

        if (summaryResponse.success) {
            contentItems = summaryResponse.data;
        }

        // Step 3: Extract key takeaways
        const takeawaysResponse = await this.takeawaysAgent.execute({
            type: 'extract_takeaways',
            input: {contentItems}
        });

        if (takeawaysResponse.success) {
            contentItems = takeawaysResponse.data;
        }

        // Step 4: Store in knowledge base
        const storeResponse = await this.knowledgeBaseAgent.execute({
            type: 'store',
            input: {contentItems}
        });

        return {
            crawledContent: contentItems,
            summaryGenerated: summaryResponse.success,
            takeawaysExtracted: takeawaysResponse.success,
            storedInKnowledgeBase: storeResponse.success,
            metadata: {
                totalUrls: intent.entities.urls.length,
                successfulScrapes: crawlResponse.metadata?.successfulScrapes || 0,
                chunksCreated: storeResponse.metadata?.chunksCreated || 0
            }
        };
    }

    private createCrawlSummary(results: ContentItem[]): string {
        return `Successfully crawled ${results.length} page(s). Total content gathered: ${results.reduce((sum, item) => sum + item.metadata.wordCount, 0)} words.`;
    }

    private createSummarizeSummary(results: ContentItem[]): string {
        const withSummaries = results.filter(item => item.summary).length;
        return `Generated summaries for ${withSummaries} out of ${results.length} content item(s).`;
    }

    private createTakeawaysSummary(results: ContentItem[]): string {
        const withTakeaways = results.filter(item => item.keyTakeaways?.length).length;
        return `Extracted key takeaways from ${withTakeaways} out of ${results.length} content item(s).`;
    }

    private createKnowledgeBaseSummary(results: any): string {
        return `Built knowledge base with ${results.metadata?.documentsStored || 0} document(s) and ${results.metadata?.chunksCreated || 0} searchable chunks.`;
    }

    private createQuerySummary(results: any): string {
        return `Retrieved answer from knowledge base with ${results.sources?.length || 0} relevant source(s).`;
    }

    private createFullAnalysisSummary(results: any): string {
        return `Complete analysis finished: ${results.metadata?.successfulScrapes || 0} pages crawled, summaries and takeaways generated, ${results.metadata?.chunksCreated || 0} chunks stored in knowledge base.`;
    }
}
