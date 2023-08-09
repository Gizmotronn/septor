import React, { useState } from 'react';
import ScamChecker from './QuickScamCheck'; // Assuming the ScamChecker component is in a separate file
import ChatWithGpt from './ChatWithGpt'; // Assuming the ChatWithGpt component is in a separate file

const ParentComponent: React.FC = () => {
  const [scamMessage, setScamMessage] = useState<string | null>(null);

  // Callback function to receive the message from ScamChecker and pass it to ChatWithGpt
  const handleMessageFromScamChecker = (message: string) => {
    setScamMessage(message);
  };

  return (
    <div>
      <h1>Scam Checker and Chat</h1>
      <ScamChecker onMessageChange={handleMessageFromScamChecker} />
      <ChatWithGpt message={scamMessage} />
    </div>
  );
};

export default ParentComponent;