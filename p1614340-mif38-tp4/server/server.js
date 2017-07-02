var express = require('express');
var path = require('path');
var app = module.exports = express();
var ServerSocket = require('./socketServer.js');



app.use('/dist', express.static(path.resolve('dist')));
app.use('/app', express.static(path.resolve('app')));
app.use('/images', express.static(path.resolve('images')));
app.use('/style', express.static(path.resolve('style')));
app.use('/', function(req, res) {
    res.sendFile(path.resolve('dist/index.html'));
});


ServerSocket.config.run();

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});