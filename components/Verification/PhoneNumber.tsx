import React, { useState } from 'react';

const PhoneNumberVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerification = () => {
    // Simulate a delay before generating a response
    setTimeout(() => {
      let safetyRating = 0;
      let response = '';

      switch (phoneNumber) {
        case '+61 414 444 128':
        case '+61 481 601 669':
        case '0481601669':
        case '0414444128':
          safetyRating = getRandomInt(75, 93);
          response = "This number has not had any reports against it and is registered in Australia";
          break;
        case '0418414038':
          safetyRating = getRandomInt(22, 38);
          response = "This number has had significant reports against it";
          break;
        default:
          safetyRating = getRandomInt(0, 100);
          response = "Safety rating is unavailable for this number";
          break;
      }

      setVerificationResult(`Safety Rating: ${safetyRating}, ${response}`);
    }, 3000); // Simulate a 3-second delay before response

    // Clear the phone number input
    setPhoneNumber('');
  };

  // Helper function to generate a random integer within a given range
  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return (
    <div>
      <h2>Phone Number Verification</h2>
      <input
        type="text"
        placeholder="Enter Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleVerification}>Verify</button>
      {verificationResult && <p>{verificationResult}</p>}
    </div>
  );
};

export default PhoneNumberVerification;