import {ChatOpenAI} from "@langchain/openai";
import {PromptTemplate} from "@langchain/core/prompts";
import {StringOutputParser} from "@langchain/core/output_parsers";
import {Content} from "../types";

export class AIService {
    private model: ChatOpenAI;

    constructor(apiKey: string) {
        this.model = new ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: "gpt-4",
            temperature: 0.2,
        });
    }

    async summarize(content: Content): Promise<string> {
        const prompt = PromptTemplate.fromTemplate(
            "Summarize the following content in a concise way:\n\n{content}"
        );

        const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

        return chain.invoke({
            content: content.body,
        });
    }

    async extractKeywords(content: Content): Promise<string[]> {
        const prompt = PromptTemplate.fromTemplate(
            "Extract the 5-10 most important keywords from this content. Return them as a comma-separated list:\n\n{content}"
        );

        const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

        const result = await chain.invoke({
            content: content.body,
        });

        return result.split(',').map((keyword: string) => keyword.trim());
    }

    async analyzeSentiment(content: Content): Promise<string> {
        const prompt = PromptTemplate.fromTemplate(
            "Analyze the sentiment of this content. Classify it as positive, neutral, or negative, and explain why:\n\n{content}"
        );

        const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

        return chain.invoke({
            content: content.body,
        });
    }

    async categorize(content: Content, categories: string[]): Promise<string[]> {
        const categoriesStr = categories.join(", ");
        const prompt = PromptTemplate.fromTemplate(
            "Categorize the following content into one or more of these categories: {categories}. Return only the applicable categories as a comma-separated list:\n\n{content}"
        );

        const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

        const result = await chain.invoke({
            content: content.body,
            categories: categoriesStr,
        });

        return result.split(',').map((category: string) => category.trim());
    }

    async analyzeContent(content: Content, query: string): Promise<string> {
        const prompt = PromptTemplate.fromTemplate(
            "Based on the following content, please answer this query: {query}\n\nContent:\n{content}"
        );

        const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

        return chain.invoke({
            content: content.body,
            query,
        });
    }
}
