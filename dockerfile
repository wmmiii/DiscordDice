FROM node:10

WORKDIR /home/zerocool/DiscordDice

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "dice.js"]
