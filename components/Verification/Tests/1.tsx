import { useState } from 'react';
import axios from 'axios';

const SafetyChec1 = () => {
  const [url, setUrl] = useState('');
  const [safetyData, setSafetyData] = useState(null);

  const checkSafety = async () => {
    try {
      // Replace 'YOUR_API_KEY' with your actual VirusTotal API key
      const apiKey = '70e735639aa1bb48201bacd6d94ead8c6d523de7b20cd79d37f9cfa0a2f717c0';

      // Step 1: Send a POST request to create a URL scan
      const createScanResponse = await axios.post(
        'https://www.virustotal.com/api/v3/urls',
        { url },
        {
          headers: {
            'x-apikey': apiKey,
            'url': url,
            'Content-Type': 'application/json',
          },
        }
      );

      const scanId = createScanResponse.data.data.id;

      // Step 2: Wait for a few seconds (adjust the timeout as needed)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 3: Send a GET request to retrieve the analysis results
      const getAnalysisResponse = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${scanId}`,
        {
          headers: {
            'x-apikey': apiKey,
            'id': scanId,
            'Content-Type': 'application/json',
          },
        }
      );

      const analysisData = getAnalysisResponse.data;

      // Store the analysis data in state
      setSafetyData(analysisData);
    } catch (error) {
      console.error('Error checking safety:', error);
      setSafetyData(null);
    }
  };

  return (
    <div>
      <h1>URL Safety Checker</h1>
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={checkSafety}>Check Safety</button>

      {safetyData && (
        <div>
          <h2>Safety Analysis:</h2>
          <p>URL: {safetyData.meta.url_info.url}</p>
          <p>ID: {safetyData.meta.url_info.id}</p>

          <h3>Analysis Results:</h3>
          <ul>
            {Object.keys(safetyData.data.attributes.results).map((engineName) => (
              <li key={engineName}>
                <strong>Engine Name:</strong> {engineName}
                <br />
                <strong>Category:</strong> {safetyData.data.attributes.results[engineName].category}
                <br />
                <strong>Result:</strong> {safetyData.data.attributes.results[engineName].result}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function SafetyCheck2() {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate an API request by waiting for 4 seconds
    setTimeout(() => {
      // Mock response data
      const safetyScore = 43;
      const provider = 'CMC Threat Intelligence';

      // Update the result state
      setResult(`Rated Harmful by ${provider}, safety score ${safetyScore}/100`);
      setIsLoading(false);
    }, 4000); // Delay for 4 seconds
  };

  return (
    <div>
      <h1>Safety Check</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter text:
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          Check Safety
        </button>
      </form>
      {isLoading && <p>Checking safety...</p>}
      {!isLoading && result && <p>{result}</p>}
    </div>
  );
}

export default SafetyCheck2;