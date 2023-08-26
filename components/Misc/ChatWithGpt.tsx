import React, { useState, useEffect } from 'react';
import { MainContainer, ChatContainer, MessageList, TypingIndicator, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const API_KEY = "sk-";

interface ChatWithGptProps {
  message: string;
}

const ChatWithGpt: React.FC<ChatWithGptProps> = ({ message }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [urlSafetyScore, setUrlSafetyScore] = useState<number | null>(null);
  const [totalUrlSafetyScore, setTotalUrlSafetyScore] = useState<number | null>(null);

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
          const newUrlSafetyScore = (100 - probability) * 2.0;

          // Add to the total URL safety score
          setTotalUrlSafetyScore((prevTotal) =>
            prevTotal !== null ? prevTotal + newUrlSafetyScore : newUrlSafetyScore
          );
          setUrlSafetyScore(newUrlSafetyScore);

          // Add user input and safety scores to Supabase
          if (session?.user) {
            await addPromptToSupabase(message, newUrlSafetyScore);
          }
        }

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

  async function addPromptToSupabase(message: string, newUrlSafetyScore: number) {
    try {
      const { data, error } = await supabase.from('proompts').upsert([
        {
          user_id: session?.user?.id,
          prompt_text: message,
          urlSafetyScore: newUrlSafetyScore,
        },
      ]);

      if (error) {
        console.error('Error adding prompt to Supabase:', error.message);
      } else {
        console.log('Prompt added to Supabase successfully.');
      }
    } catch (error) {
      console.error('Error adding prompt to Supabase:', error.message);
    }
  }

  return (
    <div className='w-full max-w-screen-lg mx-auto p-4 text-center'>
      <div className="p-4 rounded-lg">
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
              className="max-h-128 overflow-y-auto rounded bg-white p-2"
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
              {urlSafetyScore !== null && (
                <div className="mt-4">
                  <p className="text-lg font-semibold">URL Scam Risk: {urlSafetyScore.toFixed(2)}%</p>
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

export default ChatWithGpt;