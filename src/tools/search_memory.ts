import { MemoryTree } from '../memory/treeDb.js';

export const search_memory = {
    name: 'search_memory',
    description: 'Searches the agent long-term memory tree (chapter summaries) for specific historical context or past conversations. Use this if the user asks about something you discussed a long time ago. This acts like a book index.',
    definition: {
        name: 'search_memory',
        description: 'Searches the agent long-term memory tree (chapter summaries) for specific historical context or past conversations. Use this if the user asks about something you discussed a long time ago. This acts like a book index.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Keywords to search for in past memories (e.g. "project ideas", "vacation plan")'
                }
            },
            required: ['query']
        }
    },
    execute: async (args: { query: string }, senderId: string): Promise<string> => {
        try {
            const results = MemoryTree.searchMemoryTree(senderId, args.query);
            if (results.length === 0) {
                return `No historical memory chapters found matching "${args.query}".`;
            }
            return `Historical Context found:\n\n${results.join('\\n\\n')}`;
        } catch (error: any) {
            return `Failed to search memory tree: ${error.message}`;
        }
    }
};

export const searchMemoryTools = [search_memory];
