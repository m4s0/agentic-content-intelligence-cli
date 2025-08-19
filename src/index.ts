#!/usr/bin/env node

import {Command} from 'commander';
import chalk from 'chalk';
import {config} from 'dotenv';
import {ContentIntelligenceOrchestrator} from './orchestrator/ContentIntelligenceOrchestrator';
import {CLIInterface} from './cli/CLIInterface';

config();

const program = new Command();

program
    .name('content-cli')
    .description('AI-powered content intelligence CLI')
    .version('1.0.0');

program
    .argument('[prompt]', 'Natural language prompt for content intelligence task')
    .option('-i, --interactive', 'Start interactive mode')
    .option('-v, --verbose', 'Enable verbose logging')
    .action(async (prompt: string, options) => {
        try {
            const orchestrator = new ContentIntelligenceOrchestrator();
            const cli = new CLIInterface(orchestrator, options.verbose);

            if (options.interactive || !prompt) {
                await cli.startInteractiveMode();
            } else {
                await cli.processPrompt(prompt);
            }
        } catch (error) {
            console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    });

program.parse();
