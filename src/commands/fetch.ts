import {CrawlerService} from '../services/crawler';

export async function fetchContent(options: any) {
    const crawler = new CrawlerService(process.env.FIRECRAWL_API_KEY || '', process.env.BASE_URL || '');
    let content;

    try {
        if (options.url) {
            console.log(`Fetching content from URL: ${options.url}`);
            content = await crawler.fetchFromUrl(options.url);
        } else if (options.file) {
            console.log(`Reading content from file: ${options.file}`);
            content = await crawler.fetchFromFile(options.file);
        } else {
            console.error('Error: Either --url or --file must be provided');
            process.exit(1);
        }

        if (options.output) {
            await crawler.saveContent(content, options.output);
        } else {
            console.log(JSON.stringify(content, null, 2));
        }
    } catch (error) {
        console.error('Error during content fetch:', error);
        process.exit(1);
    }
}
