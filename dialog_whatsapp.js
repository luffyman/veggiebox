const express = require('express');
const bodyParser = require('body-parser');
const { SessionsClient } = require('dialogflow');
const { struct } = require('pb-util');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Replace with your project ID and service account key file path
const projectId = 'your-project-id';
const keyFilePath = '/path/to/key.json';

// Create a new JWT client using the service account key
const client = new JWT({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const app = express();
app.use(bodyParser.json());

// Handle incoming messages from WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    const { message, sender, timestamp } = req.body;

    // Create a new session ID using the WhatsApp phone number
    const sessionId = sender.split('@')[0];

    // Create a new Dialogflow session client using the service account key
    const sessionClient = new SessionsClient({
      projectId,
      credentials: await client.authorize(),
    });

    // Send the message to Dialogflow for processing
    const session = sessionClient.sessionPath(projectId, sessionId);
    const dialogflowResponse = await sessionClient.detectIntent({
      session,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en-US',
        },
      },
    });

    // Extract the response from Dialogflow and send it back to WhatsApp
    const { fulfillmentText } = dialogflowResponse[0].queryResult;
    const response = {
      message: fulfillmentText,
      recipient: sender,
      timestamp: timestamp,
    };

    res.send(response);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Start the webhook server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
