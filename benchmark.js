/*!
 * cache-dns - benchmark.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var dns = require('dns');
var CacheDNS = require('./');
var Benchmark = require('benchmark');
// https://github.com/bestiejs/benchmark.js/issues/39
Benchmark.support.timeout = false;
var suite = new Benchmark.Suite();

var cacheDNS = CacheDNS.create();
dns.resolve4('www.taobao.com', function () {
  console.log('dns', arguments);
});
cacheDNS.resolve4('www.taobao.com', function () {
  console.log('cacheDNS', arguments);

  suite
  .add("cacheDNS.resolve4('www.taobao.com')", function (deferred) {
    cacheDNS.resolve4('www.taobao.com', function (err, addresses) {
      deferred.resolve();
    });
  }, {defer: true})
  .add('setImmediate()', function (deferred) {
    setImmediate(function () {
      deferred.resolve();
    });
  }, {
    defer: true
  })
  .add("dns.resolve4('www.taobao.com')", function (deferred) {
    dns.resolve4('www.taobao.com', function (err, addresses) {
      deferred.resolve();
    });
  }, {defer: true})

  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    cacheDNS.close();
  })
  .run({ async: true });
});

