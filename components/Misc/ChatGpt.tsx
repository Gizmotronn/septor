import React, { useState, useEffect } from "react";
import { MainContainer, ChatContainer, MessageList, TypingIndicator, Message, MessageInput } from "@chatscope/chat-ui-kit-react";

const API_KEY = "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";

// Define the GptBot component
export const GptBot: React.FC = () => {
    const [messages, setMessages] = useState<Array<any>>([
      {
        message: "Enter your prompt here",
        sentTime: "just now",
        sender: "ChatGPT",
      },
    ]);
    const [isTyping, setIsTyping] = useState(false);
  
    // Handle sending a message to ChatGPT
    const handleSendRequest = async (message: string) => {
      const newMessage = {
        message: message + ' One of our users received this message via text or email, does this look like a scam?',
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
            message: content,
            sender: "OpenAi",
          };
          setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      } finally {
        setIsTyping(false);
      }
    };
  
    // Process messages and send them to ChatGPT
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
              <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    );
  };