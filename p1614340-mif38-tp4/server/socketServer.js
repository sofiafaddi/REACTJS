/**
 * Created by amaia.nazabal on 6/10/17.
 */


var exports = module.exports = {};

var WebSocketServer = require('ws').Server;
exports.wss = new WebSocketServer({host: '0.0.0.0', port: 3002});
exports.OPEN = 1;
exports.ID_TASKS = 0;

var DISTANCE_PARAM = 500;
var RADIUS_EARTH = 6371;

exports.config = {
    tasks: [],
    users: [],

    run: function () {
        exports.wss.on('connection', function (ws) {
            ws.on('message', function (message) {
                console.log("reveived: " + message);
                exports.config.dispatch(ws, message);
            });

            ws.on('close', function () {
                exports.config.tasks.remove();
                exports.config.tasksList();
            });
        });
    },

    dispatch: function (ws, message) {
        try {
            var cmd = '';
            var param = '';

            if (message.indexOf('/') === 0) {
                cmd = message.split(' ')[0];
                param = message.replace(cmd, '');
            }

            var msg;
            switch (cmd) {
                case '/addTask':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.addTask(ws, msg);
                    }
                    break;
                case '/updateTask':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.updateTask(ws, msg);
                    }
                    break;
                case '/removeTask':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.removeTask(ws, msg);
                    }
                    break;
                case '/addUser':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.addUser(ws, msg);
                    }
                    break;

                case '/removeUser':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        exports.config.removeUser(ws, msg);
                    }
                    break;

                case '/getAllTask':
                    exports.config.tasksList();
                    break;

                case '/getAllUser':
                    exports.config.userList();
                    break;

                case '/checkIfClose':
                    msg = param.replace(' ', '');
                    if (msg !== '') {
                        console.log("param", param);
                        exports.config.checkCloseOfTask(msg);
                    }
                    break;

                default:
                    break;
            }

        } catch (e) {
            this.broadcastCommand("/error " + e.message);
        }
    },

    addTask: function (ws, item) {
        item = JSON.parse(item);
        item.id = exports.ID_TASKS + 1;
        exports.ID_TASKS++;
        exports.config.tasks.push(item);
        exports.config.tasksList();
    },

    addUser: function (ws, user) {
        user = JSON.parse(user);
        var userCount = this.users.filter(function (item) {
            return item.name === user.name;
        });

        if (typeof userCount === 'undefined' || userCount.length === 0) {
            exports.config.users.push(user);
        }

        exports.config.userList();
    },

    updateTask: function (ws, task) {
        task = JSON.parse(task);
        this.tasks.find(function (item) {
            return item.id === task.id;
        }).completed = true;

        exports.config.tasksList();
    },

    removeTask: function (ws, task) {
        task = JSON.parse(task);
        this.tasks = this.tasks.filter(function (item) {
            return item.id !== task.id;
        });
        exports.config.tasksList();
    },

    removeUser: function (ws, user) {
        user = JSON.parse(user);
        var userTasks = this.tasks.find(function (item) {
            return item.user === user.name;
        });

        if (typeof userTasks === "undefined" || userTasks.length === 0)
            this.users = this.users.filter(function (item) {
                return item.name !== user.name;
            });

        exports.config.userList();
    },

    tasksList: function () {
        exports.config.broadcastCommand('/tasksList ' + JSON.stringify(this.tasks));
    },

    userList: function () {
        exports.config.broadcastCommand('/usersList ' + JSON.stringify(this.users));
    },

    broadcastCommand: function (cmd) {
        exports.wss.clients.forEach(function (client) {
            if (client.readyState === exports.OPEN) {
                client.send(cmd);
            }
        });
    },
    //https://stackoverflow.com/questions/28542133/i-cannot-get-the-same-accuracy-as-google-maps-when-it-comes-to-distance/28543001#28543001
    //calcule la distance en metres
    checkCloseOfTask: function (coordinates) {
        var close = false;
        var taskID = -1;

        coordinates = JSON.parse(coordinates);

        this.tasks.forEach(function (task) {
            if (!task.completed) {
                var lat1 = task.lat;
                var long1 = task.long;
                var dLat = (coordinates.lat - lat1) * Math.PI / 180;
                var dLon = (coordinates.long - long1) * Math.PI / 180;

                var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) *
                    Math.cos(coordinates.lat * Math.PI / 180) *  (1 - Math.cos(dLon)) / 2;
                var d = Math.round(RADIUS_EARTH * 1000 * 2 * Math.asin(Math.sqrt(a)));

                if (d <= DISTANCE_PARAM) {
                    close = true;
                    taskID = task.id;
                }
            }
        });

        exports.config.broadcastCommand('/closeOfTask ' + JSON.stringify({close: close, id: taskID}));
    }
};
