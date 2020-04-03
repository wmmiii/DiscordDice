var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const db = require('./db');
var parser = require('./parser');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// The user id of the last 20 users that posted an invalid request.
const shitlist = [];

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

bot.on('message', function (user, userId, channelId, message, evt) {
  if (message.substring(0, 5) == '/roll') {
    const params = message.split(' ');
    params.shift(); // Remove command string.
    if (params.length == 1) {
        const param = params[0];
      if (param === "help" || param === "?" || param === "") {
        sendHelp(channelId);
      } else  if (param === "average" || param === "me" || param === "myAverage") {
        getAverage(user, userId, channelId);
      } else {
        if (/^\d+$/i.test(param)) {
            roll(user, userId, channelId, message, parseInt(param));
        } else {
            parseAndRoll(user, userId, channelId, message.substring(6));
        }
      }
    } else if (params.length == 0) {
        roll(user, userId, channelId, message);
    } else {
        parseAndRoll(user, userId, channelId, message.substring(6));
    }
  }
});


function roll(user, userId, channelId, message, sides=6) {
  if (isNaN(sides)) {
    bot.sendMessage({
      to: channelId,
      message: 'Please enter a number indicating the number of sides!'
    });
    return;
  } else if (sides < 2) {
    bot.sendMessage({
      to: channelId,
      message: 'Please enter a number larger than 1!'
    });
    return;
  } else {
    const roll = Math.floor(Math.random() * Math.floor(sides) + 1);
    logger.info(user + '(' + userId + ') rolled a ' + sides + ' sided die');
    logger.info('outcomeoutcome: ' + roll);
    reportRoll(roll, user, userId, channelId, message, sides, roll);
  }
}

/**
 * Given more than one argument parses the arguments and returns the solution.
 * 
 * @param {string} user The username of the user who requested the roll.
 * @param {string} userId The id of the user who requested the roll.
 * @param {string} channelId The id of the channel that the message was posted to.
 * @param {string} params The tokens of the roll request.
 */
function parseAndRoll(user, userId, channelId, message) {
    try {
        const roll  = parser.roll(message);
        reportRoll(roll, user, userId, channelId, message, roll);
    } catch (e) {
        shitlist.push(userId);
        while (shitlist.length > 20) {
            shitlist.shift();
        }

        if (userId == "221780469371371520") {
            bot.sendMessage({
                to: channelId,
                message: 'Fuck off Joey. ' + e.message,
            });
        } else if (shitlist.filter(user => user === userId).length > 5) {
            bot.sendMessage({
                to: channelId,
                message: 'Seriously ' + user + '? ' + e.message,
            });
        } else {
            bot.sendMessage({
                to: channelId,
                message: 'I couldn\'t figure out how to roll that: ' + e.message,
            });
        }
    }
}

/**
 * Reports the roll back to the user who requested it and records the result of the roll.
 * 
 * @param {number} roll The result of the roll.
 * @param {string} user The username of the user who requested the roll.
 * @param {string} userId The id of the user who requested the roll.
 * @param {string} channelId The id of the channel that the message was sent to.
 * @param {string} message The body of the roll request.
 * @param {number|undefined} sides The number of sides of the dice that was rolled
 *                                 or undefined if an advanced expression was used.
 */
function reportRoll(roll, user, userId, channelId, message, sides) {
    if (roll === 420 && 1 > Math.random() * 20)  {
        bot.sendMessage({
            to: channelId,
            message: 'You rolled a: ' + roll + ' blaze it.'
        });

    } else if (roll === 69 && 1 > Math.random() * 20)  {
        bot.sendMessage({
            to: channelId,
            message: 'You rolled a: ' + roll + ' Nice.'
        });
    } else {
        bot.sendMessage({
            to: channelId,
            message: 'You rolled a: ' + roll
        });
    }
    if (sides != null) {
        db.postRoll(user, userId, channelId, message, sides, roll, (err) => {
            if (err) {
            logger.error(err);
            }
        });
    }
}

function getAverage(user, userId, channelId) {
  db.getRolls(user, userId, (err, res) => {
    if (err) {
      logger.error(err);
    } else {
      getAverageFromRolls(user, channelId, res.rows);
    }
  });
}

function getAverageFromRolls(user, channelId, rows) {
  if (rows == null) {
    logger.info('no rows bud :(');
    return;
  } else {
    logger.info('parsing rows...');
  }
  let totalRolls = 0;
  let average = 0;
  rows.forEach(row => {
    totalRolls += 1;
    average += row.roll / row.diesides;
  });
  average = average * 100 / totalRolls;
  averageText = '';
  if (average > 90) {
    averageText = 'I kind of think you\'re cheating...';
  } else if (average > 70) {
    averageText = 'That\'s pretty damn good!';
  } else if (average > 35) {
    averageText = 'How Gaussian of you.';
  } else if (average > 15) {
    averageText = 'You\'re one unlucky duck.';
  } else {
    averageText = 'I\'m sorry... are.... are you ok?';
  }

  timeText = totalRolls === 1 ? 'time' : 'times';
  bot.sendMessage({
    to: channelId,
    message: 'Hey, ' + user + '!\nYou\'ve rolled the dice ' + totalRolls + ' ' + timeText + '!\n\n\
On average you roll ' + average.toFixed(2) + '% of the value of the dice!\n' + averageText
  });
}

function sendHelp(channelId) {
  bot.sendMessage({
    to: channelId,
    message: 'Welcome to Discord Dice!\nI\'m a bot, beep boop!\n\nYou can invoke me by typing "/roll"\
        \nIf you type a number after /roll like "/roll 10" you can roll a custom sided dice!\
        \nOr, if you want to get real fancy you can do something like "/roll 8d6 + 4", fancy!\
        \nIf you type "/roll average" you can see statistics on your rolls!'
  });
}
