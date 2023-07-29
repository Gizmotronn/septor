from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

# Replace with your OpenAI API key
api_key = "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"

# Initialize the OpenAI API client
openai.api_key = api_key

@app.route('/ask', methods=['POST'])
def ask_chatgpt():
    try:
        data = request.get_json()
        message = data['message']

        # Call the OpenAI API to get a response
        response = openai.Completion.create(
            engine="text-davinci-002",  # You can choose a different engine
            prompt=message,
            max_tokens=50,  # Adjust as needed
            n=1,  # Number of responses to generate
            stop=None,  # Stop tokens to control response length
        )

        # Extract and return the generated response
        reply = response.choices[0].text.strip()
        
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/check_listen', methods=['GET'])
def check_listen():
    try:
        # Send a message to ChatGPT
        response = openai.Completion.create(
            engine="text-davinci-002",  # You can choose a different engine
            prompt="Are you listening?",
            max_tokens=50,  # Adjust as needed
            n=1,  # Number of responses to generate
            stop=None,  # Stop tokens to control response length
        )

        # Extract and return the generated response
        reply = response.choices[0].text.strip()

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)