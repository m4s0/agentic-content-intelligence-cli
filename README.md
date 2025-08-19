# Agentic Content Intelligence CLI

An AI-powered command-line tool that provides intelligent content analysis using LangChain, Firecrawl, and OpenAI. The system can crawl web content, generate summaries, extract key takeaways, build searchable knowledge bases, and answer questions about stored content.

## 🚀 Features

- **Natural Language Interface**: Interact using plain English commands
- **Web Content Crawling**: Extract content from URLs using Firecrawl
- **AI-Powered Analysis**: Generate summaries and key takeaways
- **Vector Knowledge Base**: Store and search content using FAISS
- **Intelligent Routing**: Automatically route tasks to appropriate agents
- **Interactive & Batch Modes**: Use interactively or with single commands

## 🛠️ Technologies

- **Framework**: LangChain.js for agent orchestration
- **Crawling**: Firecrawl.dev for web content extraction
- **AI**: OpenAI GPT models for content analysis
- **Vector Store**: FAISS for semantic search
- **Language**: TypeScript/Node.js
- **CLI**: Commander.js with interactive prompts

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agentic-content-intelligence-cli
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Build the project:
```bash
npm run build
```

5. Link for global usage (optional):
```bash
npm link
```

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=sk-your-openai-api-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
```

## 🎯 Usage

### Command Line Mode

```bash
# Single command
content-cli "Summarize this article: https://example.com/blog/post"

# Interactive mode
content-cli --interactive

# Verbose output
content-cli "Crawl this domain and build a knowledge base" --verbose
```

### Example Commands

1. **Crawl and Summarize**:
   ```bash
   content-cli "Summarize this article and give me the key takeaways: https://blog.example.com/post"
   ```

2. **Build Knowledge Base**:
   ```bash
   content-cli "Crawl this domain, build a knowledge base, and prepare it for Q&A: https://docs.example.com"
   ```

3. **Query Knowledge Base**:
   ```bash
   content-cli "What does the PostHog article say about GDPR compliance?"
   ```

4. **Full Analysis**:
   ```bash
   content-cli "Analyze these URLs completely: https://example1.com https://example2.com"
   ```

## 🏗️ Architecture

### Agent System

The system uses four specialized agents:

1. **ScrapingAgent**: Web content extraction using Firecrawl
2. **SummaryAgent**: Content summarization using GPT
3. **KeyTakeawaysAgent**: Extract 3 key insights per content item
4. **KnowledgeBaseAgent**: Vector storage and semantic search

### Intent Classification

The `IntentClassifier` analyzes user prompts and routes them to appropriate workflows:

- `crawl`: Extract content from URLs
- `summarize`: Generate content summaries
- `extract_takeaways`: Extract key points
- `build_knowledge_base`: Store content for Q&A
- `query_knowledge_base`: Search stored content
- `full_analysis`: Complete end-to-end processing

### Orchestration Flow

```
User Prompt → Intent Classification → Agent Dispatch → Result Aggregation → User Output
```

## 🧠 Prompt Engineering Strategy

### Intent Classification Prompts
- **Temperature**: 0.1 for consistent classification
- **Format**: Structured JSON output for reliable parsing
- **Fallback**: URL extraction and keyword matching

### Content Analysis Prompts
- **Summaries**: 3-4 sentence limit with focus on key insights
- **Takeaways**: Exactly 3 actionable points per content item
- **Q&A**: Context-aware responses with source attribution

### Optimization Techniques
- **Content Chunking**: 1000 characters with 200 overlap for optimal retrieval
- **Temperature Tuning**: Lower for factual tasks, higher for creative synthesis
- **Token Management**: Content truncation for large documents

## 📊 Evaluation Methodology

### Accuracy Metrics
- **Summarization Quality**: Semantic similarity to human-generated summaries
- **Takeaway Relevance**: Manual review of extracted insights
- **Q&A Accuracy**: Fact-checking against source material

### Performance Metrics
- **Response Time**: End-to-end processing duration
- **Crawling Success Rate**: Percentage of successful URL extractions
- **Vector Retrieval Precision**: Relevance of retrieved chunks

### Usability Testing
- **CLI Experience**: Command success rate and error handling
- **Intent Classification**: Accuracy of prompt interpretation
- **Output Quality**: Clarity and usefulness of results

### Testing Commands

```bash
# Accuracy test
content-cli "Summarize: https://known-article.com" > results.txt

# Performance test
time content-cli "Build knowledge base: https://large-site.com"

# Retrieval test
content-cli "What are the main benefits mentioned in the stored articles?"
```

## 🔍 Example Workflows

### 1. Article Analysis
```bash
Input: "Summarize this article and give me the key takeaways: https://techcrunch.com/article"

Process:
1. Intent: full_analysis
2. Scrape article content
3. Generate 3-4 sentence summary
4. Extract 3 key takeaways
5. Store in vector database

Output:
- Article title and summary
- 3 key takeaways
- Confirmation of storage
```

### 2. Knowledge Base Building
```bash
Input: "Crawl this domain and prepare it for Q&A: https://docs.company.com"

Process:
1. Intent: build_knowledge_base
2. Crawl all accessible pages
3. Chunk content for vector storage
4. Create embeddings and store

Output:
- Number of pages crawled
- Total chunks created
- Knowledge base ready confirmation
```

### 3. Information Retrieval
```bash
Input: "What does the documentation say about API rate limits?"

Process:
1. Intent: query_knowledge_base
2. Vector similarity search
3. Retrieve relevant chunks
4. Generate contextual answer

Output:
- Direct answer to question
- Source attribution
- Relevance confidence
```

## 🤖 GenAI Usage Transparency

### Development Assistance
- **Code Generation**: Used GitHub Copilot for boilerplate and utility functions
- **Documentation**: GPT-4 assisted in README structure and content
- **Error Handling**: AI-suggested error messages and edge case handling

### Prompt Engineering
- **Template Creation**: Iterative refinement using GPT-4
- **Output Format Design**: AI-assisted JSON schema design
- **Classification Logic**: AI-generated fallback classification rules

### Testing and Validation
- **Test Case Generation**: AI-generated edge cases and error scenarios
- **Performance Optimization**: AI-suggested chunking strategies
- **User Experience**: AI feedback on CLI interaction patterns

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Manual testing examples:

```bash
# Test crawling
Crawl https://blog.example.com/post

# Test summarization
Summarize https://en.wikipedia.org/wiki/Large_language_model

# Test knowledge base
content-cli "Build knowledge base from: https://docs.example.com"
content-cli "What are the main features mentioned?"
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Network Failures**: Graceful degradation with retry logic
- **API Limits**: Rate limiting and backoff strategies
- **Invalid URLs**: URL validation and user feedback
- **Empty Results**: Meaningful error messages and suggestions

## 📈 Performance Considerations

- **Chunking Strategy**: Optimized for both storage and retrieval
- **Concurrent Processing**: Parallel crawling for multiple URLs
- **Caching**: Vector store persistence across sessions
- **Memory Management**: Efficient document processing

## 🔒 Security

- **API Key Management**: Environment variable protection
- **Input Validation**: URL and prompt sanitization
- **Rate Limiting**: Respect for external API limits
- **Error Disclosure**: Minimal error information exposure

## 🛣️ Future Enhancements

- **Multi-language Support**: Extended language model capabilities
- **Custom Agents**: Plugin architecture for specialized tasks
- **Web Interface**: Browser-based interaction option
- **Batch Processing**: File-based bulk operations
- **Analytics Dashboard**: Usage and performance metrics

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review example commands and outputs

---

Built with ❤️ using LangChain, Firecrawl, and OpenAI