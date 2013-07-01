/*!
 * cache-dns - lib/cache-dns.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var dns = require('dns');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function CacheDNS(options) {
  if (!(this instanceof CacheDNS)) {
    return new CacheDNS(options);
  }
  EventEmitter.call(this);

  options = options || {};
  this.cacheTime = options.cacheTime || 10000;
  this.domains = {};
  this.timer = setInterval(this._updateCaches.bind(this), this.cacheTime);
}

util.inherits(CacheDNS, EventEmitter);

CacheDNS.prototype.resolve4 = function (domain, callback) {
  var addresses = this.domains[domain];
  if (!addresses) {
    return this._resolve4(domain, callback);
  }
  callback(null, addresses);
};

CacheDNS.prototype._resolve4 = function (domain, callback) {
  var self = this;
  dns.resolve4(domain, function (err, addresses) {
    self.emit(domain, err, addresses);
    if (err) {
      return callback(err);
    }
    addresses = addresses || [];
    if (addresses.length > 0) {
      self.domains[domain] = addresses;
    }
    callback(null, addresses);
  });
};

function noop() {}

CacheDNS.prototype._updateCaches = function () {
  for (var domain in this.domains) {
    this._resolve4(domain, noop);
  }
};

CacheDNS.prototype.close = function () {
  clearInterval(this.timer);
};

CacheDNS.create = function (options) {
  return new CacheDNS(options);
};

module.exports = CacheDNS;
