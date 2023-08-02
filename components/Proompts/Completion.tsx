import React, { useState, useEffect } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

const API_KEY = "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";

const ChatGPTComponent: React.FC = () => {
  const [messages, setMessages] = useState<Array<any>>([
    {
      message: "Enter your prompt",
      sentTime: "just now",
      sender: "OpenAi",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [promptText, setPromptText] = useState<string>('');
  const supabase = useSupabaseClient();
  const session = useSession();

  const handleSendRequest = async () => {
    if (!promptText) return; // Don't send an empty prompt

    const newMessage = {
      message: promptText + 'This is a message that one of our users received, does this look like a scam?',
      direction: 'outgoing',
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true);

    try {
      const response = await processMessageToChatGPT([...messages, newMessage]);
      const content = response.choices[0]?.message?.content;
      if (content) {
        const chatGPTResponse = {
          message: content + 'This is a message that one of our users received, does this look like a scam?',
          sender: "ChatGPT",
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  async function processMessageToChatGPT(chatMessages: Array<any>) {
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role, content: messageObject.message };
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        { role: "system", content: "I'm a Student using ChatGPT for learning" },
        ...apiMessages,
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    });

    return response.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!promptText) return;

    // Add your logic to store or process the promptText as needed
    // For example, you can use Supabase to store it in your database.

    // Clear the input field
    setPromptText('');
  };

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message);
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Send a Message" value={promptText} onSend={handleSendRequest} />
            <button onClick={handleSubmit}>Submit Prompt</button>
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
};

export default ChatGPTComponent;