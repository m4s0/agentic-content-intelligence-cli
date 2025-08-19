import {FaissStore} from '@langchain/community/vectorstores/faiss';
import {ChatOpenAI, OpenAIEmbeddings} from '@langchain/openai';
import {Document} from '@langchain/core/documents';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import {PromptTemplate} from '@langchain/core/prompts';
import {BaseAgent} from './BaseAgent';
import {AgentResponse, AgentTask, ContentItem} from '../types';
import * as path from 'path';
import * as fs from 'fs';

export class KnowledgeBaseAgent extends BaseAgent {
    private vectorStore: FaissStore | null = null;
    private readonly embeddings: OpenAIEmbeddings;
    private textSplitter: RecursiveCharacterTextSplitter;
    private llm: ChatOpenAI;
    private qaPrompt: PromptTemplate;
    private readonly storePath: string;

    constructor() {
        super('KnowledgeBaseAgent');
        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });

        this.llm = new ChatOpenAI({
            modelName: 'gpt-3.5-turbo',
            temperature: 0.1,
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        this.qaPrompt = PromptTemplate.fromTemplate(`
      Use the following context to answer the question. If you cannot find the answer in the context, say "I don't have enough information to answer that question."
      
      Context:
      {context}
      
      Question: {question}
      
      Answer:
    `);

        this.storePath = path.join(process.cwd(), 'vector_store');
        this.initializeVectorStore();
    }

    async execute(task: AgentTask): Promise<AgentResponse> {
        try {
            if (task.type === 'store') {
                return await this.storeContent(task.input);
            } else if (task.type === 'query') {
                return await this.queryContent(task.input);
            } else {
                return this.createErrorResponse('Invalid task type for KnowledgeBaseAgent');
            }
        } catch (error) {
            return this.createErrorResponse(
                `Knowledge base operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private async initializeVectorStore(): Promise<void> {
        try {
            if (fs.existsSync(this.storePath)) {
                this.vectorStore = await FaissStore.load(this.storePath, this.embeddings);
            } else {
                // Create empty vector store
                const emptyDocs = [new Document({pageContent: "Initial document", metadata: {}})];
                this.vectorStore = await FaissStore.fromDocuments(emptyDocs, this.embeddings);
                await this.vectorStore.save(this.storePath);
            }
        } catch (error) {
            console.warn('Failed to initialize vector store:', error);
            // Create new vector store if loading fails
            const emptyDocs = [new Document({pageContent: "Initial document", metadata: {}})];
            this.vectorStore = await FaissStore.fromDocuments(emptyDocs, this.embeddings);
        }
    }

    private async storeContent(input: { contentItems: ContentItem[] }): Promise<AgentResponse> {
        const {contentItems} = input;

        if (!this.vectorStore) {
            return this.createErrorResponse('Vector store not initialized');
        }

        const documents: Document[] = [];
        let totalChunks = 0;

        for (const item of contentItems) {
            const chunks = await this.textSplitter.splitText(item.content);

            for (let i = 0; i < chunks.length; i++) {
                documents.push(new Document({
                    pageContent: chunks[i],
                    metadata: {
                        url: item.url,
                        title: item.title,
                        chunkIndex: i,
                        totalChunks: chunks.length,
                        crawledAt: item.metadata.crawledAt.toISOString(),
                        summary: item.summary || '',
                        keyTakeaways: JSON.stringify(item.keyTakeaways || [])
                    }
                }));
            }
            totalChunks += chunks.length;
        }

        await this.vectorStore.addDocuments(documents);
        await this.vectorStore.save(this.storePath);

        return this.createSuccessResponse(
            {message: 'Content stored successfully'},
            {
                documentsStored: contentItems.length,
                chunksCreated: totalChunks
            }
        );
    }

    private async queryContent(input: { question: string }): Promise<AgentResponse> {
        const {question} = input;

        if (!this.vectorStore) {
            return this.createErrorResponse('Vector store not initialized');
        }

        // Retrieve relevant documents
        const relevantDocs = await this.vectorStore.similaritySearch(question, 4);

        if (relevantDocs.length === 0) {
            return this.createSuccessResponse({
                answer: "I don't have any relevant content in my knowledge base to answer that question.",
                sources: []
            });
        }

        // Create context from relevant documents
        const context = relevantDocs
            .map(doc => `Source: ${doc.metadata.title} (${doc.metadata.url})\n${doc.pageContent}`)
            .join('\n\n---\n\n');

        // Generate answer using LLM
        const prompt = await this.qaPrompt.format({context, question});
        const response = await this.llm.invoke(prompt);
        const answer = response.content.toString().trim();

        // Extract unique sources
        const sources = [...new Set(relevantDocs.map(doc => ({
            title: doc.metadata.title,
            url: doc.metadata.url
        })))];

        return this.createSuccessResponse({
            answer,
            sources,
            relevanceScore: relevantDocs.length > 0 ? 'high' : 'low'
        }, {
            documentsRetrieved: relevantDocs.length
        });
    }
}
