import { useState } from 'react';

const ChatGPTComponent: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);

  const handleSendMessage = async () => {
    try {
      const apiKey = 'sk-'; // Replace with your OpenAI API key GtZWXRt8zSOWs83eny13T3BlbkFJYsPay5TZpG7MUta1j3yr
      const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions'; // The endpoint for ChatGPT

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: message,
          max_tokens: 50, // Adjust the max tokens as needed
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('ChatGPT Response:', data.choices[0]?.text); // Log the response
        setResponse(data.choices[0]?.text); // Set the response from ChatGPT
      } else {
        console.error('Error sending message to ChatGPT');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
      <p>Response from ChatGPT:</p>
      <div>{response}</div>
    </div>
  );
};

export default ChatGPTComponent;