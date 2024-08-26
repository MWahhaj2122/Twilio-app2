require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Step 1: Generate Access Token Endpoint
app.post('/api/request-token', (req, res) => {
    try {
        const  identity  = req.body.identity;
        // console.log("Identity:: ", identity)
        if (!identity) {
            return res.status(400).json({ error: 'Identity is required' });
        }

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
            incomingAllow: true, // Allow incoming calls
        });

        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            {identity:identity}
        );
        // token.identity = identity;
        token.addGrant(voiceGrant);

        res.json({ token: token.toJwt() });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Step 2: Twilio Callback (Handled by TwiML App)
app.post('/api/twilio-callback', (req, res) => {
    try {
        const twiml = new twilio.twiml.VoiceResponse();
        
        // Ensure 'To' is provided
        if (!req.body.To) {
            return res.status(400).json({ error: 'To parameter is required' });
        }

        twiml.say('Connecting your call now...');
        twiml.dial(req.body.To);

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('Error handling callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

////CallBack Status!! 
app.post('/api/callback-status', (req, res) => {
    try {
        console.log("Request::: ", req);
        
    } catch (error) {
        console.error('Error handling callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Step 3: Handling Incoming Calls
app.post('/api/incoming-call', (req, res) => {
    try {
        const twiml = new twilio.twiml.VoiceResponse();
        
        // Ensure 'To' is provided
        if (!req.body.To) {
            return res.status(400).json({ error: 'To parameter is required' });
        }

        twiml.say('You have an incoming call.');
        twiml.dial(req.body.To);

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('Error handling incoming call:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
