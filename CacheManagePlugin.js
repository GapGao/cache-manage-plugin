"use strict";
var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf");
var CacheManagePlugin = (function () {
    function CacheManagePlugin(options) {
        this.options = options || {};
        this.options.cacheRecordPath = this.options.cacheRecordPath || 'node_modules/.cache';
        this.options.maxAge = this.options.maxAge || (1 * 24 * 60 * 60 * 1000);
        this.options.cacheHash = this.options.cacheHash;
        this.options.dependanceCachePaths = this.options.dependanceCachePaths || [];
        this.recordPath = this.options.cacheRecordPath + 'cacheRecord.json';
        this.apply = this.apply.bind(this);
    }
    CacheManagePlugin.prototype.getCacheRecord = function () {
        var record = {};
        if (fs.existsSync(path.resolve(this.recordPath))) {
            record = JSON.parse(fs.readFileSync(path.resolve(this.recordPath), { encoding: 'utf8' }));
        }
        return record;
    };
    CacheManagePlugin.prototype.removeOutTimeCache = function (record) {
        var _this = this;
        var now = Date.now();
        var needRemoveHashList = [];
        Object.entries(record).forEach(function (_a) {
            var hash = _a[0], time = _a[1];
            if (now - time > _this.options.maxAge) {
                needRemoveHashList.push(hash);
            }
        });
        needRemoveHashList.forEach(function (hash) {
            _this.options.dependanceCachePaths.forEach(function (_path) {
                var fullPath = _path + "/" + hash;
                console.log('remove overdue cache', fullPath);
                delete record[hash];
                if (fs.existsSync(path.resolve(fullPath))) {
                    rimraf.sync(path.resolve(fullPath));
                }
            });
        });
        return record;
    };
    CacheManagePlugin.prototype.updateRecord = function (hash, record) {
        record[hash] = Date.now();
        if (!fs.existsSync(this.options.cacheRecordPath)) {
            fs.mkdirSync(this.options.cacheRecordPath);
        }
        fs.writeFileSync(path.resolve(this.recordPath), JSON.stringify(record), { encoding: 'utf8' });
    };
    CacheManagePlugin.prototype.apply = function (compiler) {
        var _this = this;
        compiler.plugin('entryOption', function () {
            var record = _this.getCacheRecord();
            record = _this.removeOutTimeCache(record);
            _this.updateRecord(_this.options.cacheHash, record);
        });
    };
    return CacheManagePlugin;
}());
module.exports = CacheManagePlugin;
