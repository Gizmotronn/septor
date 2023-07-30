import { useState } from 'react';

const ChatGPTComponent: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  const handleSendMessage = async () => {
    try {
        // const response = await fetch('/api/check_listen', {
        const response = await fetch('http://127.0.0.1:5000/check_listen', {
            method: 'GET',
        });

      if (response.ok) {
        const data = await response.json();
        setResponse(data.reply);
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