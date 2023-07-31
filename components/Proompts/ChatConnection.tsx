import { useState } from 'react';

const ChatGPTComponent: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');

  const handleSendMessage = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }), // Send the question as JSON
      });

      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer);
      } else {
        console.error('Error sending question to Flask:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question..."
      />
      <button onClick={handleSendMessage}>Send</button>
      <p>Answer from ChatGPT:</p>
      <div>{answer}</div>
    </div>
  );
};

export default ChatGPTComponent;