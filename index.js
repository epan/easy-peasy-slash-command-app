/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/


 This is a sample Slack Button application that provides a custom
 Slash command.

 This bot demonstrates many of the core features of Botkit:

 *
 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately

 # RUN THE BOT:

 Create a Slack app. Make sure to configure at least one Slash command!

 -> https://api.slack.com/applications/new

 Run your bot from the command line:

 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js

 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.


 # EXTEND THE BOT:

 Botkit is has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

if (
  !process.env.CLIENT_ID ||
  !process.env.CLIENT_SECRET ||
  !process.env.PORT ||
  !process.env.VERIFICATION_TOKEN
) {
  console.log(
    'Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment'
  );
  process.exit(1);
}

var config = {};
if (process.env.MONGOLAB_URI) {
  var BotkitStorage = require('botkit-storage-mongo');
  config = {
    storage: BotkitStorage({ mongoUri: process.env.MONGOLAB_URI })
  };
} else {
  config = {
    json_file_store: './db_slackbutton_slash_command/'
  };
}

var controller = Botkit.slackbot(config).configureSlackApp({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scopes: ['commands']
});

controller.setupWebserver(process.env.PORT, function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, function(
    err,
    req,
    res
  ) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

//
// BEGIN EDITING HERE!
//
const isNumber = str => !isNaN(str);

controller.on('slash_command', function(slashCommand, message) {
  switch (message.command) {
    case '/pew':
      // Make sure the token matches
      if (message.token !== process.env.VERIFICATION_TOKEN) return; // If not, just ignore it.

      // Case: No arguments or 'help'
      if (message.text === '' || message.text === 'help') {
        // slashCommand.replyPrivate(
        //   message,
        //   'I ping the #xdesix channel to play games with you. Try typing `/pew now` to invite people to play now or `/pew 30` to invite people to play in 30 minutes.'
        // );
        slashCommand.reply(message, {
          attachments:[
            {
              title: ‘Do you want to interact with my buttons?’,
              callback_id: ‘123’,
              attachment_type: ‘default’,
              actions: [
                 {
                    “name”:”yes”,
                    “text”: “Yes”,
                    “value”: “yes”,
                    “type”: “button”,
                 },
                 {
                     “name”:”no”,
                     “text”: “No”,
                     “value”: “no”,
                     “type”: “button”,
                 }
              ]
            }
          ]
        });
        return;
      }

      // Case: PEW now
      if (message.text.substr(0, 3).toLowerCase() === 'now') {
        slashCommand.replyPublic(message, '<!group>: PEW now');
        return;
      }

      // Case: PEW in 30 minutes
      if (isNumber(message.text)) {
        slashCommand.replyPublic(
          message,
          `<!group>: PEW in ${message.text} minutes`
        );
        return;
      }

      // Case: Repeat whatever user said if not a recognized format
      slashCommand.replyPublic(message, `<!group>: ${message.text}`);

      break;

    default:
      slashCommand.replyPublic(
        message,
        "I'm afraid I don't know how to " + message.command + ' yet.'
      );
  }
});
