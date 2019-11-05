var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const db = require('./db');
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

bot.on('message', function (user, userId, channelId, message, evt) {
  if (message.substring(0, 5) == '/roll') {
    const param = message.substring(1).split(' ').splice(1)[0];
    if (param) {
      if (param === "help" || param === "?" || param === "") {
        sendHelp(channelId);
      } else  if (param === "average" || param === "me" || param === "myAverage") {
        getAverage(user, userId, channelId);
      } else {
        roll(user, userId, channelId, message, parseInt(param));
      }
    } else {
      roll(user, userId, channelId, message);
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
    bot.sendMessage({
      to: channelId,
      message: 'You rolled a: ' + roll
    });
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
        \nIf you type a number after /roll like "/roll 10" you can roll a custom sided dice!'
  });
}
