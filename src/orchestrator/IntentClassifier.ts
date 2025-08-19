import {ChatOpenAI} from '@langchain/openai';
import {PromptTemplate} from '@langchain/core/prompts';
import {Intent} from "./Intent";

export class IntentClassifier {
    private llm: ChatOpenAI;
    private classificationPrompt: PromptTemplate;

    constructor() {
        this.llm = new ChatOpenAI({
            model: 'gpt-4.1',
            // modelName: 'gpt-3.5-turbo',
            temperature: 0.1,
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        this.classificationPrompt = PromptTemplate.fromTemplate(`
        Analyze the following user prompt and classify the intent. Extract any URLs, domains, or questions mentioned.

        User Prompt: "{prompt}"

        Classify the intent as one of:
        - crawl: User wants to scrape/crawl specific URLs or domains
        - summarize: User wants summaries of content
        - extract_takeaways: User wants key takeaways extracted
        - build_knowledge_base: User wants to crawl content and store it for Q&A
        - query_knowledge_base: User is asking a question about previously stored content
        - full_analysis: User wants complete analysis (crawl + summarize + takeaways + store)

        Return a JSON object with an action key that is the action type, a list of entities with a urls key that is an array of URLs, a question key that is a question, a domain key that is a domain name, and a confidence key that is a number between 0 and 1.
        `);
    }

    async classifyIntent(prompt: string): Promise<Intent> {
        try {
            const formattedPrompt = await this.classificationPrompt.format({prompt});
            const response = await this.llm.invoke(formattedPrompt);
            const result = JSON.parse(response.content.toString());

            // Validate and normalize the result
            return {
                action: result.action || 'query_knowledge_base',
                entities: {
                    urls: result.entities?.urls || this.extractUrls(prompt),
                    question: result.entities?.question || (result.action === 'query_knowledge_base' ? prompt : null),
                    domain: result.entities?.domain || null
                },
                confidence: result.confidence || 0.5
            };
        } catch (error) {
            console.warn('Intent classification failed, using fallback:', error);
            return this.fallbackClassification(prompt);
        }
    }

    private extractUrls(text: string): string[] {
        const urlRegex = /https?:\/\/[^\s]+/g;
        return text.match(urlRegex) || [];
    }

    private fallbackClassification(prompt: string): Intent {
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes('crawl') || lowerPrompt.includes('scrape')) {
            return {
                action: 'crawl',
                entities: {urls: this.extractUrls(prompt)},
                confidence: 0.7
            };
        }

        if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
            return {
                action: 'summarize',
                entities: {urls: this.extractUrls(prompt)},
                confidence: 0.7
            };
        }

        if (lowerPrompt.includes('takeaway') || lowerPrompt.includes('key points')) {
            return {
                action: 'extract_takeaways',
                entities: {urls: this.extractUrls(prompt)},
                confidence: 0.7
            };
        }

        if (lowerPrompt.includes('knowledge base') || lowerPrompt.includes('build') && lowerPrompt.includes('q&a')) {
            return {
                action: 'build_knowledge_base',
                entities: {urls: this.extractUrls(prompt)},
                confidence: 0.7
            };
        }

        // Default to query if no URLs found, otherwise full analysis
        const urls = this.extractUrls(prompt);

        return {
            action: urls.length > 0 ? 'full_analysis' : 'query_knowledge_base',
            entities: {urls, question: urls.length === 0 ? prompt : null},
            confidence: 0.5
        };
    }
}
