/*
 * <%= appNameSlug %>
 * https://github.com/<%= userName %>/<%= appNameSlug %>
 *
 * Copyright (c) <%= currentYear %>, <%= authorName %>
 * Licensed under the <%= license %> license.
 */

'use strict';

/*
 * Module Dependencies
 */

var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    debug = require('./debugger.js'),
    join = path.resolve,
    readdir = fs.readdirSync,
    exists = fs.existsSync,
    configStorage = {},
    serviceStorage = {};

/*
 * Public Methods
 */

/**
 * @class HeMan
 *
 * @constructor
 *
 * Constructor responsible for provide a application server and helpers
 *
 * @example
 *
 *     var heMan = new HeMan();
 *
 */

var HeMan = module.exports = function() {
    //Get version
    this.version = require('../package.json').version;
    //Load files
    this.load = function(root, cb) {
        var fullPath = join(__dirname, '..', 'api', root);
        var ENV = process.env.NODE_ENV || 'development';
        //
        if (root === 'config') {
            var configPath = join(fullPath, ENV);
            //Read this directory
            if (exists(configPath)) {
                readdir(configPath).forEach(function(file) {
                    if (fs.statSync(join(configPath, file)).isFile()) {
                        //Resolve file path
                        var filePath = join(configPath, file);
                        //Check if this file exists
                        if (exists(filePath)) {
                            //Run callback
                            var fileName = file.replace(/\.js$/, '');
                            fileName = fileName.replace(/\.json$/, '');
                            cb(filePath, fileName);
                        }
                    }
                });
            } else {
                console.log('ERROR: The '.red + ENV.white + ' environment not exists in api/config'.red);
                process.exit(0);
            }
        } else {
            //Read this directory
            readdir(fullPath).forEach(function(file) {
                if (fs.statSync(join(fullPath, file)).isFile()) {
                    //Resolve file path
                    var filePath = join(fullPath, file);
                    //Check if this file exists
                    if (exists(filePath)) {
                        //Run callback
                        var fileName = file.replace(/\.js$/, '');
                        fileName = fileName.replace(/\.json$/, '');
                        cb(filePath, fileName);
                    }
                }
            });
        }
    };
};

/**
 * Method responsible for get configs
 *
 * @example
 *
 *     heMan.getConfig('fileName');
 *
 * @method getConfig
 * @public
 * @param {Object} fileName Name of config file
 */

HeMan.prototype.getConfig = function getConfig(fileName) {
    //Load Settings

    this.load('config', function(filePath, fileName) {
        //Require configs
        var config = require(filePath);
        //Set Property
        configStorage[fileName] = config;
    });

    if (fileName) {
        return configStorage[fileName] || null;
    } else {
        return configStorage;
    }
};

/**
 * Method responsible for get services
 *
 * @example
 *
 *     heMan.getService('fileName');
 *
 * @method getService
 * @public
 * @param {Object} fileName Name of service file
 */

HeMan.prototype.getService = function getService(fileName) {
    //Load Services

    this.load('services', function(filePath, fileName) {
        //Check if exists
        if (exists(filePath)) {
            //Require webservice
            var service = require(filePath);
            serviceStorage[fileName] = service;
        }
    });

    return serviceStorage[fileName].call(this) || null;
};

/**
 * Method responsible for get base
 *
 * @example
 *
 *     heMan.getBase();
 *
 * @method getBase
 * @public
 */

HeMan.prototype.getBase = function getBase() {
    //Load Base Application

    return require('./baseApplication.js');
};

/**
 * Method responsible for loadding sockets
 *
 * @example
 *
 *     heMan.loadSockets(8081, function() {});
 *
 * @method loadSockets
 * @public
 * @param {Object} port Port of socket
 * @param {Function} cb Callback
 */

HeMan.prototype.loadSockets = function(port, cb) {
    var Server = require('http').createServer();
    var io = require('socket.io')(Server);

    //Instance
    var loader = this;

    //Start server
    io.serveClient(false);
    Server.listen(port, function() {
        debug('Server listening at port ' + port, 'success');
    });

    //Sockets
    io.on('connection', function(socket) {

        loader.load('sockets', function(filePath, fileName) {
            //heMan instance
            var heMan = new HeMan();
            //Require configs
            var sockets = require(filePath)(heMan, heMan.getConfig());
            //Load All Sockets
            _.each(sockets.prototype, function(s, key) {
                //Handle requests
                if (s.hasOwnProperty('on') && _.isFunction(s.on)) {
                    socket.on(path.join(fileName, key), s.on);
                }
                if (s.hasOwnProperty('emit')) {
                    socket.emit(path.join(fileName, key), s.emit);
                }
            });
        });

        socket.on('disconnect', function() {
            debug('Connection closed!', 'error');
        });

    });

    //Run callback
    cb();
};