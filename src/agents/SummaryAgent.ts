import {ChatOpenAI} from '@langchain/openai';
import {PromptTemplate} from '@langchain/core/prompts';
import {BaseAgent} from './BaseAgent';
import {AgentResponse, AgentTask, ContentItem} from '../types';

export class SummaryAgent extends BaseAgent {
    private llm: ChatOpenAI;
    private summaryPrompt: PromptTemplate;

    constructor() {
        super('SummaryAgent');
        this.llm = new ChatOpenAI({
            modelName: 'gpt-3.5-turbo',
            temperature: 0.3,
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        this.summaryPrompt = PromptTemplate.fromTemplate(`
      Please provide a concise 3-4 sentence summary of the following content.
      Focus on the main points, key insights, and most important information.
      
      Title: {title}
      Content: {content}
      
      Summary:
    `);
    }

    async execute(task: AgentTask): Promise<AgentResponse> {
        try {
            const {contentItems} = task.input;

            if (!Array.isArray(contentItems)) {
                return this.createErrorResponse('Content items must be provided as an array');
            }

            const summarizedItems: ContentItem[] = [];

            for (const item of contentItems) {
                try {
                    const prompt = await this.summaryPrompt.format({
                        title: item.title,
                        content: this.truncateContent(item.content, 3000)
                    });

                    const response = await this.llm.invoke(prompt);
                    const summary = response.content.toString().trim();

                    summarizedItems.push({
                        ...item,
                        summary
                    });
                } catch (error) {
                    console.warn(`Failed to summarize ${item.url}:`, error);
                    summarizedItems.push(item);
                }
            }

            return this.createSuccessResponse(summarizedItems, {
                totalItems: contentItems.length,
                summarizedCount: summarizedItems.filter(item => item.summary).length
            });

        } catch (error) {
            return this.createErrorResponse(
                `Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private truncateContent(content: string, maxLength: number): string {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }
}
