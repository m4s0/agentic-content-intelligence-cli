import fs from 'fs/promises';
import {AIService} from '../services/ai';
import {AnalysisResult, Content} from '../types';

export async function analyzeContent(options: any) {
    if (!options.file) {
        console.error('Error: --file parameter is required');
        process.exit(1);
    }

    if (!options.query) {
        console.error('Error: --query parameter is required');
        process.exit(1);
    }

    try {
        const fileContent = await fs.readFile(options.file, 'utf8');
        const content: Content = JSON.parse(fileContent);

        console.log(`Analyzing content with query: ${options.query}`);

      const ai = new AIService( process.env.OPENAI_API_KEY || '');
        const analysisResult: AnalysisResult = {
            query: options.query,
            result: await ai.analyzeContent(content, options.query),
            timestamp: Date.now()
        };

        if (options.output) {
            await fs.writeFile(options.output, JSON.stringify(analysisResult, null, 2));
            console.log(`Analysis results saved to ${options.output}`);
        } else {
            console.log(JSON.stringify(analysisResult, null, 2));
        }
    } catch (error) {
        console.error('Error during content analysis:', error);
        process.exit(1);
    }
}
