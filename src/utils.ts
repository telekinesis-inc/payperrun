class LRU {
  _max: Number;
  _cache: Map<string, any>;
  _source: any;

  constructor(source, max = 10) {
    this._max = max;
    this._cache = new Map();
    this._source = source;
  }

  async get(key) {
    let item = this._cache.get(key);
    if (!item) {
      item = await this._source(key);
    }
    // refresh key
    this._set(key, item);
    return item;
  }

  _set(key, val) {
    // refresh key
    if (this._cache.has(key)) this._cache.delete(key);
    // evict oldest
    else if (this._cache.size == this._max) this._cache.delete(this._first());
    this._cache.set(key, val);
  }

  _first() {
    return this._cache.keys().next().value;
  }
}

export {LRU};