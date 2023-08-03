import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import axios from 'axios';

interface ScamCheckerProps {
  onMessageChange: (message: string) => void;
}

const ScamChecker: React.FC<ScamCheckerProps> = ({ onMessageChange }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [messageInput, setMessageInput] = useState<string>('');
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCredits = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user credits:', error.message);
        } else if (data) {
          setUserCredits(data.credits);
        }
      }
    };

    fetchUserCredits();
  }, [session]);

  const handleMessageInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(event.target.value);
  };

  const checkScam = async () => {
    if (messageInput.trim() === '') {
      alert('Please enter a message.');
      return;
    }

    const urls = extractUrls(messageInput);
    const phoneNumbers = extractPhoneNumbers(messageInput);

    if (urls.length === 0 && phoneNumbers.length === 0) {
      alert('No URLs or phone numbers found in the message.');
      return;
    }

    if (userCredits !== null && userCredits < 1) {
      setMessage('Insufficient credits');
      return;
    }

    setUserCredits(userCredits !== null ? userCredits - 1 : null);

    await createPromptEntry(messageInput, urls, phoneNumbers);

    setMessage('Prompt created and credits deducted.');
    onMessageChange(messageInput);

    // Calculate safety score from VirusTotal
    const safetyScore = await fetchSafetyScore(urls[0]); // Assuming only one URL for simplicity
    setSafetyScore(safetyScore);
  };

  const fetchSafetyScore = async (url: string) => {
    const base64Url = btoa(url);
    const virusTotalApiKey = '70e735639aa1bb48201bacd6d94ead8c6d523de7b20cd79d37f9cfa0a2f717c0';

    const options = {
      method: 'GET',
      url: `https://www.virustotal.com/api/v3/urls/${base64Url}`,
      headers: {
        accept: 'application/json',
        'x-apikey': virusTotalApiKey,
      },
    };

    try {
      const response = await axios.request(options);
      const analysisStats = response.data.data.attributes.last_analysis_stats;
      const harmlessPercent = analysisStats.harmless / 100;
      const maliciousPercent = analysisStats.malicious / 100;
      const suspiciousPercent = analysisStats.suspicious / 100;

      // Calculate safety score based on your formula
      const score = harmlessPercent * 0.99 + (maliciousPercent * 0.5 * harmlessPercent * 0.5);

      return score * 100; // Convert to percentage
    } catch (error) {
      console.error('Error fetching safety score:', error);
      return null;
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

  const createPromptEntry = async (text: string, urls: string[], phoneNumbers: string[]) => {
    if (session?.user) {
      try {
        await supabase.from('proompts').upsert([
          {
            user_id: session.user.id,
            prompt_text: text,
            url: urls,
            phone_number: phoneNumbers,
          },
        ]);
        console.log('Prompt entry created successfully.');
      } catch (error) {
        console.error('Error creating prompt entry:', error.message);
      }
    }
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4 text-center">
      <h2 className="text-4xl font-bold mb-6 text-primary">Scam Assure</h2>
      <p className="text-2xl mb-4">
        User Credits: {userCredits !== null ? userCredits : 'Loading...'}
      </p>
      <textarea
        className="w-full px-4 py-2 mb-4 text-xl rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
        placeholder="Enter potential scam message"
        value={messageInput}
        onChange={handleMessageInputChange}
        rows={4}
      />
      <button
        className="px-6 py-3 text-xl font-bold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:bg-primary-dark"
        onClick={checkScam}
      >
        Check
      </button>
      {message && <p className="mt-4 text-xl text-green-500">{message}</p>}
      {safetyScore !== null && (
        <p className="mt-4 text-xl">Safety Score: {safetyScore.toFixed(2)}%</p>
      )}
    </div>
  );
};

export default ScamChecker;