import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import Card from '../components/Card';
import PhoneNumberVerification from '../components/Verification/PhoneNumber';
import SafetyCheck from '../components/Verification/SafetyCheck';

const API_KEY = "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";

// Define the props for the PromptForm component
interface PromptFormProps {
  onSendToChatGPT: (message: string) => void;
}

// Define the PromptForm component
const PromptForm: React.FC<PromptFormProps> = ({ onSendToChatGPT }) => {
  const [promptText, setPromptText] = useState<string>('');
  const [userCredits, setUserCredits] = useState<number>(0);
  const supabase = useSupabaseClient();
  const session = useSession();

  // Fetch user credits when the component mounts
  useEffect(() => {
    fetchUserCredits();
  }, []);

  // Fetch user credits from the database
  const fetchUserCredits = async () => {
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', session?.user?.id)
        .single();
      if (!error && data) {
        setUserCredits(data.credits);
      }
    }
  };

  // Define a function to extract URLs from text
  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    return urls || [];
  };

  // Define a function to extract phone numbers from text
  const extractPhoneNumbers = (text: string) => {
    const phoneRegex = /(?:\d{10}|\+\d{1,2}\s?\d{10})/g;
    const phoneNumbers = text.match(phoneRegex);
    return phoneNumbers || [];
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userCredits < 0) {
      alert('You have insufficient credits to make a prompt.');
      return;
    }

    const extractedUrls = extractUrls(promptText);
    const extractedPhoneNumbers = extractPhoneNumbers(promptText);

    // Create a new prompt entry
    const { data: promptData, error: promptError } = await supabase
      .from('proompts') // Use the correct table name here
      .upsert([
        {
          prompt_text: promptText,
          user_id: session?.user?.id,
          url: extractedUrls,
          phone_number: extractedPhoneNumbers,
        },
      ]);

    if (promptError) {
      console.error('Error creating prompt:', promptError);
      return;
    }

    console.log('Prompt created successfully:', promptData);
    setPromptText('');

    // Update user's credits in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: session?.user?.id,
          credits: userCredits - 1,
        },
      ]);

    if (profileError) {
      console.error('Error updating user credits:', profileError);
      return;
    }

    console.log('User credits updated:', profileData);

    // Send the user's message to ChatGPT using the onSendToChatGPT prop
    onSendToChatGPT(promptText);
  };

  return (
    <div>
      <p>Available Credits: {userCredits}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Prompt Text:
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
          />
        </label>
        <button type="submit">Add Prompt</button>
      </form>
    </div>
  );
};

// Define the GptBot component
const GptBot: React.FC = () => {
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

// Define the main page component that combines PromptForm and GptBot
const MainPage: React.FC = () => {
  // Define a state to track the user's prompt
  const [userPrompt, setUserPrompt] = useState<string>('');

  // Define a function to handle sending the user's prompt to ChatGPT
  const handleSendToChatGPT = (message: string) => {
    // Set the user's prompt
    setUserPrompt(message);
  };

  return (
    <div>
      {/* Render the PromptForm component and pass the handleSendToChatGPT function */}
      <PromptForm onSendToChatGPT={handleSendToChatGPT} />
<br /><br /><br /><br /><br />
      {/* Render the GptBot component */}
      <Card noPadding={false}><GptBot /></Card>
      <Card noPadding={true}><PhoneNumberVerification /></Card>
      <SafetyCheck />
    </div>
  );
};

export default MainPage;