import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const PromptForm: React.FC = () => {
  const [promptText, setPromptText] = useState<string>('');
  const [userCredits, setUserCredits] = useState<number>(0);
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => { 
    fetchUserCredits();
  }, []);

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

  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    return urls || [];
  };

  const extractPhoneNumbers = (text: string) => {
    const phoneRegex = /(?:\d{10}|\+\d{1,2}\s?\d{10})/g;
    const phoneNumbers = text.match(phoneRegex);
    return phoneNumbers || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (userCredits < 1) {
      alert('You have insufficient credits to make a prompt.');
      return;
    }
  
    const extractedUrls = extractUrls(promptText);
    const extractedPhoneNumbers = extractPhoneNumbers(promptText);
  
    // Create a new prompt entry
    const { data: promptData, error: promptError } = await supabase
      .from('proompts')
      .insert([
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
    console.log('☢️ Unknown ☢️')
    setUserCredits(userCredits - 1);
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

export default PromptForm;