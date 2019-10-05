CREATE TABLE rolls (
  id integer PRIMARY KEY,
  userName varchar(40) NOT NULL,
  userId varchar(100) NOT NULL,
  channelId varchar(100) NOT NULL,
  message varchar(255) NOT NULL,
  dieSides integer NOT NULL,
  roll integer NOT NULL,
  rollDate date
)
