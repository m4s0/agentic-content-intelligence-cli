import fs from 'fs/promises';
import {AIService} from '../services/ai';
import {Content} from '../types';

export async function organizeContent(options: any) {
    if (!options.file) {
        console.error('Error: --file parameter is required');
        process.exit(1);
    }

    if (!options.categories) {
        console.error('Error: --categories parameter is required');
        process.exit(1);
    }

    try {
        const fileContent = await fs.readFile(options.file, 'utf8');
        const content: Content = JSON.parse(fileContent);

        const categories = options.categories.split(',').map((c: string) => c.trim());
        console.log(`Organizing content into categories: ${categories.join(', ')}`);

      const ai = new AIService( process.env.OPENAI_API_KEY || '');
        content.categories = await ai.categorize(content, categories);

        if (options.output) {
            await fs.writeFile(options.output, JSON.stringify(content, null, 2));
            console.log(`Organized content saved to ${options.output}`);
        } else {
            console.log(JSON.stringify(content, null, 2));
        }
    } catch (error) {
        console.error('Error during content organization:', error);
        process.exit(1);
    }
}
