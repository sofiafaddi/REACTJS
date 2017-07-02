'use strict';

/**
 * Created by amaia.nazabal on 6/10/17.
 */

var wssUrl = "ws://0.0.0.0:3002";

var socket;
var EVENT = EVENT || {};

var cmd = {
    getTasks: '/getAllTask ',
    addTask: '/addTask ',
    updateTask: '/updateTask ',
    removeTask: '/removeTask ',
    getUsers: '/getAllUser ',
    addUser: '/addUser ',
    removeUser: '/removeUser ',
    disconnect: '/disconnect ',
    broadcast: '/broadcast ',
    checkIfClose: '/checkIfClose '
};

var SocketClient = {

    socket: null,
    tasks: [],

    init: function init() {

        socket = new WebSocket(wssUrl);

        socket.onopen = function () {
            socket.send(cmd.getTasks);
        };

        socket.onmessage = function (evt) {
            var cmd = void 0;
            var param = evt.data;
            if (evt.data.indexOf('/') === 0) {
                cmd = evt.data.split(' ')[0];
                param = evt.data.replace(cmd, '');
            }

            if (cmd === '/tasksList') {
                EVENT.reload.trigger('tasks', param);
                SocketClient.getAllUsers();
            } else if (cmd === '/usersList') {
                EVENT.reload.trigger('users', param);
            } else if (cmd === '/closeOfTask') {
                EVENT.reload.trigger('close-tasks', param);
            }
        };

        socket.onclose = function () {
            console.debug("Connection fermé.");
        };
    },

    sendAddTask: function sendAddTask(msg) {
        socket.send(cmd.addTask + JSON.stringify(msg));
    },

    sendAddUser: function sendAddUser(msg) {
        socket.send(cmd.addUser + JSON.stringify(msg));
    },

    sendUpdateTask: function sendUpdateTask(msg) {
        socket.send(cmd.updateTask + JSON.stringify(msg));
    },

    sendRemoveTask: function sendRemoveTask(msg) {
        socket.send(cmd.removeTask + JSON.stringify(msg));
    },

    sendRemoveUser: function sendRemoveUser(msg) {
        socket.send(cmd.removeUser + JSON.stringify(msg));
    },

    getAllTasks: function getAllTasks() {
        try {
            socket.send(cmd.getTasks);
        } catch (e) {
            console.debug("Error websocket msg: getAllTasks: " + e.message);
        }
    },

    getAllUsers: function getAllUsers() {
        try {
            socket.send(cmd.getUsers);
        } catch (e) {
            console.debug("Error websocket msg: getAllUser: " + e.message);
        }
    },

    checkCloseTask: function (lat, long) {
        try {
            socket.send(cmd.checkIfClose + JSON.stringify({lat: lat, long: long}));
        } catch (e) {}
    },


    close: function close() {
        socket.close();
    },
};