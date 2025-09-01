import { test, expect, Page } from '@playwright/test';
import type { Route, Response } from '@playwright/test';
import { DMRService } from '../src/lib/dmr';

// Test data
const TEST_PROMPTS = [
  'Tell me about the weather',
  'What is the capital of France?',
  'How does photosynthesis work?'
];

const STREAMING_TEST_PROMPT = 'Write a short story about a robot';

declare global {
  interface Window {
    __MODEL_STATS__: {
      requestCount: number;
      totalTokens: number;
      averageLatency: number;
    };
  }
}

test.describe('DMR Integration Tests', () => {
  let dmr: DMRService;

  test.beforeEach(() => {
    dmr = new DMRService();
  });

  test('Chat component renders and handles user input', async ({ page }) => {
    await page.goto('/chat');

    // Test component rendering
    await test.step('Verify chat interface is visible', async () => {
      const input = page.getByRole('textbox');
      const sendButton = page.getByRole('button', { name: 'Send' });
      
      await expect(input).toBeVisible();
      await expect(sendButton).toBeVisible();
    });

    // Test message sending
    await test.step('Send a message and verify response', async () => {
      const input = page.getByRole('textbox');
      await input.fill('Hello, can you help me?');
      await page.getByRole('button', { name: 'Send' }).click();

      // Verify user message appears
      await expect(page.getByText('Hello, can you help me?')).toBeVisible();

      // Wait for and verify AI response
      await expect(page.getByRole('status')).not.toBeVisible();
      await expect(page.locator('.bg-gray-100')).toBeVisible();
    });
  });

  test('Chat component handles errors gracefully', async ({ page }) => {
    await page.goto('/chat');
    
    // Simulate network error
    await page.route('**/chat/completions', route => route.abort());

    await test.step('Verify error handling', async () => {
      const input = page.getByRole('textbox');
      await input.fill('This should fail');
      await page.getByRole('button', { name: 'Send' }).click();

      // Verify error message appears
      await expect(page.getByText(/error/i)).toBeVisible();
      
      // Verify input is re-enabled
      await expect(input).toBeEnabled();
    });
  });

  test('Model monitoring tracks usage correctly', async ({ page }) => {
    await page.goto('/chat');

    await test.step('Track model usage', async () => {
      // Send multiple messages
      const messages = ['Hello', 'How are you?', 'What is the weather?'];
      for (const message of messages) {
        await page.getByRole('textbox').fill(message);
        await page.getByRole('button', { name: 'Send' }).click();
        await page.waitForResponse(res => res.url().includes('/chat/completions'));
      }

      // Check usage statistics
      const stats = await page.evaluate(() => {
        return window.__MODEL_STATS__;
      });

      expect(stats).toBeDefined();
      expect(stats.requestCount).toBe(messages.length);
      expect(stats.totalTokens).toBeGreaterThan(0);
      expect(stats.averageLatency).toBeGreaterThan(0);
    });
  });
});
