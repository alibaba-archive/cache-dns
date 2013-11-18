/*!
 * cache-dns - hosts.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var CacheDNS = require('../');

var dns = CacheDNS.create({
  cacheTime: 100, // 500ms
});

dns.resolve4('10.206.44.183', function () {
  console.log(arguments);
});

dns.resolve4('local.wo.taobao.com', function (err, addresses) {
  console.log('resolve4: local.wo.taobao.com', err, addresses);

  dns.resolve4('www.taobao.com', function (err, addresses) {
    console.log('resolve4: www.taobao.com', err, addresses);

    dns.lookup('local.wo.taobao.com', function (err, address) {
      console.log('lookup: local.wo.taobao.com', err, address);

      dns.lookup('www.taobao.com', function (err, address) {
        console.log('lookup: www.taobao.com', err, address);

        dns.close();
      });
    });
  });
});
