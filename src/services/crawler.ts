import fs from 'fs/promises';
// import { FirecrawlJS } from '@mendable/firecrawl-js';
import {Content} from '../types';
import FirecrawlApp from "@mendable/firecrawl-js";
import * as z from "zod";

export class CrawlerService {
    private firecrawlApp: FirecrawlApp;

    constructor(apiKey: string, apiUrl: string) {
        this.firecrawlApp = new FirecrawlApp({apiKey, apiUrl});
    }

    async fetchFromUrl(url: string): Promise<Content> {
        try {
            const schema = z.object({
                title: z.string(),
                content: z.string(),
            });

            // const result = await this.firecrawlApp.crawlUrl(url, {
            const result = await this.firecrawlApp.scrapeUrl(url, {
                formats: ["json"],
                jsonOptions: {schema: schema},
            });

            if (!result.success) {
                throw new Error(`Failed to scrape: ${result.error}`);
            }

            if (!result.json || typeof result.json !== 'object') {
                throw new Error('Invalid response format: missing or invalid JSON data');
            }

            const {title = '', content = ''} = result.json;

            return {
                url,
                title: title || '',
                body: content || '',
                metadata: {
                    crawledAt: new Date().toISOString(),
                    source: url
                }
            };
        } catch (error) {
            console.error(`Error fetching content from ${url}:`, error);
            throw error;
        }
    }

    async fetchFromFile(filePath: string): Promise<Content> {
        try {
            const content = await fs.readFile(filePath, 'utf8');

            return {
                body: content,
                metadata: {
                    source: filePath,
                    loadedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            throw error;
        }
    }

    async saveContent(content: Content, outputPath: string): Promise<void> {
        try {
            await fs.writeFile(outputPath, JSON.stringify(content, null, 2));
            console.log(`Content saved to ${outputPath}`);
        } catch (error) {
            console.error(`Error saving content to ${outputPath}:`, error);
            throw error;
        }
    }
}
