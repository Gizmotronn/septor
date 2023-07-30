import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

interface Prompt {
  id: number;
  prompt_text: string;
  user_id: string;
  urls: string[];
  phone_numbers: string[];
  created_at: string;
}

const PromptsList: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    if (session) {
      const { data, error } = await supabase
        .from('proompts')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setPrompts(data);
      }
    }
  };

  return (
    <div>
      <h2>Your Prompts</h2>
      {prompts.length === 0 ? (
        <p>No prompts available.</p>
      ) : (
        <ul>
          {prompts.map((prompt) => (
            <li key={prompt.id}>
              <h3>{prompt.prompt_text}</h3>
              <p>Created at: {prompt.created_at}</p>
              <p>URLs: {prompt.urls.join(', ')}</p>
              <p>Phone Numbers: {prompt.phone_numbers.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PromptsList;