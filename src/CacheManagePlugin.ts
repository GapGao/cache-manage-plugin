import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

interface Options {
  /**
   * Current cache directory
   * @defaultValue ./
   */
  cacheRecordPath?: string;
  /**
   * cache hash
   * @defaultValue node_modules/.cache
   */
  cacheHash?: string;

  /**
   * cache max age 
   * @defaultValue 1 * 24 * 60 * 60 * 1000
   */
  maxAge?: number,

  /**
   * need to manage cache directory
   * @defaultValue []
   */
  dependencyCachePaths?: string[],
}

interface Record {
  [hash: string]: number, 
}

class CacheManagePlugin {
  options: Options;
  recordPath: string;
  constructor(options: Options) {
    this.options = options || {};
    this.options.cacheRecordPath = this.options.cacheRecordPath || 'node_modules/.cache';
    this.options.maxAge = this.options.maxAge || (1 * 24 * 60 * 60 * 1000) 
    this.options.cacheHash = this.options.cacheHash;
    this.options.dependencyCachePaths = this.options.dependencyCachePaths || [];
    this.recordPath = this.options.cacheRecordPath + 'cacheRecord.json';
    this.apply = this.apply.bind(this);
  }

  getCacheRecord() {
    let record: Record = {};
    if (fs.existsSync(path.resolve(this.recordPath))) {
      record = JSON.parse(fs.readFileSync(path.resolve(this.recordPath), { encoding: 'utf8' })) as Record;
    }
    return record; 
  }

  removeOutTimeCache(record: Record) {
    const now = Date.now();
    const needRemoveHashList: string[] = [];
    Object.entries(record).forEach(([hash, time]) => {
      if (now - time > this.options.maxAge) {
        needRemoveHashList.push(hash);
      }
    })
    needRemoveHashList.forEach((hash) => {
      this.options.dependencyCachePaths.forEach((_path) => {
        const fullPath = `${_path}/${hash}`;

        console.log('remove overdue cache', fullPath)
          // 清除无效的record
        delete record[hash]; 
        if (fs.existsSync(path.resolve(fullPath))) {
          rimraf.sync(path.resolve(fullPath));
        }
      })
    })
    return record;
  }

  updateRecord(hash: string, record: Record) {
    record[hash] = Date.now();
    if (!fs.existsSync(this.options.cacheRecordPath)) {
      fs.mkdirSync(this.options.cacheRecordPath);
    }
    fs.writeFileSync(path.resolve(this.recordPath), JSON.stringify(record), { encoding: 'utf8' });
  }

  apply(compiler: any) {
    compiler.plugin('entryOption', () => {
      let record = this.getCacheRecord();
      record = this.removeOutTimeCache(record);
      this.updateRecord(this.options.cacheHash ,record);
    });
  }
}

export = CacheManagePlugin;
