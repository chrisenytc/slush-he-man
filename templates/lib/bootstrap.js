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

var HeMan = require('./heMan.js'),
    heMan = new HeMan(),
    debug = require('./debugger.js');

exports.run = function(port) {
    //Start
    heMan.loadSockets(process.env.PORT || port || 8081, function() {
        debug('Sockets loaded successfully!', 'success');
    });
};
