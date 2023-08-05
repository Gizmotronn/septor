import React, { useState, useEffect } from 'react';
import { MainContainer, ChatContainer, MessageList, TypingIndicator, Message, MessageInput } from '@chatscope/chat-ui-kit-react';

const API_KEY = "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";

interface ChatWithGptProps {
    message: string;
}

const ChatWithGpt: React.FC<ChatWithGptProps> = ({ message }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message) {
      handleSendRequest(message);
    }
  }, [message]);

  const handleSendRequest = async (message: string) => {
    const newMessage = {
      message: message + 'I received this sms. is it likely to be a scam and what are the 5 reasons for this? If it could be a scam, please also provide 5 tips for what to do. Please also provide a hypothetical probability from 0 to 100 of it being a scam. The total response should be less than 200 words.',
      direction: 'outgoing',
      sender: 'user',
    };

    setIsTyping(true);

    try {
      const response = await processMessageToChatGPT(newMessage);
      const content = response.choices[0]?.message?.content;
      if (content) {
        const chatGPTResponse = {
          message: content,
          sender: 'OpenAi',
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  async function processMessageToChatGPT(messageObject: any) {
    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: "I'm a Student using ChatGPT for learning" },
        { role: 'user', content: messageObject.message },
      ],
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    });

    return response.json();
  }

  return (
    <div className="p-4 rounded-lg shadow-md">
      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            className="max-h-64 overflow-y-auto border rounded bg-white p-2"
          >
            {messages.map((message, i) => {
              return <Message key={i} model={message} />;
            })}
          </MessageList>
          <MessageInput
            placeholder="Send a Message"
            onSend={handleSendRequest}
            className="mt-4"
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatWithGpt;