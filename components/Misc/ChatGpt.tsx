import React, { useState, useEffect } from 'react';

interface ChatGptProps {
  onMessageReceived: (response: string) => void;
}

const ChatGpt: React.FC<ChatGptProps> = ({ onMessageReceived }) => {
  const [userMessage, setUserMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Simulate ChatGPT response after 2 seconds (replace with your actual ChatGPT integration)
    const simulateChatGptResponse = async () => {
      setIsLoading(true);
      // Send userMessage to ChatGPT and receive a response
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        const chatGptResponse = data.response; // Replace 'response' with the actual field in your API response
        onMessageReceived(chatGptResponse);
      } else {
        onMessageReceived('Error communicating with ChatGPT');
      }

      setIsLoading(false);
    };

    if (userMessage.trim() !== '') {
      simulateChatGptResponse();
    }
  }, [userMessage, onMessageReceived]);

  const handleUserMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(event.target.value);
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4 text-center">
      <h2 className="text-4xl font-bold mb-6 text-primary">ChatGPT</h2>
      <textarea
        className="w-full px-4 py-2 mb-4 text-xl rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
        placeholder="Type your message..."
        value={userMessage}
        onChange={handleUserMessageChange}
        rows={4}
      />
      <button
        className="px-6 py-3 text-xl font-bold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:bg-primary-dark"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
};

export default ChatGpt;