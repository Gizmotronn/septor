import React, { useState } from 'react';

interface ScamCheckerProps {
  onMessageChange: (message: string, urlSafetyScore: number | null, phoneNumberSafetyScore: number | null) => void;
}

const ScamChecker: React.FC<ScamCheckerProps> = ({ onMessageChange }) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [urlSafetyScore, setUrlSafetyScore] = useState<number | null>(null);
  const [phoneNumberSafetyScore, setPhoneNumberSafetyScore] = useState<number | null>(null);

  const handleMessageInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(event.target.value);
  };

  const checkScam = async () => {
    onMessageChange(messageInput, urlSafetyScore, phoneNumberSafetyScore);
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4 text-center">
      <h2 className="text-4xl font-bold mb-6 text-primary">Scam Assure</h2>
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
      {urlSafetyScore !== null && phoneNumberSafetyScore !== null && (
        <div className="mt-4">
          <p className="text-lg font-semibold">URL Safety Score: {urlSafetyScore.toFixed(2)}%</p>
          <p className="text-lg font-semibold">Phone Number Safety Score: {phoneNumberSafetyScore.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default ScamChecker;