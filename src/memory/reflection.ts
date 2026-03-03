import { getRecentHistory } from '../db/index.js';
import { providerManager } from '../providers/manager.js';
import { toolRegistry } from '../tools/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const LEARNINGS_FILE = path.join(PROJECT_ROOT, 'data', 'source_of_truth', 'LEARNINGS.md');

// Ensure source_of_truth directory exists
const sourceOfTruthDir = path.dirname(LEARNINGS_FILE);
if (!fs.existsSync(sourceOfTruthDir)) {
    fs.mkdirSync(sourceOfTruthDir, { recursive: true });
}

// Initialize learning ledger if it doesn't exist
if (!fs.existsSync(LEARNINGS_FILE)) {
    fs.writeFileSync(LEARNINGS_FILE, `# Omega Learning Ledger\n\nThis document contains concentrated lessons, heuristics, and user preferences distilled from past execution cycles.\n\n## Security Observations\n\n## Token Optimization Rules\n\n## User Preferences\n\n## Workflow Templates\n`, 'utf-8');
}

export class ReflectionEngine {

    /**
     * Triggers the reflection cycle to analyze recent actions and distill knowledge.
     */
    static async reflect(senderId: string, platform: string, explicitTopic?: string): Promise<string> {
        console.log(`[Reflection Engine] Initiating reflection cycle for ${senderId}...`);

        // 1. Fetch recent raw history
        const recentHistoryRows = getRecentHistory(senderId, platform, 30);
        if (recentHistoryRows.length < 5 && !explicitTopic) {
            return "Not enough history to run a meaningful reflection cycle.";
        }

        const historyContext = recentHistoryRows.map(row => `[${row.role.toUpperCase()}]: ${row.content}`).join('\n\n');

        // 2. Load existing learnings
        const currentLearnings = fs.readFileSync(LEARNINGS_FILE, 'utf-8');

        // 3. Build Reflection Prompt
        const prompt = `
You are the Omega Reflection Engine. Your job is to analyze the following recent execution history and the current learning ledger.
You must identify:
1. Inefficient tool use (token wastage).
2. Security near-misses or required constraints.
3. Explicit user preferences (formatting, tone, specific stack choices).
4. Highly successful, repeatable workflows.

Current Ledger:
\`\`\`markdown
${currentLearnings}
\`\`\`

Recent History:
\`\`\`
${explicitTopic ? `Focus Topic: ${explicitTopic}\n` : ''}
${historyContext}
\`\`\`

Instructions:
1. Extract 1-3 new core insights from the history that are not yet in the ledger.
2. If you observed a highly complex, successful, and repeatable workflow, you MUST output a draft for a new skill using the <SKILL_DRAFT> tag.
3. Provide an updated version of the Markdown ledger incorporating your new insights efficiently.

Output Format:
<UPDATED_LEDGER>
[The full markdown text for the updated LEARNINGS.md]
</UPDATED_LEDGER>

<SKILL_DRAFT>
[OPTIONAL: If a workflow is repeatable, write a full markdown skill here. E.g. # Deploy NextJS App...]
</SKILL_DRAFT>
`;

        try {
            const response = await providerManager.createMessage(
                [{ role: 'user', content: prompt }],
                "You are the autonomous self-improvement Reflection Engine. You prioritize token efficiency, security, and structured learning.",
                []
            );

            const text = response.text || '';

            // 4. Update the Ledger
            const updatedLedgerMatch = text.match(/<UPDATED_LEDGER>([\s\S]*?)<\/UPDATED_LEDGER>/);
            if (updatedLedgerMatch && updatedLedgerMatch[1]) {
                const newLedgerContent = updatedLedgerMatch[1].trim();
                fs.writeFileSync(LEARNINGS_FILE, newLedgerContent, 'utf-8');
                console.log(`[Reflection Engine] Updated Distillation Ledger.`);
            }

            // 5. Autonomous Skill Drafting
            const skillDraftMatch = text.match(/<SKILL_DRAFT>([\s\S]*?)<\/SKILL_DRAFT>/);
            if (skillDraftMatch && skillDraftMatch[1].trim().length > 50) {
                const skillContent = skillDraftMatch[1].trim();
                console.log(`[Reflection Engine] Discovered repeatable workflow. Drafting skill to quarantine...`);

                // Let the engine guess a name based on the first line headers
                let skillName = 'autodraft_' + Date.now();
                const firstLine = skillContent.split('\n')[0];
                if (firstLine && firstLine.startsWith('#')) {
                    skillName = firstLine.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 30);
                }

                if (skillName.startsWith('_')) skillName = skillName.substring(1);

                await toolRegistry.executeTool('skill_draft', { skillName, content: skillContent }, senderId);
                return `Reflection complete. Ledger updated and new skill "${skillName}" drafted for human review.`;
            }

            return "Reflection complete. Ledger updated. No new executable skills drafted.";

        } catch (e: any) {
            console.error(`[Reflection Engine] Error during reflection:`, e);
            return `Reflection failed: ${e.message}`;
        }
    }
}
