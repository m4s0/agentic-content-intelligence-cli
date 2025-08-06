import dotenv from 'dotenv';
import {Command} from 'commander';
import {fetchContent} from './commands/fetch';
import {enrichContent} from './commands/enrich';
import {organizeContent} from './commands/organize';
import {analyzeContent} from './commands/analyze';

dotenv.config();
const program = new Command();

program
    .name('agentic-content-intelligence-cli')
    .description('CLI tool to fetch, enrich, organize, and analyze content using AI')
    .version('1.0.0');

program
    .command('fetch')
    .description('Fetch content from a URL or file')
    .option('-u, --url <url>', 'URL to fetch content from')
    .option('-f, --file <file>', 'File path to read content from')
    .option('-o, --output <output>', 'Output file to save the fetched content')
    .action(fetchContent);

program
    .command('enrich')
    .description('Enrich content using AI')
    .option('-f, --file <file>', 'File containing content to enrich')
    .option('-o, --output <output>', 'Output file to save the enriched content')
    .option('-t, --type <type>', 'Type of enrichment (summary, keywords, sentiment)', 'summary')
    .action(enrichContent);

program
    .command('organize')
    .description('Organize and categorize content')
    .option('-f, --file <file>', 'File containing content to organize')
    .option('-o, --output <output>', 'Output file to save the organized content')
    .option('-c, --categories <categories>', 'Comma-separated list of categories')
    .action(organizeContent);

program
    .command('analyze')
    .description('Analyze content for insights')
    .option('-f, --file <file>', 'File containing content to analyze')
    .option('-o, --output <output>', 'Output file to save the analysis results')
    .option('-q, --query <query>', 'Specific question or analysis instruction')
    .action(analyzeContent);

program.parse();
