import fs from 'fs/promises';
import {AIService} from '../services/ai';
import {Content, ContentEnrichment} from '../types';

export async function enrichContent(options: any) {
    if (!options.file) {
        console.error('Error: --file parameter is required');
        process.exit(1);
    }

    try {
        const fileContent = await fs.readFile(options.file, 'utf8');
        const content: Content = JSON.parse(fileContent);

        const ai = new AIService( process.env.OPENAI_API_KEY || '');
        const enrichment: ContentEnrichment = {
            type: options.type as any,
            data: null,
            timestamp: Date.now()
        };

        console.log(`Enriching content with ${options.type}`);

        switch (options.type) {
            case 'summary':
                enrichment.data = await ai.summarize(content);
                break;
            case 'keywords':
                enrichment.data = await ai.extractKeywords(content);
                break;
            case 'sentiment':
                enrichment.data = await ai.analyzeSentiment(content);
                break;
            default:
                console.error(`Unknown enrichment type: ${options.type}`);
                process.exit(1);
        }

        if (!content.enrichments) {
            content.enrichments = [];
        }
        content.enrichments.push(enrichment);

        if (options.output) {
            await fs.writeFile(options.output, JSON.stringify(content, null, 2));
            console.log(`Enriched content saved to ${options.output}`);
        } else {
            console.log(JSON.stringify(content, null, 2));
        }
    } catch (error) {
        console.error('Error during content enrichment:', error);
        process.exit(1);
    }
}
