const nodeFetch = require('node-fetch');
const { Base64 } = require('js-base64');
const Twilio = require('twilio');

exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('Event properties:');
  Object.keys(event).forEach(key => {
    console.log(`${key}: ${event[key]}`);
  });

  if (Object.keys(event).length === 0) {
    console.log('Empty event object, likely an OPTIONS request');
    return callback(null, response);
  }

  const {
    token,
    taskSid,
    to,
    from
  } = event;

  console.log('Validating request token');
  console.log('accsid',context.ACCOUNT_SID);
  const tokenValidationApi = `https://iam.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Tokens/validate`;
  const fetchResponse = await nodeFetch(tokenValidationApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Base64.encode(`${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`)}`
    },
    body: JSON.stringify({
      token
    })
  });
  const tokenResponse = await fetchResponse.json();
  
  if (!tokenResponse.valid) {
    response.setStatusCode(401);
    response.setBody({
      status: 401,
      message: 'Your authentication token failed validation',
      detail: tokenResponse.message
    });
    return callback(null, response);
  }

  console.log(`Adding ${to} to named conference ${taskSid}`);
  const client = context.getTwilioClient();
  const participantsResponse = await client
    .conferences(taskSid)
    .participants
    .create({
      to,
      from,
      earlyMedia: true,
      endConferenceOnExit: false,
      statusCallback: context.SIGNALR_HUB_URL + '/api/call',
      statusCallbackEvent: ['initiated','ringing','answered','completed'],
      conferenceStatusCallback: 'https://' + context.RUNTIME_DOMAIN + '/conferenceevents',
      conferenceStatusCallbackEvent: 'start end join leave mute hold'
    });
 
  response.setBody({
    ...participantsResponse,
    status: 200,
    _version: undefined
  });

  return callback(null, response);
};
