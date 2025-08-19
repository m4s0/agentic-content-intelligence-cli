import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import {ContentIntelligenceOrchestrator} from '../orchestrator/ContentIntelligenceOrchestrator';
import {ContentItem} from '../types';

export class CLIInterface {
    private orchestrator: ContentIntelligenceOrchestrator;
    private verbose: boolean;

    constructor(orchestrator: ContentIntelligenceOrchestrator, verbose: boolean = false) {
        this.orchestrator = orchestrator;
        this.verbose = verbose;
    }

    async startInteractiveMode(): Promise<void> {
        console.log(chalk.blue.bold('🧠 Agentic Content Intelligence CLI'));
        console.log(chalk.gray('Enter your natural language prompts. Type "exit" to quit.\n'));

        while (true) {
            const {prompt} = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'prompt',
                    message: chalk.cyan('>')
                }
            ]);

            if (prompt.toLowerCase().trim() === 'exit') {
                console.log(chalk.yellow('Goodbye! 👋'));
                break;
            }

            if (prompt.trim()) {
                await this.processPrompt(prompt);
            }

            console.log(); // Add spacing
        }
    }

    async processPrompt(prompt: string): Promise<void> {
        const spinner = ora('Processing your request...').start();

        try {
            const result = await this.orchestrator.processPrompt(prompt);
            spinner.succeed('Request processed successfully!');

            // Display results based on intent
            this.displayResults(result);

        } catch (error) {
            spinner.fail('Request failed');
            console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');

            if (this.verbose && error instanceof Error) {
                console.error(chalk.gray('Stack trace:'), error.stack);
            }
        }
    }

    private displayResults(result: any): void {
        const {intent, results, executionSummary} = result;

        console.log(chalk.green.bold('\n📊 Results:'));
        console.log(chalk.blue(`Intent: ${intent.action} (confidence: ${(intent.confidence * 100).toFixed(1)}%)`));
        console.log(chalk.gray(`Summary: ${executionSummary}\n`));

        switch (intent.action) {
            case 'crawl':
                this.displayCrawlResults(results);
                break;
            case 'summarize':
                this.displaySummaryResults(results);
                break;
            case 'extract_takeaways':
                this.displayTakeawaysResults(results);
                break;
            case 'build_knowledge_base':
                this.displayKnowledgeBaseResults(results);
                break;
            case 'query_knowledge_base':
                this.displayQueryResults(results);
                break;
            case 'full_analysis':
                this.displayFullAnalysisResults(results);
                break;
        }
    }

    private displayCrawlResults(results: ContentItem[]): void {
        console.log(chalk.yellow.bold('📄 Crawled Content:'));

        results.forEach((item, index) => {
            console.log(chalk.cyan(`\n${index + 1}. ${item.title}`));
            console.log(chalk.gray(`   URL: ${item.url}`));
            console.log(chalk.gray(`   Word count: ${item.metadata.wordCount}`));
            console.log(chalk.gray(`   Crawled: ${item.metadata.crawledAt.toLocaleString()}`));

            if (this.verbose) {
                console.log(chalk.gray(`   Content preview: ${item.content.substring(0, 200)}...`));
            }
        });
    }

    private displaySummaryResults(results: ContentItem[]): void {
        console.log(chalk.yellow.bold('📝 Content Summaries:'));

        results.forEach((item, index) => {
            console.log(chalk.cyan(`\n${index + 1}. ${item.title}`));
            console.log(chalk.gray(`   URL: ${item.url}`));

            if (item.summary) {
                console.log(chalk.white(`   Summary: ${item.summary}`));
            } else {
                console.log(chalk.red('   Summary: Failed to generate'));
            }
        });
    }

    private displayTakeawaysResults(results: ContentItem[]): void {
        console.log(chalk.yellow.bold('🎯 Key Takeaways:'));

        results.forEach((item, index) => {
            console.log(chalk.cyan(`\n${index + 1}. ${item.title}`));
            console.log(chalk.gray(`   URL: ${item.url}`));

            if (item.keyTakeaways && item.keyTakeaways.length > 0) {
                console.log(chalk.white('   Key Takeaways:'));
                item.keyTakeaways.forEach((takeaway, i) => {
                    console.log(chalk.white(`     ${i + 1}. ${takeaway}`));
                });
            } else {
                console.log(chalk.red('   Key Takeaways: Failed to extract'));
            }
        });
    }

    private displayKnowledgeBaseResults(results: any): void {
        console.log(chalk.yellow.bold('🗃️ Knowledge Base:'));
        console.log(chalk.green(`✅ Stored ${results.metadata?.documentsStored || 0} document(s)`));
        console.log(chalk.green(`✅ Created ${results.metadata?.chunksCreated || 0} searchable chunk(s)`));
        console.log(chalk.gray('Content is now available for Q&A queries.'));
    }

    private displayQueryResults(results: any): void {
        console.log(chalk.yellow.bold('🔍 Query Results:'));
        console.log(chalk.white(`\nAnswer: ${results.answer}\n`));

        if (results.sources && results.sources.length > 0) {
            console.log(chalk.blue('📚 Sources:'));
            results.sources.forEach((source: any, index: number) => {
                console.log(chalk.gray(`  ${index + 1}. ${source.title} - ${source.url}`));
            });
        }
    }

    private displayFullAnalysisResults(results: any): void {
        console.log(chalk.yellow.bold('🔬 Full Analysis Results:'));

        if (results.crawledContent) {
            console.log(chalk.green(`✅ Crawled ${results.crawledContent.length} page(s)`));
        }

        if (results.summaryGenerated) {
            console.log(chalk.green('✅ Generated summaries'));
        }

        if (results.takeawaysExtracted) {
            console.log(chalk.green('✅ Extracted key takeaways'));
        }

        if (results.storedInKnowledgeBase) {
            console.log(chalk.green('✅ Stored in knowledge base'));
        }

        console.log(chalk.blue(`\nTotal chunks created: ${results.metadata?.chunksCreated || 0}`));
        console.log(chalk.gray('All content is now available for Q&A queries.'));

        // Display sample content if verbose
        if (this.verbose && results.crawledContent) {
            console.log(chalk.yellow.bold('\n📋 Sample Analysis:'));
            const sample = results.crawledContent[0];
            if (sample) {
                console.log(chalk.cyan(`Title: ${sample.title}`));
                if (sample.summary) {
                    console.log(chalk.white(`Summary: ${sample.summary}`));
                }
                if (sample.keyTakeaways && sample.keyTakeaways.length > 0) {
                    console.log(chalk.white('Key Takeaways:'));
                    sample.keyTakeaways.slice(0, 3).forEach((takeaway: string, i: number) => {
                        console.log(chalk.white(`  ${i + 1}. ${takeaway}`));
                    });
                }
            }
        }
    }
}
