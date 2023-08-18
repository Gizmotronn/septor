import React, { useState, useEffect } from 'react';
import { MainContainer, ChatContainer, MessageList, TypingIndicator, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import axios from 'axios';

const API_KEY = "";
const VIRUS_TOTAL_API_KEY = '';



interface ChatWithGptProps {
  message: string;
}

const ChatWithGpt2: React.FC<ChatWithGptProps> = ({ message }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [urlSafetyScore, setUrlSafetyScore] = useState<number | null>(null);
  const [phoneNumberSafetyScore, setPhoneNumberSafetyScore] = useState<number | null>(null);

  const { user } = useSession();
  const supabase = useSupabaseClient();

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

        // Extract hypothetical probability from the response
        const probabilityMatch = content.match(/(\d+)%/);
        if (probabilityMatch) {
          const probability = parseInt(probabilityMatch[1]);
          // Calculate URL safety score
          const urlSafetyScore = (100 - probability) * 2.0;
          setUrlSafetyScore(urlSafetyScore);
          // Calculate phone number safety score
          const phoneNumberSafetyScore = urlSafetyScore * 1.4;
          setPhoneNumberSafetyScore(phoneNumberSafetyScore);
        }

        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);

        // After receiving a response, add the prompt to the database
        await createPromptEntry(message, urlSafetyScore, phoneNumberSafetyScore);

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

  // Function to add the prompt to the database
  const createPromptEntry = async (text: string, urlSafetyScore: number | null, phoneNumberSafetyScore: number | null) => {
    if (user) {
      try {
        const urls = extractUrls(text);
        const phoneNumbers = extractPhoneNumbers(text);

        await supabase.from('proompts').upsert([
          {
            user_id: user.id,
            prompt_text: text,
            urlSafetyScore: urlSafetyScore,
            phoneNumberSafetyScore: phoneNumberSafetyScore,
            url: urls,
            phone_number: phoneNumbers,
          },
        ], );

        console.log('Prompt entry created successfully.');
      } catch (error) {
        console.error('Error creating prompt entry:', error.message);
      }
    }
  };

  const extractUrls = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlPattern);
    return matches || [];
  };

  const extractPhoneNumbers = (text: string) => {
    const phonePattern = /(?:\+?\d{1,3}[-.●])?\(?\d{3}\)?[-.●\s]?\d{3}[-.●\s]?\d{4}/g;
    const matches = text.match(phonePattern);
    return matches || [];
  };

  return (
    <div className='w-full max-w-screen-lg mx-auto p-4 text-center'>
      <div className="p-4 rounded-lg">
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
              className="max-h-64 overflow-y-auto rounded bg-white p-2"
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
              {urlSafetyScore !== null && phoneNumberSafetyScore !== null && (
                <div className="mt-4">
                  <p className="text-lg font-semibold">URL Safety Score: {urlSafetyScore.toFixed(2)}%</p>
                  <p className="text-lg font-semibold">Phone Number Safety Score: {phoneNumberSafetyScore.toFixed(2)}%</p>
                </div>
              )}
            </MessageList>
            <MessageInput
              placeholder="Send a Message"
              onSend={handleSendRequest}
              className="mt-4"
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
};

export default ChatWithGpt2;