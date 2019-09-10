var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 5) == '/roll') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        if (args.length > 0) {
            var sides = parseInt(args[0]);
            console.log(sides)
            if (isNaN(sides)) {
                bot.sendMessage({
                    to: channelID,
                    message: 'Please enter a number indicating the number of sides!'
                });
            }
        } else {
            var sides = 6;
        }
        var roll = Math.floor(Math.random() * Math.floor(sides));
        console.log(roll)
        bot.sendMessage({
            to: channelID,
            message: 'You rolled a: ' + roll
        });
    }
});
