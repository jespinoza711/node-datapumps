(function() {
  var BatchProcessMixin, Promise;

  Promise = require('bluebird');

  module.exports = BatchProcessMixin = function(target) {
    var pumpMethod;
    target._batchSize = 100;
    target._batch = [];
    target.batchSize = function(size) {
      if (size == null) {
        return this._batchSize;
      }
      this._batchSize = size;
      return this;
    };
    target.processBatch = function(fn) {
      if (typeof fn !== 'function') {
        throw new Error('processBatch argument must be a function');
      }
      this._processBatch = fn;
      return this;
    };
    target._process = function(data) {
      var result;
      this._batch.push(data);
      if (this._batch.length >= this._batchSize) {
        result = this._processBatch(this._batch);
        this._batch = [];
        return result;
      }
    };
    pumpMethod = target._pump;
    return target._pump = function() {
      if (this._from.isEnded()) {
        Promise.resolve(this._processBatch(this._batch)).then((function(_this) {
          return function() {
            return _this.sealOutputBuffers();
          };
        })(this));
        this._batch = [];
        return;
      }
      return pumpMethod.apply(target, []);
    };
  };

}).call(this);