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

//Number
async function isNumber(To) {
    if(To.length == 1) {
      if(!isNaN(To)) {
        console.log("It is a 1 digit long number" + To);
        return true;
      }
    } else if(String(To).charAt(0) == '+') {
      number = To.substring(1);
      if(!isNaN(number)) {
        console.log("It is a number " + To);
        return true;
      };
    } else {
      if(!isNaN(To)) {
        console.log("It is a number " + To)
      }
    }
}      
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
        // The recipient of the call, a phone number or a client
        let To = null;
        let From = null;
        console.log("request2: " + JSON.stringify(req.body));
        if (req.method == 'POST') {
            To = req.body.To;
            From = req.body.From;
        } else {
            To = req.query.To;
            From = req.query.From;
        }

        const voiceResponse = new twilio.twiml.VoiceResponse();

        if (!To) {
            voiceResponse.say("Congratulations! You have made your first call! Good bye.");
        } else if (isNumber(To)) {
            const dial = voiceResponse.dial({callerId : From, timeLimit: 30});
            dial.number(To);
        } else {
            const dial = voiceResponse.dial({callerId : From, timeLimit: 30});
            dial.client(To);
        }
        console.log('Response:' + voiceResponse.toString());
        return res.send(voiceResponse.toString());
 
    } catch (error) {
        console.error('Error retrieving data:', error);
        response.status(500).json({ error: 'Error retrieving data' });
    }});



////CallBack Status!! 
app.post('/api/callback-status', (req, res) => {
    try {
        console.log("call Status: " + JSON.stringify(req.body));
      
      return res.status(200).send({"status":"Ok"});

    } catch (error) {
        console.error('Error handling callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Step 3: Handling Incoming Calls
app.post('/api/incoming-call', (req, res) => {
    try {
        const {VoiceResponse} = require('twilio').twiml;

        const twiml = new twilio.twiml.VoiceResponse();
        console.log("Incoming Call:: ", req.body);
        // Ensure 'To' is provided
        
        const voiceResponse = new VoiceResponse();

        voiceResponse.say("You have incoming call.");
        const dial = voiceResponse.dial();
        dial.client('user');
 
        // twiml.say('You have an incoming call.');
        // twiml.dial(req.body.To);

        res.type('text/xml');
        res.send(voiceResponse.toString());
    } catch (error) {
        console.error('Error handling incoming call:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


;


