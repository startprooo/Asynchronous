import React from 'react'
import { Conversation } from '@/components/conversation'
import { Message } from '@/components/message'
import { CodeBlock } from '@/components/code-block'

export default function AIDemo() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat Demo</h1>
      <Conversation>
        <Message 
          from="assistant"
          content="Hello! I'm SmolLM2, a compact but capable language model. How can I help you today?"
        />
        <Message 
          from="user"
          content="Can you show me an example of a Python function?"
        />
        <Message 
          from="assistant"
        >
          <div>
            Here's a simple Python function that calculates the factorial of a number:
            <CodeBlock
              language="python"
              code={`def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)

# Example usage
result = factorial(5)
print(f"Factorial of 5 is {result}")  # Output: Factorial of 5 is 120`}
            />
            You can try this function with any positive integer. It uses recursion to calculate the factorial.
          </div>
        </Message>
      </Conversation>
    </div>
  )
}
