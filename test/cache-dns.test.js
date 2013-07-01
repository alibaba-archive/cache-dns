/*!
 * cache-dns - test/cache-dns.test.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var CacheDNS = require('../');
var should = require('should');
var pedding = require('pedding');
var mm = require('mm');

describe('cache-dns.test.js', function () {
  var dns = CacheDNS.create({
    cacheTime: 100, // 500ms
  });

  after(function () {
    dns.close();
  });

  afterEach(mm.restore);

  describe('CacheDNS()', function () {
    CacheDNS().should.be.an.instanceof(CacheDNS);
    new CacheDNS().should.be.an.instanceof(CacheDNS);
    CacheDNS.create().should.be.an.instanceof(CacheDNS);
  });

  describe('resolve4()', function () {
    it('should return ip v4 addresses', function (done) {
      done = pedding(2, done);
      dns.resolve4('www.taobao.com', function (err, addresses) {
        should.not.exists(err);
        should.exists(addresses);
        addresses.length.should.above(0);
        dns.resolve4('www.taobao.com', function (err, addresses2) {
          should.not.exists(err);
          should.exists(addresses);
          addresses2.should.equal(addresses);
          done();
        });
      });
      dns.resolve4('www.taobao.com', function (err, addresses) {
        should.not.exists(err);
        should.exists(addresses);
        addresses.length.should.above(0);
        done();
      });
    });
  });

  describe('_updateCaches()', function () {
    before(function (done) {
      dns.resolve4('www.taobao.com', done);
    });

    it('should emit domain event when update timer trigger', function (done) {
      dns.once('www.taobao.com', function (err, addresses) {
        should.not.exists(err);
        should.exists(addresses);
        addresses.length.should.above(0);
        // mock dns.resolve4 error
        mm.error(require('dns'), 'resolve4');
        dns.once('www.taobao.com', function (err) {
          err.name.should.equal('MockError');
          err.message.should.equal('mm mock error');
          should.exists(err);
          mm.restore();

          mm.data(require('dns'), 'resolve4', []);
          dns.once('www.taobao.com', function (err, addresses) {
            should.not.exists(err);
            addresses.should.eql([]);

            dns.resolve4('www.taobao.com', function (err, addresses) {
              should.not.exists(err);
              addresses.length.should.above(0);
              done();
            });
          });
        });
      });
    });
  });
});
