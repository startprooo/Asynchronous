import { test, expect } from '@playwright/test';
import { DMRService } from '../src/lib/dmr';

// Test utilities
async function mockModelResponse(page, response) {
  await page.route('**/chat/completions', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

test.describe('DMR End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('Chat Interface - Basic Functionality', async ({ page }) => {
    await test.step('Input field and send button are interactive', async () => {
      const input = page.getByRole('textbox', { name: /message/i });
      const sendButton = page.getByRole('button', { name: /send/i });

      await expect(input).toBeEnabled();
      await expect(sendButton).toBeEnabled();
    });

    await test.step('Message submission and response flow', async () => {
      const input = page.getByRole('textbox', { name: /message/i });
      await input.fill('Hello');
      await page.getByRole('button', { name: /send/i }).click();

      await expect(page.getByText('Hello')).toBeVisible();
      await expect(page.getByRole('status')).toBeVisible();
      await expect(page.getByRole('status')).not.toBeVisible({ timeout: 10000 });
    });
  });

  test('Streaming Responses', async ({ page }) => {
    await test.step('Handles streaming responses correctly', async () => {
      // Mock streaming response
      await page.route('**/chat/completions', async route => {
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            const chunks = [
              'Hello',
              ' world',
              '! How',
              ' can I',
              ' help?'
            ];
            
            for (const chunk of chunks) {
              const data = {
                choices: [{ delta: { content: chunk } }]
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        });

        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: readable
        });
      });

      const input = page.getByRole('textbox', { name: /message/i });
      await input.fill('Test streaming');
      await page.getByRole('button', { name: /send/i }).click();

      await expect(page.getByText('Hello world!')).toBeVisible();
      await expect(page.getByText('How can I help?')).toBeVisible();
    });
  });

  test('Error Handling', async ({ page }) => {
    await test.step('Handles network errors gracefully', async () => {
      await page.route('**/chat/completions', route => route.abort('failed'));
      
      const input = page.getByRole('textbox', { name: /message/i });
      await input.fill('This should fail');
      await page.getByRole('button', { name: /send/i }).click();

      await expect(page.getByText(/error/i)).toBeVisible();
      await expect(input).toBeEnabled();
    });

    await test.step('Handles server errors gracefully', async () => {
      await page.route('**/chat/completions', route =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        })
      );

      const input = page.getByRole('textbox', { name: /message/i });
      await input.fill('This should trigger server error');
      await page.getByRole('button', { name: /send/i }).click();

      await expect(page.getByText(/error/i)).toBeVisible();
      await expect(input).toBeEnabled();
    });
  });

  test('Model Monitoring Dashboard', async ({ page }) => {
    await page.goto('/monitoring');

    await test.step('Dashboard components are visible', async () => {
      await expect(page.getByRole('heading', { name: /model monitoring/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /timeframe/i })).toBeVisible();
      await expect(page.getByRole('combobox', { name: /refresh/i })).toBeVisible();
    });

    await test.step('Stats are updated after chat completion', async () => {
      // Navigate to chat and send a message
      await page.goto('/chat');
      const input = page.getByRole('textbox', { name: /message/i });
      await input.fill('Update stats test');
      await page.getByRole('button', { name: /send/i }).click();

      // Go back to monitoring and check stats
      await page.goto('/monitoring');
      await expect(page.getByText(/total tokens/i)).toBeVisible();
      await expect(page.getByText(/avg latency/i)).toBeVisible();
    });

    await test.step('Graph updates automatically', async () => {
      const initialDataPoints = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return canvas?.getContext('2d')?.__getDataPoints?.() || [];
      });

      // Wait for refresh interval
      await page.waitForTimeout(30000);

      const updatedDataPoints = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return canvas?.getContext('2d')?.__getDataPoints?.() || [];
      });

      expect(updatedDataPoints).not.toEqual(initialDataPoints);
    });
  });
});
