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
  this.domains = {
    lookup: {},
    resolve4: {}
  };
  this.timer = setInterval(this._updateCaches.bind(this), this.cacheTime);
}

util.inherits(CacheDNS, EventEmitter);

CacheDNS.prototype.lookup = function (domain, callback) {
  this._resolve('lookup', domain, function (err, addresses) {
    if (addresses && addresses.length > 0) {
      addresses = addresses[0];
    }
    callback(err, addresses);
  });
};

CacheDNS.prototype.resolve4 = function (domain, callback) {
  this._resolve('resolve4', domain, callback);
};

var IP_RE = /^\d+\.\d+\.\d+\.\d+$/;

CacheDNS.prototype._resolve = function (method, domain, callback) {
  if (IP_RE.test(domain)) {
    return callback(null, [domain]);
  }
  
  var addresses = this.domains[method][domain];
  if (!addresses) {
    return this._resolveFromDNS(method, domain, callback);
  }
  callback(null, addresses);
};

CacheDNS.prototype._resolveFromDNS = function (method, domain, callback) {
  var self = this;
  dns[method](domain, function (err, addresses) {
    if (typeof addresses === 'string') {
      addresses = [addresses];
    }
    self.emit(domain, err, addresses, method);
    if (err) {
      return callback(err);
    }
    addresses = addresses || [];
    if (addresses.length > 0) {
      self.domains[method][domain] = addresses;
    }
    callback(null, addresses);
  });
};

function noop() {}

CacheDNS.prototype._updateCaches = function () {
  for (var method in this.domains) {
    var domains = this.domains[method];
    for (var domain in domains) {
      this._resolveFromDNS(method, domain, noop);
    }
  }
};

CacheDNS.prototype.close = function () {
  clearInterval(this.timer);
};

CacheDNS.create = function (options) {
  return new CacheDNS(options);
};

module.exports = CacheDNS;
