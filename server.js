// server.js
const express = require('express');
const config = require('config');
const mysql = require('mysql');

const socketJs = require('./app/routes/socket');
var db_config = require('./config/development.json');

function intalizationConnection(db_config) {
  var conn = mysql.createConnection(db_config);
  console.log("host", db_config.host);
  console.log("user", db_config.user)
  console.log("password", db_config.password)
  console.log("database", db_config.database)
  conn.connect({ transports: ['websocket'] });
  return conn;
}

const app = express();
const port = config.get('port');
var http = require("http");
startServer = http.createServer(app).listen(port, function () {
  connection = intalizationConnection(db_config.databasesettings);
  console.log("Express server listening on port " + port);
  socketJs.socketInitialize(startServer);
});

app.get('/', (req, res) => {
  res.send('Chat Server PoolsMagnic is running on port 5000');
});