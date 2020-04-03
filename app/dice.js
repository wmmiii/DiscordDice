var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var parser = require('./parser');
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
    
    // if bot invoked
    if (message.substring(0, 5) == '/roll') {
        var args = message.substring(1).split(' ');
        args = args.splice(1);

        if (args.length <= 1) {

            var sides = 6;
            if (args.length == 1) {

                arg = args[0];

                if (arg === "help" || arg === "?" || arg === "") {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Welcome to Discord Dice!\nI\'m a bot, beep boop!\n\nYou can invoke me by typing "/roll"\
                        \nIf you type a number after /roll like "/roll 10" you can roll a custom sided dice!\
                        \nIf you really want to get fancy, try something like "/roll 8d6 + 2" and I\'ll see if I can figure it out.'
                    })
                    return;
                }

                sides = parseInt(args[0]);
                console.log(sides)
                if (isNaN(sides)) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Please enter a number indicating the number of sides!'
                    });
                    return;
                }
                if (sides < 2) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Please enter a number larger than 1!'
                    });
                    return;
                }
            }

            var roll = Math.floor(Math.random() * Math.floor(sides) + 1);
            bot.sendMessage({
                to: channelID,
                message: 'You rolled a: ' + roll
            });
            return;

        } else {
            try {
                let roll = parser.roll(args);
                if (roll === 420 && 1 > Math.random() * 20)  {
                    bot.sendMessage({
                        to: channelID,
                        message: 'You rolled a: ' + roll + ' blaze it.'
                    });
                    return;

                } else if (roll === 69 && 1 > Math.random() * 20)  {
                    bot.sendMessage({
                        to: channelID,
                        message: 'You rolled a: ' + roll + ' Nice.'
                    });
                    return;
                }
                bot.sendMessage({
                    to: channelID,
                    message: 'You rolled a: ' + roll
                });
                return;

            } catch(e) {
                bot.sendMessage({
                    to: channelID,
                    message: 'I couldn\'t understand: ' + e.message
                });
            }
        }
    }
});
