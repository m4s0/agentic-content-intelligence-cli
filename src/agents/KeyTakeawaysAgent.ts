import {ChatOpenAI} from '@langchain/openai';
import {PromptTemplate} from '@langchain/core/prompts';
import {BaseAgent} from './BaseAgent';
import {AgentResponse, AgentTask, ContentItem} from '../types';

export class KeyTakeawaysAgent extends BaseAgent {
    private llm: ChatOpenAI;
    private takeawaysPrompt: PromptTemplate;

    constructor() {
        super('KeyTakeawaysAgent');
        this.llm = new ChatOpenAI({
            modelName: 'gpt-3.5-turbo',
            temperature: 0.2,
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        this.takeawaysPrompt = PromptTemplate.fromTemplate(`
      Extract exactly 3 key takeaways from the following content.
      Each takeaway should be a clear, actionable insight or important fact.
      Format your response as a numbered list (1., 2., 3.).
      
      Title: {title}
      Content: {content}
      
      Key Takeaways:
    `);
    }

    async execute(task: AgentTask): Promise<AgentResponse> {
        try {
            const {contentItems} = task.input;

            if (!Array.isArray(contentItems)) {
                return this.createErrorResponse('Content items must be provided as an array');
            }

            const itemsWithTakeaways: ContentItem[] = [];

            for (const item of contentItems) {
                try {
                    const prompt = await this.takeawaysPrompt.format({
                        title: item.title,
                        content: this.truncateContent(item.content, 3000)
                    });

                    const response = await this.llm.invoke(prompt);
                    const takeawaysText = response.content.toString().trim();

                    // Parse numbered list into array
                    const keyTakeaways = this.parseTakeaways(takeawaysText);

                    itemsWithTakeaways.push({
                        ...item,
                        keyTakeaways
                    });
                } catch (error) {
                    console.warn(`Failed to extract takeaways from ${item.url}:`, error);
                    itemsWithTakeaways.push(item);
                }
            }

            return this.createSuccessResponse(itemsWithTakeaways, {
                totalItems: contentItems.length,
                processedCount: itemsWithTakeaways.filter(item => item.keyTakeaways).length
            });

        } catch (error) {
            return this.createErrorResponse(
                `Key takeaways extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private truncateContent(content: string, maxLength: number): string {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }

    private parseTakeaways(text: string): string[] {
        const lines = text.split('\n').filter(line => line.trim());
        const takeaways: string[] = [];

        for (const line of lines) {
            const match = line.match(/^\d+\.\s*(.+)$/);
            if (match && takeaways.length < 3) {
                takeaways.push(match[1].trim());
            }
        }

        return takeaways.length > 0 ? takeaways : [text.trim()];
    }
}
