/*
 * <%= appNameSlug %>
 * https://github.com/<%= userName %>/<%= appNameSlug %>
 *
 * Copyright (c) <%= currentYear %>, <%= authorName %>
 * Licensed under the <%= license %> license.
 */

'use strict';

var chai = require('chai');
chai.expect();
chai.should();

var HeMan = require('../lib/heMan.js'),
    heMan = new HeMan();

describe('he-man module', function() {
    describe('#constructor()', function() {
        it('should be a function', function() {
            HeMan.should.be.a('function');
        });
    });
    describe('#instance()', function() {
        it('should be a object', function() {
            heMan.should.be.a('object');
        });
    });
});
