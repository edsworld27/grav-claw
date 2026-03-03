import express from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    let browser;
    try {
        console.log(`[Sandbox] Scraping: ${url}`);
        // Launch with arguments optimized for Alpine Docker
        browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        // Remove scripts, styles, etc to clean up text
        $('script, style, nav, footer, header, aside').remove();

        // Extract pure text
        const text = $('body').text().replace(/\s+/g, ' ').trim();

        // Return truncated strict limit
        res.json({ text: text.slice(0, 10000) });

    } catch (error) {
        console.error(`[Sandbox Error]`, error);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'submarine-sandbox' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[🚀 Submarine Sandbox] API listening on port ${PORT}`);
});
