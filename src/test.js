
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
const helpers = require('../test/test-helper')

const workflowSid = 'WW9935ac85154e7e777063ead35619e5c5';
const workerSid = 'WK22651a726a0e5156f9951bf2c3533461';
const loggedInActivitySid = 'WAef8e7aded8db546dbf953f8d3c67d5c9';


const context = {
    CLIENT_ROUTING_URL: "https://test-mptaskcontrol.azurewebsites.net/api/voice/Webhook/HandleIncomingCall",
    TWILIO_WORKSPACE_SID: "WS7703a73fe84ea3a81d836d73bbd9c52f",
    RUNTIME_DOMAIN: "jasper-bird-4728.twil.io",
    getTwilioClient() {return require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)}
}

// const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

describe('add-conference-participant', () => {
    beforeAll(() => {
      helpers.setup({});
    });
    afterAll(() => {
      helpers.teardown();
    });
  
    it('executes', done => {
      const tokenFunction = require('./functions/twilio/add-conference-participant').handler;
      var e = {
        taskSid: '',
        to: '',
        from: '',
        token: ''
      }
      const callback = (err, response) => {
        expect(response._headers).toEqual(
          { 'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS POST',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type' }
        );
        done();
      };
      tokenFunction(context, e, callback);
    });
  });

// describe('add-conference-participant', function () {
//     it('executes', async function () {
//         var e = {
//             taskSid: '',
//             to: '',
//             from: '',
//             token: ''
//         }

//         const functionUnderTest = require('./functions/twilio/add-conference-participant');
//         var callback = function (error, response) {
//             parser.parseString(response, function (err, result) {
//                 var expected = { "Response": { "Redirect": [{ "$": { "method": "POST" }, "_": context.CLIENT_ROUTING_URL }] } }
//                 expect(result).toEqual(expected);
//             });
//         }
//         functionUnderTest.handler(context, e, callback);
//         await sleep(2000);
//     });
// })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


