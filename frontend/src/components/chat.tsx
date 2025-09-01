'use client';

import { useState } from 'react';
import { DMRService, ChatMessage } from '@/lib/dmr';
import { Button } from '@/components/ui/button';

export function ChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dmr = new DMRService();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const newMessages = [
      ...messages,
      { role: 'user', content: input } as ChatMessage
    ];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await dmr.chat(newMessages);
      const assistantMessage = response.choices[0].message;
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex flex-col space-y-2">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${
              message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
