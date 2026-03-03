import { db } from '../db/index.js';

export class MemoryTree {
    static init() {
        // Create table for chapter summaries
        db.exec(`
            CREATE TABLE IF NOT EXISTS memory_tree (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id TEXT NOT NULL,
                summary TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    static saveChapterSummary(senderId: string, summary: string) {
        const stmt = db.prepare('INSERT INTO memory_tree (sender_id, summary) VALUES (?, ?)');
        stmt.run(senderId, summary);
        console.log(`[Memory Tree] Saved new chapter for ${senderId}.`);
    }

    static searchMemoryTree(senderId: string, query: string): string[] {
        // A simple LIKE search based on the chapter summaries.
        const stmt = db.prepare(`
            SELECT summary, created_at FROM memory_tree 
            WHERE sender_id = ? AND summary LIKE ?
            ORDER BY created_at DESC LIMIT 5
        `);
        const keywords = query.split(' ').filter(w => w.length > 3);
        const likeQuery = "%" + keywords.join('%') + "%";

        const results = stmt.all(senderId, likeQuery) as { summary: string, created_at: string }[];
        return results.map(r => `[Chapter from ${r.created_at}]: ${r.summary}`);
    }
}

MemoryTree.init();
