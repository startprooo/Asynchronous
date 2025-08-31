import { chromium, Browser, Page } from 'playwright';

export class BrowserAutomation {
    private browser: Browser | null = null;

    async initialize(): Promise<void> {
        this.browser = await chromium.launch({
            headless: true
        });
    }

    async executeAction(action: {
        type: 'navigate' | 'click' | 'type' | 'screenshot';
        data: any;
    }): Promise<any> {
        if (!this.browser) {
            await this.initialize();
        }

        const page = await this.createPage();
        
        try {
            switch (action.type) {
                case 'navigate':
                    await page.goto(action.data.url);
                    break;
                case 'click':
                    await page.click(action.data.selector);
                    break;
                case 'type':
                    await page.fill(action.data.selector, action.data.text);
                    break;
                case 'screenshot':
                    return await page.screenshot({
                        path: action.data.path,
                        fullPage: action.data.fullPage
                    });
            }
        } finally {
            await page.close();
        }
    }

    private async createPage(): Promise<Page> {
        if (!this.browser) {
            throw new Error('Browser not initialized');
        }
        return await this.browser.newPage();
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
