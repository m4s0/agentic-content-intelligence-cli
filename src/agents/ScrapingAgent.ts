// import FirecrawlApp from 'firecrawl-js';
import {BaseAgent} from './BaseAgent';
import {AgentResponse, AgentTask, ContentItem} from '../types';
import FirecrawlApp from "@mendable/firecrawl-js";
import {z} from "zod";

export class ScrapingAgent extends BaseAgent {
    private firecrawl: FirecrawlApp;

    constructor(firecrawlApiKey?: string) {
        super('ScrapingAgent');
        this.firecrawl = new FirecrawlApp({
            apiKey: firecrawlApiKey || process.env.FIRECRAWL_API_KEY || ''
        });
    }

    async execute(task: AgentTask): Promise<AgentResponse> {
        try {
            const {urls} = task.input;

            if (!Array.isArray(urls)) {
                return this.createErrorResponse('URLs must be provided as an array');
            }

            const results: ContentItem[] = [];

            for (const url of urls) {
                try {
                    const schema = z.object({
                        title: z.string(),
                        content: z.string(),
                    });

                    const scrapedData = await this.firecrawl.scrapeUrl(url, {
                        formats: ['markdown', 'html'],
                        // formats: ['json', 'markdown', 'html'],
                        // jsonOptions: {schema: schema},
                        includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'article'],
                        excludeTags: ['script', 'style', 'nav', 'footer', 'aside']
                    });

                    // const scrapedData = await this.firecrawl.scrapeUrl(url, {
                    //     formats: ['json', 'markdown', 'html'],
                    //     // formats: ['markdown', 'html'],
                    //     includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'article'],
                    //     excludeTags: ['script', 'style', 'nav', 'footer', 'aside']
                    // });

                    // if (scrapedData.success && scrapedData.json) {
                    if (scrapedData.success) {
                        const contentItem: ContentItem = {
                            url,
                            title: scrapedData.metadata?.title || 'Untitled',
                            content: scrapedData.markdown || scrapedData.html || '',
                            metadata: {
                                crawledAt: new Date(),
                                wordCount: this.countWords(scrapedData.markdown || ''),
                                contentType: 'web-page'
                            }
                        };
                        results.push(contentItem);
                    }
                } catch (error) {
                    console.warn(`Failed to scrape ${url}:`, error);
                }
            }

            return this.createSuccessResponse(results, {
                totalUrls: urls.length,
                successfulScrapes: results.length
            });

        } catch (error) {
            return this.createErrorResponse(
                `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private countWords(text: string): number {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }
}
