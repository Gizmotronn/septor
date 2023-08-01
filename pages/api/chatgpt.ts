// pages/api/chatgpt.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { message } = req.body;
  
      try {
        const response = await fetch('http://127.0.0.1:5000/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: message }),
        });
  
        if (response.ok) {
          const data = await response.json();
          res.status(200).json({ reply: data.answer });
        } else {
          res.status(response.status).json({ error: 'Failed to fetch response from ChatGPT' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
}  