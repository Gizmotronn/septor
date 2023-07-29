"use client"
import React, { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

interface ScamCheckerProps {
  selectedBank: string | null;
}

const ScamChecker: React.FC = ({ }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [messageInput, setMessageInput] = useState<string>('');
  const [userCredits, setUserCredits] = useState<number>(10);
  const [message, setMessage] = useState<string | null>(null);

  const handleMessageInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(event.target.value);
  };

  const checkScam = async () => {
    if (messageInput.trim() === '') {
      alert('Please enter a message.');
      return;
    }

    // Extract URLs and phone numbers
    const urls = extractUrls(messageInput);
    const phoneNumbers = extractPhoneNumbers(messageInput);

    if (urls.length === 0 && phoneNumbers.length === 0) {
      alert('No URLs or phone numbers found in the message.');
      return;
    }

    if (userCredits > 0) {
      setUserCredits(userCredits - 1);

      // Create entry in prompts table
      await createPromptEntry(messageInput, urls, phoneNumbers);

      setMessage('Prompt created and credits deducted.');
    } else {
      setMessage('Insufficient credits');
    }
  };

  // Function to extract URLs from text
const extractUrls = (text: string) => {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlPattern);
  return matches || [];
};

// Function to extract phone numbers from text
const extractPhoneNumbers = (text: string) => {
  const phonePattern = /(?:\+?\d{1,3}[-.●])?\(?\d{3}\)?[-.●\s]?\d{3}[-.●\s]?\d{4}/g;
  const matches = text.match(phonePattern);
  return matches || [];
};

const createPromptEntry = async (text: string, urls: string[], phoneNumbers: string[]) => {
  if (session) {
    const { user } = session;
    try {
      await supabase.from('prompts').upsert([
        {
          user_id: user?.id,
          prompt_text: text,
          urls: urls.join(', '),
          phone_numbers: phoneNumbers.join(', '),
        },
      ]);
      console.log('Prompt entry created successfully.');
    } catch (error: any) {
      console.error('Error creating prompt entry:', error.message);
    }
  }
};

  return (
    <div>
      <h2>Scam Checker</h2>
      <p>User Credits: {userCredits}</p>
      <textarea
        placeholder="Enter potential scam message"
        value={messageInput}
        onChange={handleMessageInputChange}
        rows={4}
      />
      <button onClick={checkScam}>Check</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ScamChecker;