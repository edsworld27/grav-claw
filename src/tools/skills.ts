import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');
const QUARANTINE_DIR = path.join(SKILLS_DIR, 'quarantine');

// Ensure directories exist
if (!fs.existsSync(SKILLS_DIR)) fs.mkdirSync(SKILLS_DIR, { recursive: true });
if (!fs.existsSync(QUARANTINE_DIR)) fs.mkdirSync(QUARANTINE_DIR, { recursive: true });

export function listAvailableSkills(): string[] {
    if (!fs.existsSync(SKILLS_DIR)) return [];
    try {
        return fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'));
    } catch (e) {
        console.error('[Skills] Error listing skills:', e);
        return [];
    }
}

export function getSkillContent(skillName: string): string {
    const filePath = path.join(SKILLS_DIR, skillName.endsWith('.md') ? skillName : `${skillName}.md`);
    if (!fs.existsSync(filePath)) return '';
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.error(`[Skills] Error reading skill ${skillName}:`, e);
        return '';
    }
}

export const skillTools = [
    {
        name: 'skill_list',
        description: 'List all available skills (SOPs/Workflows) that the agent can execute.',
        parameters: { type: 'object', properties: {} },
        execute: async () => {
            const skills = listAvailableSkills();
            return skills.length > 0
                ? `Available skills:\n${skills.map(s => `- ${s}`).join('\n')}`
                : "No skills registered yet. Add .md files to the /skills folder.";
        }
    },
    {
        name: 'skill_execute',
        description: 'Read and follow the instructions in a specific skill Markdown file.',
        parameters: {
            type: 'object',
            properties: {
                skillName: { type: 'string', description: 'The name of the skill file (e.g., "deploy" for "deploy.md")' }
            },
            required: ['skillName']
        },
        execute: async ({ skillName }: any) => {
            const content = getSkillContent(skillName);
            if (!content) return `Skill "${skillName}" not found.`;
            return `### Executing Skill: ${skillName}\n\n${content}\n\n[Instruction]: Please follow the steps above carefully.`;
        }
    },
    {
        name: 'skill_draft',
        description: 'Draft a new Markdown skill (SOP or Workflow) representing a new capability. This cannot be immediately executed. It is sent to a quarantine staging area for Administrator review.',
        parameters: {
            type: 'object',
            properties: {
                skillName: { type: 'string', description: 'The filename for the skill (e.g. "code_review" - no .md extension)' },
                content: { type: 'string', description: 'The exhaustive Markdown content of the new skill.' }
            },
            required: ['skillName', 'content']
        },
        execute: async ({ skillName, content }: any) => {
            const safeName = skillName.replace(/[^a-zA-Z0-9_\-]/g, '').toLowerCase() + '.md';
            const draftPath = path.join(QUARANTINE_DIR, safeName);

            try {
                fs.writeFileSync(draftPath, content);

                // Trigger Telegram Notification
                const { config } = await import('../config.js');
                const { bot } = await import('../bot.js');

                await bot.api.sendMessage(config.telegramUserId,
                    `🚨 *NEW SKILL PROPOSED (QUARANTINED)*
*Skill Name:* \`${safeName}\`

The agent is attempting to install a new capability. The code has been quarantined and cannot be executed without your authorization.

Review the file at \`skills/quarantine/${safeName}\`.

To authorize and install this skill, reply with:
\`/approve_skill ${safeName}\`

To reject and delete it, reply with:
\`/reject_skill ${safeName}\``, { parse_mode: 'Markdown' });

                return `Skill draft '${safeName}' has been successfully written to the quarantine staging area. You CANNOT use this skill until the Administrator explicitly reviews and approves the installation via Telegram. Please move on to your next task while waiting for approval.`;
            } catch (err: any) {
                return `Error drafting skill: ${err.message}`;
            }
        }
    }
];
