module.exports = [
"[project]/TMFG/node_modules/delayed-stream/lib/delayed_stream.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Stream;
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
module.exports = DelayedStream;
function DelayedStream() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
}
util.inherits(DelayedStream, Stream);
DelayedStream.create = function(source, options) {
    var delayedStream = new this();
    options = options || {};
    for(var option in options){
        delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
        delayedStream._handleEmit(arguments);
        return realEmit.apply(source, arguments);
    };
    source.on('error', function() {});
    if (delayedStream.pauseStream) {
        source.pause();
    }
    return delayedStream;
};
Object.defineProperty(DelayedStream.prototype, 'readable', {
    configurable: true,
    enumerable: true,
    get: function() {
        return this.source.readable;
    }
});
DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
};
DelayedStream.prototype.resume = function() {
    if (!this._released) {
        this.release();
    }
    this.source.resume();
};
DelayedStream.prototype.pause = function() {
    this.source.pause();
};
DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach((function(args) {
        this.emit.apply(this, args);
    }).bind(this));
    this._bufferedEvents = [];
};
DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
};
DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
        this.emit.apply(this, args);
        return;
    }
    if (args[0] === 'data') {
        this.dataSize += args[1].length;
        this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
};
DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
        return;
    }
    if (this.dataSize <= this.maxDataSize) {
        return;
    }
    this._maxDataSizeExceeded = true;
    var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
    this.emit('error', new Error(message));
};
}),
"[project]/TMFG/node_modules/combined-stream/lib/combined_stream.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Stream;
var DelayedStream = __turbopack_context__.r("[project]/TMFG/node_modules/delayed-stream/lib/delayed_stream.js [app-route] (ecmascript)");
module.exports = CombinedStream;
function CombinedStream() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
}
util.inherits(CombinedStream, Stream);
CombinedStream.create = function(options) {
    var combinedStream = new this();
    options = options || {};
    for(var option in options){
        combinedStream[option] = options[option];
    }
    return combinedStream;
};
CombinedStream.isStreamLike = function(stream) {
    return typeof stream !== 'function' && typeof stream !== 'string' && typeof stream !== 'boolean' && typeof stream !== 'number' && !Buffer.isBuffer(stream);
};
CombinedStream.prototype.append = function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
        if (!(stream instanceof DelayedStream)) {
            var newStream = DelayedStream.create(stream, {
                maxDataSize: Infinity,
                pauseStream: this.pauseStreams
            });
            stream.on('data', this._checkDataSize.bind(this));
            stream = newStream;
        }
        this._handleErrors(stream);
        if (this.pauseStreams) {
            stream.pause();
        }
    }
    this._streams.push(stream);
    return this;
};
CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
};
CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
        this._pendingNext = true;
        return; // defer call
    }
    this._insideLoop = true;
    try {
        do {
            this._pendingNext = false;
            this._realGetNext();
        }while (this._pendingNext)
    } finally{
        this._insideLoop = false;
    }
};
CombinedStream.prototype._realGetNext = function() {
    var stream = this._streams.shift();
    if (typeof stream == 'undefined') {
        this.end();
        return;
    }
    if (typeof stream !== 'function') {
        this._pipeNext(stream);
        return;
    }
    var getStream = stream;
    getStream((function(stream) {
        var isStreamLike = CombinedStream.isStreamLike(stream);
        if (isStreamLike) {
            stream.on('data', this._checkDataSize.bind(this));
            this._handleErrors(stream);
        }
        this._pipeNext(stream);
    }).bind(this));
};
CombinedStream.prototype._pipeNext = function(stream) {
    this._currentStream = stream;
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
        stream.on('end', this._getNext.bind(this));
        stream.pipe(this, {
            end: false
        });
        return;
    }
    var value = stream;
    this.write(value);
    this._getNext();
};
CombinedStream.prototype._handleErrors = function(stream) {
    var self = this;
    stream.on('error', function(err) {
        self._emitError(err);
    });
};
CombinedStream.prototype.write = function(data) {
    this.emit('data', data);
};
CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
        return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == 'function') this._currentStream.pause();
    this.emit('pause');
};
CombinedStream.prototype.resume = function() {
    if (!this._released) {
        this._released = true;
        this.writable = true;
        this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == 'function') this._currentStream.resume();
    this.emit('resume');
};
CombinedStream.prototype.end = function() {
    this._reset();
    this.emit('end');
};
CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit('close');
};
CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
};
CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
        return;
    }
    var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
    this._emitError(new Error(message));
};
CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self = this;
    this._streams.forEach(function(stream) {
        if (!stream.dataSize) {
            return;
        }
        self.dataSize += stream.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
        this.dataSize += this._currentStream.dataSize;
    }
};
CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit('error', err);
};
}),
"[project]/TMFG/node_modules/mime-types/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */ /**
 * Module dependencies.
 * @private
 */ var db = __turbopack_context__.r("[project]/TMFG/node_modules/mime-db/index.js [app-route] (ecmascript)");
var extname = __turbopack_context__.r("[externals]/path [external] (path, cjs)").extname;
/**
 * Module variables.
 * @private
 */ var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
var TEXT_TYPE_REGEXP = /^text\//i;
/**
 * Module exports.
 * @public
 */ exports.charset = charset;
exports.charsets = {
    lookup: charset
};
exports.contentType = contentType;
exports.extension = extension;
exports.extensions = Object.create(null);
exports.lookup = lookup;
exports.types = Object.create(null);
// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types);
/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */ function charset(type) {
    if (!type || typeof type !== 'string') {
        return false;
    }
    // TODO: use media-typer
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var mime = match && db[match[1].toLowerCase()];
    if (mime && mime.charset) {
        return mime.charset;
    }
    // default text/* to utf-8
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return 'UTF-8';
    }
    return false;
}
/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */ function contentType(str) {
    // TODO: should this even be in this module?
    if (!str || typeof str !== 'string') {
        return false;
    }
    var mime = str.indexOf('/') === -1 ? exports.lookup(str) : str;
    if (!mime) {
        return false;
    }
    // TODO: use content-type or other module
    if (mime.indexOf('charset') === -1) {
        var charset = exports.charset(mime);
        if (charset) mime += '; charset=' + charset.toLowerCase();
    }
    return mime;
}
/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */ function extension(type) {
    if (!type || typeof type !== 'string') {
        return false;
    }
    // TODO: use media-typer
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    // get extensions
    var exts = match && exports.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
        return false;
    }
    return exts[0];
}
/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */ function lookup(path) {
    if (!path || typeof path !== 'string') {
        return false;
    }
    // get the extension ("ext" or ".ext" or full path)
    var extension = extname('x.' + path).toLowerCase().substr(1);
    if (!extension) {
        return false;
    }
    return exports.types[extension] || false;
}
/**
 * Populate the extensions and types maps.
 * @private
 */ function populateMaps(extensions, types) {
    // source preference (least -> most)
    var preference = [
        'nginx',
        'apache',
        undefined,
        'iana'
    ];
    Object.keys(db).forEach(function forEachMimeType(type) {
        var mime = db[type];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
            return;
        }
        // mime -> extensions
        extensions[type] = exts;
        // extension -> mime
        for(var i = 0; i < exts.length; i++){
            var extension = exts[i];
            if (types[extension]) {
                var from = preference.indexOf(db[types[extension]].source);
                var to = preference.indexOf(mime.source);
                if (types[extension] !== 'application/octet-stream' && (from > to || from === to && types[extension].substr(0, 12) === 'application/')) {
                    continue;
                }
            }
            // set the extension -> mime
            types[extension] = type;
        }
    });
}
}),
"[project]/TMFG/node_modules/asynckit/lib/defer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = defer;
/**
 * Runs provided function on next iteration of the event loop
 *
 * @param {function} fn - function to run
 */ function defer(fn) {
    var nextTick = typeof setImmediate == 'function' ? setImmediate : typeof process == 'object' && typeof process.nextTick == 'function' ? process.nextTick : null;
    if (nextTick) {
        nextTick(fn);
    } else {
        setTimeout(fn, 0);
    }
}
}),
"[project]/TMFG/node_modules/asynckit/lib/async.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var defer = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/defer.js [app-route] (ecmascript)");
// API
module.exports = async;
/**
 * Runs provided callback asynchronously
 * even if callback itself is not
 *
 * @param   {function} callback - callback to invoke
 * @returns {function} - augmented callback
 */ function async(callback) {
    var isAsync = false;
    // check if async happened
    defer(function() {
        isAsync = true;
    });
    return function async_callback(err, result) {
        if (isAsync) {
            callback(err, result);
        } else {
            defer(function nextTick_callback() {
                callback(err, result);
            });
        }
    };
}
}),
"[project]/TMFG/node_modules/asynckit/lib/abort.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

// API
module.exports = abort;
/**
 * Aborts leftover active jobs
 *
 * @param {object} state - current state object
 */ function abort(state) {
    Object.keys(state.jobs).forEach(clean.bind(state));
    // reset leftover jobs
    state.jobs = {};
}
/**
 * Cleans up leftover job by invoking abort function for the provided job id
 *
 * @this  state
 * @param {string|number} key - job id to abort
 */ function clean(key) {
    if (typeof this.jobs[key] == 'function') {
        this.jobs[key]();
    }
}
}),
"[project]/TMFG/node_modules/asynckit/lib/iterate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var async = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/async.js [app-route] (ecmascript)"), abort = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/abort.js [app-route] (ecmascript)");
// API
module.exports = iterate;
/**
 * Iterates over each job object
 *
 * @param {array|object} list - array or object (named list) to iterate over
 * @param {function} iterator - iterator to run
 * @param {object} state - current job status
 * @param {function} callback - invoked when all elements processed
 */ function iterate(list, iterator, state, callback) {
    // store current index
    var key = state['keyedList'] ? state['keyedList'][state.index] : state.index;
    state.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
        // don't repeat yourself
        // skip secondary callbacks
        if (!(key in state.jobs)) {
            return;
        }
        // clean up jobs
        delete state.jobs[key];
        if (error) {
            // don't process rest of the results
            // stop still active jobs
            // and reset the list
            abort(state);
        } else {
            state.results[key] = output;
        }
        // return salvaged results
        callback(error, state.results);
    });
}
/**
 * Runs iterator over provided job element
 *
 * @param   {function} iterator - iterator to invoke
 * @param   {string|number} key - key/index of the element in the list of jobs
 * @param   {mixed} item - job description
 * @param   {function} callback - invoked after iterator is done with the job
 * @returns {function|mixed} - job abort function or something else
 */ function runJob(iterator, key, item, callback) {
    var aborter;
    // allow shortcut if iterator expects only two arguments
    if (iterator.length == 2) {
        aborter = iterator(item, async(callback));
    } else {
        aborter = iterator(item, key, async(callback));
    }
    return aborter;
}
}),
"[project]/TMFG/node_modules/asynckit/lib/state.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

// API
module.exports = state;
/**
 * Creates initial state object
 * for iteration over list
 *
 * @param   {array|object} list - list to iterate over
 * @param   {function|null} sortMethod - function to use for keys sort,
 *                                     or `null` to keep them as is
 * @returns {object} - initial state object
 */ function state(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
        index: 0,
        keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
        jobs: {},
        results: isNamedList ? {} : [],
        size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
        // sort array keys based on it's values
        // sort object's keys just on own merit
        initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
            return sortMethod(list[a], list[b]);
        });
    }
    return initState;
}
}),
"[project]/TMFG/node_modules/asynckit/lib/terminator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var abort = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/abort.js [app-route] (ecmascript)"), async = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/async.js [app-route] (ecmascript)");
// API
module.exports = terminator;
/**
 * Terminates jobs in the attached state context
 *
 * @this  AsyncKitState#
 * @param {function} callback - final callback to invoke after termination
 */ function terminator(callback) {
    if (!Object.keys(this.jobs).length) {
        return;
    }
    // fast forward iteration index
    this.index = this.size;
    // abort jobs
    abort(this);
    // send back results we have so far
    async(callback)(null, this.results);
}
}),
"[project]/TMFG/node_modules/asynckit/parallel.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var iterate = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/iterate.js [app-route] (ecmascript)"), initState = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/state.js [app-route] (ecmascript)"), terminator = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/terminator.js [app-route] (ecmascript)");
// Public API
module.exports = parallel;
/**
 * Runs iterator over provided array elements in parallel
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function parallel(list, iterator, callback) {
    var state = initState(list);
    while(state.index < (state['keyedList'] || list).length){
        iterate(list, iterator, state, function(error, result) {
            if (error) {
                callback(error, result);
                return;
            }
            // looks like it's the last one
            if (Object.keys(state.jobs).length === 0) {
                callback(null, state.results);
                return;
            }
        });
        state.index++;
    }
    return terminator.bind(state, callback);
}
}),
"[project]/TMFG/node_modules/asynckit/serialOrdered.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var iterate = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/iterate.js [app-route] (ecmascript)"), initState = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/state.js [app-route] (ecmascript)"), terminator = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/lib/terminator.js [app-route] (ecmascript)");
// Public API
module.exports = serialOrdered;
// sorting helpers
module.exports.ascending = ascending;
module.exports.descending = descending;
/**
 * Runs iterator over provided sorted array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} sortMethod - custom sort function
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function serialOrdered(list, iterator, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator, state, function iteratorHandler(error, result) {
        if (error) {
            callback(error, result);
            return;
        }
        state.index++;
        // are we there yet?
        if (state.index < (state['keyedList'] || list).length) {
            iterate(list, iterator, state, iteratorHandler);
            return;
        }
        // done here
        callback(null, state.results);
    });
    return terminator.bind(state, callback);
}
/*
 * -- Sort methods
 */ /**
 * sort helper to sort array elements in ascending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */ function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/**
 * sort helper to sort array elements in descending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */ function descending(a, b) {
    return -1 * ascending(a, b);
}
}),
"[project]/TMFG/node_modules/asynckit/serial.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var serialOrdered = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/serialOrdered.js [app-route] (ecmascript)");
// Public API
module.exports = serial;
/**
 * Runs iterator over provided array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function serial(list, iterator, callback) {
    return serialOrdered(list, iterator, null, callback);
}
}),
"[project]/TMFG/node_modules/asynckit/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    parallel: __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/parallel.js [app-route] (ecmascript)"),
    serial: __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/serial.js [app-route] (ecmascript)"),
    serialOrdered: __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/serialOrdered.js [app-route] (ecmascript)")
};
}),
"[project]/TMFG/node_modules/es-object-atoms/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ module.exports = Object;
}),
"[project]/TMFG/node_modules/es-errors/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ module.exports = Error;
}),
"[project]/TMFG/node_modules/es-errors/eval.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./eval')} */ module.exports = EvalError;
}),
"[project]/TMFG/node_modules/es-errors/range.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./range')} */ module.exports = RangeError;
}),
"[project]/TMFG/node_modules/es-errors/ref.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./ref')} */ module.exports = ReferenceError;
}),
"[project]/TMFG/node_modules/es-errors/syntax.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./syntax')} */ module.exports = SyntaxError;
}),
"[project]/TMFG/node_modules/es-errors/type.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./type')} */ module.exports = TypeError;
}),
"[project]/TMFG/node_modules/es-errors/uri.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./uri')} */ module.exports = URIError;
}),
"[project]/TMFG/node_modules/math-intrinsics/abs.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./abs')} */ module.exports = Math.abs;
}),
"[project]/TMFG/node_modules/math-intrinsics/floor.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./floor')} */ module.exports = Math.floor;
}),
"[project]/TMFG/node_modules/math-intrinsics/max.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./max')} */ module.exports = Math.max;
}),
"[project]/TMFG/node_modules/math-intrinsics/min.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./min')} */ module.exports = Math.min;
}),
"[project]/TMFG/node_modules/math-intrinsics/pow.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./pow')} */ module.exports = Math.pow;
}),
"[project]/TMFG/node_modules/math-intrinsics/round.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./round')} */ module.exports = Math.round;
}),
"[project]/TMFG/node_modules/math-intrinsics/isNaN.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./isNaN')} */ module.exports = Number.isNaN || function isNaN(a) {
    return a !== a;
};
}),
"[project]/TMFG/node_modules/math-intrinsics/sign.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var $isNaN = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/isNaN.js [app-route] (ecmascript)");
/** @type {import('./sign')} */ module.exports = function sign(number) {
    if ($isNaN(number) || number === 0) {
        return number;
    }
    return number < 0 ? -1 : +1;
};
}),
"[project]/TMFG/node_modules/gopd/gOPD.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./gOPD')} */ module.exports = Object.getOwnPropertyDescriptor;
}),
"[project]/TMFG/node_modules/gopd/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ var $gOPD = __turbopack_context__.r("[project]/TMFG/node_modules/gopd/gOPD.js [app-route] (ecmascript)");
if ($gOPD) {
    try {
        $gOPD([], 'length');
    } catch (e) {
        // IE 8 has a broken gOPD
        $gOPD = null;
    }
}
module.exports = $gOPD;
}),
"[project]/TMFG/node_modules/es-define-property/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ var $defineProperty = Object.defineProperty || false;
if ($defineProperty) {
    try {
        $defineProperty({}, 'a', {
            value: 1
        });
    } catch (e) {
        // IE 8 has a broken defineProperty
        $defineProperty = false;
    }
}
module.exports = $defineProperty;
}),
"[project]/TMFG/node_modules/has-symbols/shams.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./shams')} */ /* eslint complexity: [2, 18], max-statements: [2, 33] */ module.exports = function hasSymbols() {
    if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
        return false;
    }
    if (typeof Symbol.iterator === 'symbol') {
        return true;
    }
    /** @type {{ [k in symbol]?: unknown }} */ var obj = {};
    var sym = Symbol('test');
    var symObj = Object(sym);
    if (typeof sym === 'string') {
        return false;
    }
    if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
        return false;
    }
    if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
        return false;
    }
    // temp disabled per https://github.com/ljharb/object.assign/issues/17
    // if (sym instanceof Symbol) { return false; }
    // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    // if (!(symObj instanceof Symbol)) { return false; }
    // if (typeof Symbol.prototype.toString !== 'function') { return false; }
    // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }
    var symVal = 42;
    obj[sym] = symVal;
    for(var _ in obj){
        return false;
    } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
    if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
        return false;
    }
    if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
        return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === 'function') {
        // eslint-disable-next-line no-extra-parens
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
        }
    }
    return true;
};
}),
"[project]/TMFG/node_modules/has-symbols/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __turbopack_context__.r("[project]/TMFG/node_modules/has-symbols/shams.js [app-route] (ecmascript)");
/** @type {import('.')} */ module.exports = function hasNativeSymbols() {
    if (typeof origSymbol !== 'function') {
        return false;
    }
    if (typeof Symbol !== 'function') {
        return false;
    }
    if (typeof origSymbol('foo') !== 'symbol') {
        return false;
    }
    if (typeof Symbol('bar') !== 'symbol') {
        return false;
    }
    return hasSymbolSham();
};
}),
"[project]/TMFG/node_modules/get-proto/Reflect.getPrototypeOf.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./Reflect.getPrototypeOf')} */ module.exports = typeof Reflect !== 'undefined' && Reflect.getPrototypeOf || null;
}),
"[project]/TMFG/node_modules/get-proto/Object.getPrototypeOf.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var $Object = __turbopack_context__.r("[project]/TMFG/node_modules/es-object-atoms/index.js [app-route] (ecmascript)");
/** @type {import('./Object.getPrototypeOf')} */ module.exports = $Object.getPrototypeOf || null;
}),
"[project]/TMFG/node_modules/get-proto/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var reflectGetProto = __turbopack_context__.r("[project]/TMFG/node_modules/get-proto/Reflect.getPrototypeOf.js [app-route] (ecmascript)");
var originalGetProto = __turbopack_context__.r("[project]/TMFG/node_modules/get-proto/Object.getPrototypeOf.js [app-route] (ecmascript)");
var getDunderProto = __turbopack_context__.r("[project]/TMFG/node_modules/dunder-proto/get.js [app-route] (ecmascript)");
/** @type {import('.')} */ module.exports = reflectGetProto ? function getProto(O) {
    // @ts-expect-error TS can't narrow inside a closure, for some reason
    return reflectGetProto(O);
} : originalGetProto ? function getProto(O) {
    if (!O || typeof O !== 'object' && typeof O !== 'function') {
        throw new TypeError('getProto: not an object');
    }
    // @ts-expect-error TS can't narrow inside a closure, for some reason
    return originalGetProto(O);
} : getDunderProto ? function getProto(O) {
    // @ts-expect-error TS can't narrow inside a closure, for some reason
    return getDunderProto(O);
} : null;
}),
"[project]/TMFG/node_modules/function-bind/implementation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint no-invalid-this: 1 */ var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';
var concatty = function concatty(a, b) {
    var arr = [];
    for(var i = 0; i < a.length; i += 1){
        arr[i] = a[i];
    }
    for(var j = 0; j < b.length; j += 1){
        arr[j + a.length] = b[j];
    }
    return arr;
};
var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for(var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1){
        arr[j] = arrLike[i];
    }
    return arr;
};
var joiny = function(arr, joiner) {
    var str = '';
    for(var i = 0; i < arr.length; i += 1){
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};
module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
        if (this instanceof bound) {
            var result = target.apply(this, concatty(args, arguments));
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(that, concatty(args, arguments));
    };
    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for(var i = 0; i < boundLength; i++){
        boundArgs[i] = '$' + i;
    }
    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);
    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }
    return bound;
};
}),
"[project]/TMFG/node_modules/function-bind/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var implementation = __turbopack_context__.r("[project]/TMFG/node_modules/function-bind/implementation.js [app-route] (ecmascript)");
module.exports = Function.prototype.bind || implementation;
}),
"[project]/TMFG/node_modules/call-bind-apply-helpers/functionCall.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./functionCall')} */ module.exports = Function.prototype.call;
}),
"[project]/TMFG/node_modules/call-bind-apply-helpers/functionApply.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./functionApply')} */ module.exports = Function.prototype.apply;
}),
"[project]/TMFG/node_modules/call-bind-apply-helpers/reflectApply.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./reflectApply')} */ module.exports = typeof Reflect !== 'undefined' && Reflect && Reflect.apply;
}),
"[project]/TMFG/node_modules/call-bind-apply-helpers/actualApply.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var bind = __turbopack_context__.r("[project]/TMFG/node_modules/function-bind/index.js [app-route] (ecmascript)");
var $apply = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/functionApply.js [app-route] (ecmascript)");
var $call = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/functionCall.js [app-route] (ecmascript)");
var $reflectApply = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/reflectApply.js [app-route] (ecmascript)");
/** @type {import('./actualApply')} */ module.exports = $reflectApply || bind.call($call, $apply);
}),
"[project]/TMFG/node_modules/call-bind-apply-helpers/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var bind = __turbopack_context__.r("[project]/TMFG/node_modules/function-bind/index.js [app-route] (ecmascript)");
var $TypeError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/type.js [app-route] (ecmascript)");
var $call = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/functionCall.js [app-route] (ecmascript)");
var $actualApply = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/actualApply.js [app-route] (ecmascript)");
/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */ module.exports = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== 'function') {
        throw new $TypeError('a function is required');
    }
    return $actualApply(bind, $call, args);
};
}),
"[project]/TMFG/node_modules/dunder-proto/get.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var callBind = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/index.js [app-route] (ecmascript)");
var gOPD = __turbopack_context__.r("[project]/TMFG/node_modules/gopd/index.js [app-route] (ecmascript)");
var hasProtoAccessor;
try {
    // eslint-disable-next-line no-extra-parens, no-proto
    hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ [].__proto__ === Array.prototype;
} catch (e) {
    if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
        throw e;
    }
}
// eslint-disable-next-line no-extra-parens
var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, '__proto__');
var $Object = Object;
var $getPrototypeOf = $Object.getPrototypeOf;
/** @type {import('./get')} */ module.exports = desc && typeof desc.get === 'function' ? callBind([
    desc.get
]) : typeof $getPrototypeOf === 'function' ? /** @type {import('./get')} */ function getDunder(value) {
    // eslint-disable-next-line eqeqeq
    return $getPrototypeOf(value == null ? value : $Object(value));
} : false;
}),
"[project]/TMFG/node_modules/hasown/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = __turbopack_context__.r("[project]/TMFG/node_modules/function-bind/index.js [app-route] (ecmascript)");
/** @type {import('.')} */ module.exports = bind.call(call, $hasOwn);
}),
"[project]/TMFG/node_modules/get-intrinsic/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var undefined1;
var $Object = __turbopack_context__.r("[project]/TMFG/node_modules/es-object-atoms/index.js [app-route] (ecmascript)");
var $Error = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/index.js [app-route] (ecmascript)");
var $EvalError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/eval.js [app-route] (ecmascript)");
var $RangeError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/range.js [app-route] (ecmascript)");
var $ReferenceError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/ref.js [app-route] (ecmascript)");
var $SyntaxError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/syntax.js [app-route] (ecmascript)");
var $TypeError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/type.js [app-route] (ecmascript)");
var $URIError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/uri.js [app-route] (ecmascript)");
var abs = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/abs.js [app-route] (ecmascript)");
var floor = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/floor.js [app-route] (ecmascript)");
var max = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/max.js [app-route] (ecmascript)");
var min = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/min.js [app-route] (ecmascript)");
var pow = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/pow.js [app-route] (ecmascript)");
var round = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/round.js [app-route] (ecmascript)");
var sign = __turbopack_context__.r("[project]/TMFG/node_modules/math-intrinsics/sign.js [app-route] (ecmascript)");
var $Function = Function;
// eslint-disable-next-line consistent-return
var getEvalledConstructor = function(expressionSyntax) {
    try {
        return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
    } catch (e) {}
};
var $gOPD = __turbopack_context__.r("[project]/TMFG/node_modules/gopd/index.js [app-route] (ecmascript)");
var $defineProperty = __turbopack_context__.r("[project]/TMFG/node_modules/es-define-property/index.js [app-route] (ecmascript)");
var throwTypeError = function() {
    throw new $TypeError();
};
var ThrowTypeError = $gOPD ? function() {
    try {
        // eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
        arguments.callee; // IE 8 does not throw here
        return throwTypeError;
    } catch (calleeThrows) {
        try {
            // IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
            return $gOPD(arguments, 'callee').get;
        } catch (gOPDthrows) {
            return throwTypeError;
        }
    }
}() : throwTypeError;
var hasSymbols = __turbopack_context__.r("[project]/TMFG/node_modules/has-symbols/index.js [app-route] (ecmascript)")();
var getProto = __turbopack_context__.r("[project]/TMFG/node_modules/get-proto/index.js [app-route] (ecmascript)");
var $ObjectGPO = __turbopack_context__.r("[project]/TMFG/node_modules/get-proto/Object.getPrototypeOf.js [app-route] (ecmascript)");
var $ReflectGPO = __turbopack_context__.r("[project]/TMFG/node_modules/get-proto/Reflect.getPrototypeOf.js [app-route] (ecmascript)");
var $apply = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/functionApply.js [app-route] (ecmascript)");
var $call = __turbopack_context__.r("[project]/TMFG/node_modules/call-bind-apply-helpers/functionCall.js [app-route] (ecmascript)");
var needsEval = {};
var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);
var INTRINSICS = {
    __proto__: null,
    '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
    '%Array%': Array,
    '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
    '%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
    '%AsyncFromSyncIteratorPrototype%': undefined,
    '%AsyncFunction%': needsEval,
    '%AsyncGenerator%': needsEval,
    '%AsyncGeneratorFunction%': needsEval,
    '%AsyncIteratorPrototype%': needsEval,
    '%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
    '%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
    '%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
    '%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
    '%Boolean%': Boolean,
    '%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
    '%Date%': Date,
    '%decodeURI%': decodeURI,
    '%decodeURIComponent%': decodeURIComponent,
    '%encodeURI%': encodeURI,
    '%encodeURIComponent%': encodeURIComponent,
    '%Error%': $Error,
    '%eval%': eval,
    '%EvalError%': $EvalError,
    '%Float16Array%': typeof Float16Array === 'undefined' ? undefined : Float16Array,
    '%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
    '%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
    '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
    '%Function%': $Function,
    '%GeneratorFunction%': needsEval,
    '%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
    '%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
    '%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
    '%isFinite%': isFinite,
    '%isNaN%': isNaN,
    '%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
    '%JSON%': typeof JSON === 'object' ? JSON : undefined,
    '%Map%': typeof Map === 'undefined' ? undefined : Map,
    '%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
    '%Math%': Math,
    '%Number%': Number,
    '%Object%': $Object,
    '%Object.getOwnPropertyDescriptor%': $gOPD,
    '%parseFloat%': parseFloat,
    '%parseInt%': parseInt,
    '%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
    '%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
    '%RangeError%': $RangeError,
    '%ReferenceError%': $ReferenceError,
    '%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
    '%RegExp%': RegExp,
    '%Set%': typeof Set === 'undefined' ? undefined : Set,
    '%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
    '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
    '%String%': String,
    '%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
    '%Symbol%': hasSymbols ? Symbol : undefined,
    '%SyntaxError%': $SyntaxError,
    '%ThrowTypeError%': ThrowTypeError,
    '%TypedArray%': TypedArray,
    '%TypeError%': $TypeError,
    '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
    '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
    '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
    '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
    '%URIError%': $URIError,
    '%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
    '%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
    '%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet,
    '%Function.prototype.call%': $call,
    '%Function.prototype.apply%': $apply,
    '%Object.defineProperty%': $defineProperty,
    '%Object.getPrototypeOf%': $ObjectGPO,
    '%Math.abs%': abs,
    '%Math.floor%': floor,
    '%Math.max%': max,
    '%Math.min%': min,
    '%Math.pow%': pow,
    '%Math.round%': round,
    '%Math.sign%': sign,
    '%Reflect.getPrototypeOf%': $ReflectGPO
};
if (getProto) {
    try {
        null.error; // eslint-disable-line no-unused-expressions
    } catch (e) {
        // https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
        var errorProto = getProto(getProto(e));
        INTRINSICS['%Error.prototype%'] = errorProto;
    }
}
var doEval = function doEval(name) {
    var value;
    if (name === '%AsyncFunction%') {
        value = getEvalledConstructor('async function () {}');
    } else if (name === '%GeneratorFunction%') {
        value = getEvalledConstructor('function* () {}');
    } else if (name === '%AsyncGeneratorFunction%') {
        value = getEvalledConstructor('async function* () {}');
    } else if (name === '%AsyncGenerator%') {
        var fn = doEval('%AsyncGeneratorFunction%');
        if (fn) {
            value = fn.prototype;
        }
    } else if (name === '%AsyncIteratorPrototype%') {
        var gen = doEval('%AsyncGenerator%');
        if (gen && getProto) {
            value = getProto(gen.prototype);
        }
    }
    INTRINSICS[name] = value;
    return value;
};
var LEGACY_ALIASES = {
    __proto__: null,
    '%ArrayBufferPrototype%': [
        'ArrayBuffer',
        'prototype'
    ],
    '%ArrayPrototype%': [
        'Array',
        'prototype'
    ],
    '%ArrayProto_entries%': [
        'Array',
        'prototype',
        'entries'
    ],
    '%ArrayProto_forEach%': [
        'Array',
        'prototype',
        'forEach'
    ],
    '%ArrayProto_keys%': [
        'Array',
        'prototype',
        'keys'
    ],
    '%ArrayProto_values%': [
        'Array',
        'prototype',
        'values'
    ],
    '%AsyncFunctionPrototype%': [
        'AsyncFunction',
        'prototype'
    ],
    '%AsyncGenerator%': [
        'AsyncGeneratorFunction',
        'prototype'
    ],
    '%AsyncGeneratorPrototype%': [
        'AsyncGeneratorFunction',
        'prototype',
        'prototype'
    ],
    '%BooleanPrototype%': [
        'Boolean',
        'prototype'
    ],
    '%DataViewPrototype%': [
        'DataView',
        'prototype'
    ],
    '%DatePrototype%': [
        'Date',
        'prototype'
    ],
    '%ErrorPrototype%': [
        'Error',
        'prototype'
    ],
    '%EvalErrorPrototype%': [
        'EvalError',
        'prototype'
    ],
    '%Float32ArrayPrototype%': [
        'Float32Array',
        'prototype'
    ],
    '%Float64ArrayPrototype%': [
        'Float64Array',
        'prototype'
    ],
    '%FunctionPrototype%': [
        'Function',
        'prototype'
    ],
    '%Generator%': [
        'GeneratorFunction',
        'prototype'
    ],
    '%GeneratorPrototype%': [
        'GeneratorFunction',
        'prototype',
        'prototype'
    ],
    '%Int8ArrayPrototype%': [
        'Int8Array',
        'prototype'
    ],
    '%Int16ArrayPrototype%': [
        'Int16Array',
        'prototype'
    ],
    '%Int32ArrayPrototype%': [
        'Int32Array',
        'prototype'
    ],
    '%JSONParse%': [
        'JSON',
        'parse'
    ],
    '%JSONStringify%': [
        'JSON',
        'stringify'
    ],
    '%MapPrototype%': [
        'Map',
        'prototype'
    ],
    '%NumberPrototype%': [
        'Number',
        'prototype'
    ],
    '%ObjectPrototype%': [
        'Object',
        'prototype'
    ],
    '%ObjProto_toString%': [
        'Object',
        'prototype',
        'toString'
    ],
    '%ObjProto_valueOf%': [
        'Object',
        'prototype',
        'valueOf'
    ],
    '%PromisePrototype%': [
        'Promise',
        'prototype'
    ],
    '%PromiseProto_then%': [
        'Promise',
        'prototype',
        'then'
    ],
    '%Promise_all%': [
        'Promise',
        'all'
    ],
    '%Promise_reject%': [
        'Promise',
        'reject'
    ],
    '%Promise_resolve%': [
        'Promise',
        'resolve'
    ],
    '%RangeErrorPrototype%': [
        'RangeError',
        'prototype'
    ],
    '%ReferenceErrorPrototype%': [
        'ReferenceError',
        'prototype'
    ],
    '%RegExpPrototype%': [
        'RegExp',
        'prototype'
    ],
    '%SetPrototype%': [
        'Set',
        'prototype'
    ],
    '%SharedArrayBufferPrototype%': [
        'SharedArrayBuffer',
        'prototype'
    ],
    '%StringPrototype%': [
        'String',
        'prototype'
    ],
    '%SymbolPrototype%': [
        'Symbol',
        'prototype'
    ],
    '%SyntaxErrorPrototype%': [
        'SyntaxError',
        'prototype'
    ],
    '%TypedArrayPrototype%': [
        'TypedArray',
        'prototype'
    ],
    '%TypeErrorPrototype%': [
        'TypeError',
        'prototype'
    ],
    '%Uint8ArrayPrototype%': [
        'Uint8Array',
        'prototype'
    ],
    '%Uint8ClampedArrayPrototype%': [
        'Uint8ClampedArray',
        'prototype'
    ],
    '%Uint16ArrayPrototype%': [
        'Uint16Array',
        'prototype'
    ],
    '%Uint32ArrayPrototype%': [
        'Uint32Array',
        'prototype'
    ],
    '%URIErrorPrototype%': [
        'URIError',
        'prototype'
    ],
    '%WeakMapPrototype%': [
        'WeakMap',
        'prototype'
    ],
    '%WeakSetPrototype%': [
        'WeakSet',
        'prototype'
    ]
};
var bind = __turbopack_context__.r("[project]/TMFG/node_modules/function-bind/index.js [app-route] (ecmascript)");
var hasOwn = __turbopack_context__.r("[project]/TMFG/node_modules/hasown/index.js [app-route] (ecmascript)");
var $concat = bind.call($call, Array.prototype.concat);
var $spliceApply = bind.call($apply, Array.prototype.splice);
var $replace = bind.call($call, String.prototype.replace);
var $strSlice = bind.call($call, String.prototype.slice);
var $exec = bind.call($call, RegExp.prototype.exec);
/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */ var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */ 
var stringToPath = function stringToPath(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === '%' && last !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
    } else if (last === '%' && first !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
    }
    var result = [];
    $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
    });
    return result;
};
/* end adaptation */ var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = '%' + alias[0] + '%';
    }
    if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
            value = doEval(intrinsicName);
        }
        if (typeof value === 'undefined' && !allowMissing) {
            throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
        }
        return {
            alias: alias,
            name: intrinsicName,
            value: value
        };
    }
    throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};
module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== 'string' || name.length === 0) {
        throw new $TypeError('intrinsic name must be a non-empty string');
    }
    if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
        throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = parts.length > 0 ? parts[0] : '';
    var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
    var intrinsicRealName = intrinsic.name;
    var value = intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic.alias;
    if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([
            0,
            1
        ], alias));
    }
    for(var i = 1, isOwn = true; i < parts.length; i += 1){
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
            throw new $SyntaxError('property names with quotes must have matching quotes');
        }
        if (part === 'constructor' || !isOwn) {
            skipFurtherCaching = true;
        }
        intrinsicBaseName += '.' + part;
        intrinsicRealName = '%' + intrinsicBaseName + '%';
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
            if (!(part in value)) {
                if (!allowMissing) {
                    throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
                }
                return void undefined;
            }
            if ($gOPD && i + 1 >= parts.length) {
                var desc = $gOPD(value, part);
                isOwn = !!desc;
                // By convention, when a data property is converted to an accessor
                // property to emulate a data property that does not suffer from
                // the override mistake, that accessor's getter is marked with
                // an `originalValue` property. Here, when we detect this, we
                // uphold the illusion by pretending to see that original data
                // property, i.e., returning the value rather than the getter
                // itself.
                if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
                    value = desc.get;
                } else {
                    value = value[part];
                }
            } else {
                isOwn = hasOwn(value, part);
                value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
                INTRINSICS[intrinsicRealName] = value;
            }
        }
    }
    return value;
};
}),
"[project]/TMFG/node_modules/has-tostringtag/shams.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var hasSymbols = __turbopack_context__.r("[project]/TMFG/node_modules/has-symbols/shams.js [app-route] (ecmascript)");
/** @type {import('.')} */ module.exports = function hasToStringTagShams() {
    return hasSymbols() && !!Symbol.toStringTag;
};
}),
"[project]/TMFG/node_modules/es-set-tostringtag/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var GetIntrinsic = __turbopack_context__.r("[project]/TMFG/node_modules/get-intrinsic/index.js [app-route] (ecmascript)");
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var hasToStringTag = __turbopack_context__.r("[project]/TMFG/node_modules/has-tostringtag/shams.js [app-route] (ecmascript)")();
var hasOwn = __turbopack_context__.r("[project]/TMFG/node_modules/hasown/index.js [app-route] (ecmascript)");
var $TypeError = __turbopack_context__.r("[project]/TMFG/node_modules/es-errors/type.js [app-route] (ecmascript)");
var toStringTag = hasToStringTag ? Symbol.toStringTag : null;
/** @type {import('.')} */ module.exports = function setToStringTag(object, value) {
    var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
    var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
    if (typeof overrideIfSet !== 'undefined' && typeof overrideIfSet !== 'boolean' || typeof nonConfigurable !== 'undefined' && typeof nonConfigurable !== 'boolean') {
        throw new $TypeError('if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans');
    }
    if (toStringTag && (overrideIfSet || !hasOwn(object, toStringTag))) {
        if ($defineProperty) {
            $defineProperty(object, toStringTag, {
                configurable: !nonConfigurable,
                enumerable: false,
                value: value,
                writable: false
            });
        } else {
            object[toStringTag] = value; // eslint-disable-line no-param-reassign
        }
    }
};
}),
"[project]/TMFG/node_modules/form-data/lib/populate.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// populates missing values
module.exports = function(dst, src) {
    Object.keys(src).forEach(function(prop) {
        dst[prop] = dst[prop] || src[prop]; // eslint-disable-line no-param-reassign
    });
    return dst;
};
}),
"[project]/TMFG/node_modules/form-data/lib/form_data.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var CombinedStream = __turbopack_context__.r("[project]/TMFG/node_modules/combined-stream/lib/combined_stream.js [app-route] (ecmascript)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
var http = __turbopack_context__.r("[externals]/http [external] (http, cjs)");
var https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
var parseUrl = __turbopack_context__.r("[externals]/url [external] (url, cjs)").parse;
var fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Stream;
var crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
var mime = __turbopack_context__.r("[project]/TMFG/node_modules/mime-types/index.js [app-route] (ecmascript)");
var asynckit = __turbopack_context__.r("[project]/TMFG/node_modules/asynckit/index.js [app-route] (ecmascript)");
var setToStringTag = __turbopack_context__.r("[project]/TMFG/node_modules/es-set-tostringtag/index.js [app-route] (ecmascript)");
var hasOwn = __turbopack_context__.r("[project]/TMFG/node_modules/hasown/index.js [app-route] (ecmascript)");
var populate = __turbopack_context__.r("[project]/TMFG/node_modules/form-data/lib/populate.js [app-route] (ecmascript)");
/**
 * Create readable "multipart/form-data" streams.
 * Can be used to submit forms
 * and file uploads to other web applications.
 *
 * @constructor
 * @param {object} options - Properties to be added/overriden for FormData and CombinedStream
 */ function FormData(options) {
    if (!(this instanceof FormData)) {
        return new FormData(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {}; // eslint-disable-line no-param-reassign
    for(var option in options){
        this[option] = options[option];
    }
}
// make it a Stream
util.inherits(FormData, CombinedStream);
FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';
FormData.prototype.append = function(field, value, options) {
    options = options || {}; // eslint-disable-line no-param-reassign
    // allow filename as single option
    if (typeof options === 'string') {
        options = {
            filename: options
        }; // eslint-disable-line no-param-reassign
    }
    var append = CombinedStream.prototype.append.bind(this);
    // all that streamy business can't handle numbers
    if (typeof value === 'number' || value == null) {
        value = String(value); // eslint-disable-line no-param-reassign
    }
    // https://github.com/felixge/node-form-data/issues/38
    if (Array.isArray(value)) {
        /*
     * Please convert your array into string
     * the way web server expects it
     */ this._error(new Error('Arrays are not supported.'));
        return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append(header);
    append(value);
    append(footer);
    // pass along options.knownLength
    this._trackLength(header, value, options);
};
FormData.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    /*
   * used w/ getLengthSync(), when length is known.
   * e.g. for streaming directly from a remote server,
   * w/ a known file a size, and not wanting to wait for
   * incoming file to finish to get its size.
   */ if (options.knownLength != null) {
        valueLength += Number(options.knownLength);
    } else if (Buffer.isBuffer(value)) {
        valueLength = value.length;
    } else if (typeof value === 'string') {
        valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    // @check why add CRLF? does this account for custom/multiple CRLFs?
    this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;
    // empty or either doesn't have path or not an http response or not a stream
    if (!value || !value.path && !(value.readable && hasOwn(value, 'httpVersion')) && !(value instanceof Stream)) {
        return;
    }
    // no need to bother with the length
    if (!options.knownLength) {
        this._valuesToMeasure.push(value);
    }
};
FormData.prototype._lengthRetriever = function(value, callback) {
    if (hasOwn(value, 'fd')) {
        // take read range into a account
        // `end` = Infinity –> read file till the end
        //
        // TODO: Looks like there is bug in Node fs.createReadStream
        // it doesn't respect `end` options without `start` options
        // Fix it when node fixes it.
        // https://github.com/joyent/node/issues/7819
        if (value.end != undefined && value.end != Infinity && value.start != undefined) {
            // when end specified
            // no need to calculate range
            // inclusive, starts with 0
            callback(null, value.end + 1 - (value.start ? value.start : 0)); // eslint-disable-line callback-return
        // not that fast snoopy
        } else {
            // still need to fetch file size from fs
            fs.stat(value.path, function(err, stat) {
                if (err) {
                    callback(err);
                    return;
                }
                // update final size based on the range options
                var fileSize = stat.size - (value.start ? value.start : 0);
                callback(null, fileSize);
            });
        }
    // or http response
    } else if (hasOwn(value, 'httpVersion')) {
        callback(null, Number(value.headers['content-length'])); // eslint-disable-line callback-return
    // or request stream http://github.com/mikeal/request
    } else if (hasOwn(value, 'httpModule')) {
        // wait till response come back
        value.on('response', function(response) {
            value.pause();
            callback(null, Number(response.headers['content-length']));
        });
        value.resume();
    // something else
    } else {
        callback('Unknown stream'); // eslint-disable-line callback-return
    }
};
FormData.prototype._multiPartHeader = function(field, value, options) {
    /*
   * custom header specified (as string)?
   * it becomes responsible for boundary
   * (e.g. to handle extra CRLFs on .NET servers)
   */ if (typeof options.header === 'string') {
        return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = '';
    var headers = {
        // add custom disposition as third element or keep it two elements if not
        'Content-Disposition': [
            'form-data',
            'name="' + field + '"'
        ].concat(contentDisposition || []),
        // if no content type. allow it to be empty array
        'Content-Type': [].concat(contentType || [])
    };
    // allow custom headers.
    if (typeof options.header === 'object') {
        populate(headers, options.header);
    }
    var header;
    for(var prop in headers){
        if (hasOwn(headers, prop)) {
            header = headers[prop];
            // skip nullish headers.
            if (header == null) {
                continue; // eslint-disable-line no-restricted-syntax, no-continue
            }
            // convert all headers to arrays.
            if (!Array.isArray(header)) {
                header = [
                    header
                ];
            }
            // add non-empty headers.
            if (header.length) {
                contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK;
            }
        }
    }
    return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
};
FormData.prototype._getContentDisposition = function(value, options) {
    var filename;
    if (typeof options.filepath === 'string') {
        // custom filepath for relative paths
        filename = path.normalize(options.filepath).replace(/\\/g, '/');
    } else if (options.filename || value && (value.name || value.path)) {
        /*
     * custom filename take precedence
     * formidable and the browser add a name property
     * fs- and request- streams have path property
     */ filename = path.basename(options.filename || value && (value.name || value.path));
    } else if (value && value.readable && hasOwn(value, 'httpVersion')) {
        // or try http response
        filename = path.basename(value.client._httpMessage.path || '');
    }
    if (filename) {
        return 'filename="' + filename + '"';
    }
};
FormData.prototype._getContentType = function(value, options) {
    // use custom content-type above all
    var contentType = options.contentType;
    // or try `name` from formidable, browser
    if (!contentType && value && value.name) {
        contentType = mime.lookup(value.name);
    }
    // or try `path` from fs-, request- streams
    if (!contentType && value && value.path) {
        contentType = mime.lookup(value.path);
    }
    // or if it's http-reponse
    if (!contentType && value && value.readable && hasOwn(value, 'httpVersion')) {
        contentType = value.headers['content-type'];
    }
    // or guess it from the filepath or filename
    if (!contentType && (options.filepath || options.filename)) {
        contentType = mime.lookup(options.filepath || options.filename);
    }
    // fallback to the default content type if `value` is not simple value
    if (!contentType && value && typeof value === 'object') {
        contentType = FormData.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
};
FormData.prototype._multiPartFooter = function() {
    return (function(next) {
        var footer = FormData.LINE_BREAK;
        var lastPart = this._streams.length === 0;
        if (lastPart) {
            footer += this._lastBoundary();
        }
        next(footer);
    }).bind(this);
};
FormData.prototype._lastBoundary = function() {
    return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
};
FormData.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
        'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
    };
    for(header in userHeaders){
        if (hasOwn(userHeaders, header)) {
            formHeaders[header.toLowerCase()] = userHeaders[header];
        }
    }
    return formHeaders;
};
FormData.prototype.setBoundary = function(boundary) {
    if (typeof boundary !== 'string') {
        throw new TypeError('FormData boundary must be a string');
    }
    this._boundary = boundary;
};
FormData.prototype.getBoundary = function() {
    if (!this._boundary) {
        this._generateBoundary();
    }
    return this._boundary;
};
FormData.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0); // eslint-disable-line new-cap
    var boundary = this.getBoundary();
    // Create the form content. Add Line breaks to the end of data.
    for(var i = 0, len = this._streams.length; i < len; i++){
        if (typeof this._streams[i] !== 'function') {
            // Add content to the buffer.
            if (Buffer.isBuffer(this._streams[i])) {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    this._streams[i]
                ]);
            } else {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    Buffer.from(this._streams[i])
                ]);
            }
            // Add break after content.
            if (typeof this._streams[i] !== 'string' || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    Buffer.from(FormData.LINE_BREAK)
                ]);
            }
        }
    }
    // Add the footer and return the Buffer object.
    return Buffer.concat([
        dataBuffer,
        Buffer.from(this._lastBoundary())
    ]);
};
FormData.prototype._generateBoundary = function() {
    // This generates a 50 character boundary similar to those used by Firefox.
    // They are optimized for boyer-moore parsing.
    this._boundary = '--------------------------' + crypto.randomBytes(12).toString('hex');
};
// Note: getLengthSync DOESN'T calculate streams length
// As workaround one can calculate file size manually and add it as knownLength option
FormData.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    // Don't get confused, there are 3 "internal" streams for each keyval pair so it basically checks if there is any value added to the form
    if (this._streams.length) {
        knownLength += this._lastBoundary().length;
    }
    // https://github.com/form-data/form-data/issues/40
    if (!this.hasKnownLength()) {
        /*
     * Some async length retrievers are present
     * therefore synchronous length calculation is false.
     * Please use getLength(callback) to get proper length
     */ this._error(new Error('Cannot calculate proper length in synchronous way.'));
    }
    return knownLength;
};
// Public API to check if length of added values is known
// https://github.com/form-data/form-data/issues/196
// https://github.com/form-data/form-data/issues/262
FormData.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
        hasKnownLength = false;
    }
    return hasKnownLength;
};
FormData.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
        knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
        process.nextTick(cb.bind(this, null, knownLength));
        return;
    }
    asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
        if (err) {
            cb(err);
            return;
        }
        values.forEach(function(length) {
            knownLength += length;
        });
        cb(null, knownLength);
    });
};
FormData.prototype.submit = function(params, cb) {
    var request;
    var options;
    var defaults = {
        method: 'post'
    };
    // parse provided url if it's string or treat it as options object
    if (typeof params === 'string') {
        params = parseUrl(params); // eslint-disable-line no-param-reassign
        /* eslint sort-keys: 0 */ options = populate({
            port: params.port,
            path: params.pathname,
            host: params.hostname,
            protocol: params.protocol
        }, defaults);
    } else {
        options = populate(params, defaults);
        // if no port provided use default one
        if (!options.port) {
            options.port = options.protocol === 'https:' ? 443 : 80;
        }
    }
    // put that good code in getHeaders to some use
    options.headers = this.getHeaders(params.headers);
    // https if specified, fallback to http in any other case
    if (options.protocol === 'https:') {
        request = https.request(options);
    } else {
        request = http.request(options);
    }
    // get content length and fire away
    this.getLength((function(err, length) {
        if (err && err !== 'Unknown stream') {
            this._error(err);
            return;
        }
        // add content length
        if (length) {
            request.setHeader('Content-Length', length);
        }
        this.pipe(request);
        if (cb) {
            var onResponse;
            var callback = function(error, responce) {
                request.removeListener('error', callback);
                request.removeListener('response', onResponse);
                return cb.call(this, error, responce); // eslint-disable-line no-invalid-this
            };
            onResponse = callback.bind(this, null);
            request.on('error', callback);
            request.on('response', onResponse);
        }
    }).bind(this));
    return request;
};
FormData.prototype._error = function(err) {
    if (!this.error) {
        this.error = err;
        this.pause();
        this.emit('error', err);
    }
};
FormData.prototype.toString = function() {
    return '[object FormData]';
};
setToStringTag(FormData, 'FormData');
// Public API
module.exports = FormData;
}),
"[project]/TMFG/node_modules/proxy-from-env/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var parseUrl = __turbopack_context__.r("[externals]/url [external] (url, cjs)").parse;
var DEFAULT_PORTS = {
    ftp: 21,
    gopher: 70,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
};
var stringEndsWith = String.prototype.endsWith || function(s) {
    return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
};
/**
 * @param {string|object} url - The URL, or the result from url.parse.
 * @return {string} The URL of the proxy that should handle the request to the
 *  given URL. If no proxy is set, this will be an empty string.
 */ function getProxyForUrl(url) {
    var parsedUrl = typeof url === 'string' ? parseUrl(url) : url || {};
    var proto = parsedUrl.protocol;
    var hostname = parsedUrl.host;
    var port = parsedUrl.port;
    if (typeof hostname !== 'string' || !hostname || typeof proto !== 'string') {
        return ''; // Don't proxy URLs without a valid scheme or host.
    }
    proto = proto.split(':', 1)[0];
    // Stripping ports in this way instead of using parsedUrl.hostname to make
    // sure that the brackets around IPv6 addresses are kept.
    hostname = hostname.replace(/:\d*$/, '');
    port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
    if (!shouldProxy(hostname, port)) {
        return ''; // Don't proxy URLs that match NO_PROXY.
    }
    var proxy = getEnv('npm_config_' + proto + '_proxy') || getEnv(proto + '_proxy') || getEnv('npm_config_proxy') || getEnv('all_proxy');
    if (proxy && proxy.indexOf('://') === -1) {
        // Missing scheme in proxy, default to the requested URL's scheme.
        proxy = proto + '://' + proxy;
    }
    return proxy;
}
/**
 * Determines whether a given URL should be proxied.
 *
 * @param {string} hostname - The host name of the URL.
 * @param {number} port - The effective port of the URL.
 * @returns {boolean} Whether the given URL should be proxied.
 * @private
 */ function shouldProxy(hostname, port) {
    var NO_PROXY = (getEnv('npm_config_no_proxy') || getEnv('no_proxy')).toLowerCase();
    if (!NO_PROXY) {
        return true; // Always proxy if NO_PROXY is not set.
    }
    if (NO_PROXY === '*') {
        return false; // Never proxy if wildcard is set.
    }
    return NO_PROXY.split(/[,\s]/).every(function(proxy) {
        if (!proxy) {
            return true; // Skip zero-length hosts.
        }
        var parsedProxy = proxy.match(/^(.+):(\d+)$/);
        var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
        var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
        if (parsedProxyPort && parsedProxyPort !== port) {
            return true; // Skip if ports don't match.
        }
        if (!/^[.*]/.test(parsedProxyHostname)) {
            // No wildcards, so stop proxying if there is an exact match.
            return hostname !== parsedProxyHostname;
        }
        if (parsedProxyHostname.charAt(0) === '*') {
            // Remove leading wildcard.
            parsedProxyHostname = parsedProxyHostname.slice(1);
        }
        // Stop proxying if the hostname ends with the no_proxy host.
        return !stringEndsWith.call(hostname, parsedProxyHostname);
    });
}
/**
 * Get the value for an environment variable.
 *
 * @param {string} key - The name of the environment variable.
 * @return {string} The value of the environment variable.
 * @private
 */ function getEnv(key) {
    return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || '';
}
exports.getProxyForUrl = getProxyForUrl;
}),
"[project]/TMFG/node_modules/ms/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Helpers.
 */ var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */ module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
        return parse(val);
    } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */ function parse(str) {
    str = String(str);
    if (str.length > 100) {
        return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch(type){
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            return undefined;
    }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
    }
    if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
    }
    if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
    }
    if (msAbs >= s) {
        return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return ms + ' ms';
}
/**
 * Pluralization helper.
 */ function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}
}),
"[project]/TMFG/node_modules/debug/src/common.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */ function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = __turbopack_context__.r("[project]/TMFG/node_modules/ms/index.js [app-route] (ecmascript)");
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key)=>{
        createDebug[key] = env[key];
    });
    /**
	* The currently active debug mode names, and names to skip.
	*/ createDebug.names = [];
    createDebug.skips = [];
    /**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/ createDebug.formatters = {};
    /**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/ function selectColor(namespace) {
        let hash = 0;
        for(let i = 0; i < namespace.length; i++){
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    /**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/ function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
            // Disabled?
            if (!debug.enabled) {
                return;
            }
            const self = debug;
            // Set `diff` timestamp
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== 'string') {
                // Anything else let's inspect with %O
                args.unshift('%O');
            }
            // Apply any `formatters` transformations
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format)=>{
                // If we encounter an escaped % then don't increase the array index
                if (match === '%%') {
                    return '%';
                }
                index++;
                const formatter = createDebug.formatters[format];
                if (typeof formatter === 'function') {
                    const val = args[index];
                    match = formatter.call(self, val);
                    // Now we need to remove `args[index]` since it's inlined in the `format`
                    args.splice(index, 1);
                    index--;
                }
                return match;
            });
            // Apply env-specific formatting (colors, etc.)
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
        Object.defineProperty(debug, 'enabled', {
            enumerable: true,
            configurable: false,
            get: ()=>{
                if (enableOverride !== null) {
                    return enableOverride;
                }
                if (namespacesCache !== createDebug.namespaces) {
                    namespacesCache = createDebug.namespaces;
                    enabledCache = createDebug.enabled(namespace);
                }
                return enabledCache;
            },
            set: (v)=>{
                enableOverride = v;
            }
        });
        // Env-specific initialization logic for debug instances
        if (typeof createDebug.init === 'function') {
            createDebug.init(debug);
        }
        return debug;
    }
    function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
    }
    /**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/ function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === 'string' ? namespaces : '').trim().replace(/\s+/g, ',').split(',').filter(Boolean);
        for (const ns of split){
            if (ns[0] === '-') {
                createDebug.skips.push(ns.slice(1));
            } else {
                createDebug.names.push(ns);
            }
        }
    }
    /**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */ function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while(searchIndex < search.length){
            if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
                // Match character or proceed with wildcard
                if (template[templateIndex] === '*') {
                    starIndex = templateIndex;
                    matchIndex = searchIndex;
                    templateIndex++; // Skip the '*'
                } else {
                    searchIndex++;
                    templateIndex++;
                }
            } else if (starIndex !== -1) {
                // Backtrack to the last '*' and try to match more characters
                templateIndex = starIndex + 1;
                matchIndex++;
                searchIndex = matchIndex;
            } else {
                return false; // No match
            }
        }
        // Handle trailing '*' in template
        while(templateIndex < template.length && template[templateIndex] === '*'){
            templateIndex++;
        }
        return templateIndex === template.length;
    }
    /**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/ function disable() {
        const namespaces = [
            ...createDebug.names,
            ...createDebug.skips.map((namespace)=>'-' + namespace)
        ].join(',');
        createDebug.enable('');
        return namespaces;
    }
    /**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/ function enabled(name) {
        for (const skip of createDebug.skips){
            if (matchesTemplate(name, skip)) {
                return false;
            }
        }
        for (const ns of createDebug.names){
            if (matchesTemplate(name, ns)) {
                return true;
            }
        }
        return false;
    }
    /**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/ function coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    /**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/ function destroy() {
        console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
    createDebug.enable(createDebug.load());
    return createDebug;
}
module.exports = setup;
}),
"[project]/TMFG/node_modules/debug/src/node.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Module dependencies.
 */ const tty = __turbopack_context__.r("[externals]/tty [external] (tty, cjs)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * This is the Node.js implementation of `debug()`.
 */ exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(()=>{}, 'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
/**
 * Colors.
 */ exports.colors = [
    6,
    2,
    3,
    4,
    5,
    1
];
try {
    // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
    // eslint-disable-next-line import/no-extraneous-dependencies
    const supportsColor = __turbopack_context__.r("[project]/TMFG/node_modules/supports-color/index.js [app-route] (ecmascript)");
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
            20,
            21,
            26,
            27,
            32,
            33,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            56,
            57,
            62,
            63,
            68,
            69,
            74,
            75,
            76,
            77,
            78,
            79,
            80,
            81,
            92,
            93,
            98,
            99,
            112,
            113,
            128,
            129,
            134,
            135,
            148,
            149,
            160,
            161,
            162,
            163,
            164,
            165,
            166,
            167,
            168,
            169,
            170,
            171,
            172,
            173,
            178,
            179,
            184,
            185,
            196,
            197,
            198,
            199,
            200,
            201,
            202,
            203,
            204,
            205,
            206,
            207,
            208,
            209,
            214,
            215,
            220,
            221
        ];
    }
} catch (error) {
// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}
/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */ exports.inspectOpts = Object.keys(process.env).filter((key)=>{
    return /^debug_/i.test(key);
}).reduce((obj, key)=>{
    // Camel-case
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k)=>{
        return k.toUpperCase();
    });
    // Coerce string value into JS value
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
    } else if (val === 'null') {
        val = null;
    } else {
        val = Number(val);
    }
    obj[prop] = val;
    return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */ function useColors() {
    return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    const { namespace: name, useColors } = this;
    if (useColors) {
        const c = this.color;
        const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
        const prefix = `  ${colorCode};1m${name} \u001B[0m`;
        args[0] = prefix + args[0].split('\n').join('\n' + prefix);
        args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
    } else {
        args[0] = getDate() + name + ' ' + args[0];
    }
}
function getDate() {
    if (exports.inspectOpts.hideDate) {
        return '';
    }
    return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */ function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    if (namespaces) {
        process.env.DEBUG = namespaces;
    } else {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete process.env.DEBUG;
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */ function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for(let i = 0; i < keys.length; i++){
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
}
module.exports = __turbopack_context__.r("[project]/TMFG/node_modules/debug/src/common.js [app-route] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */ formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split('\n').map((str)=>str.trim()).join(' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */ formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
};
}),
"[project]/TMFG/node_modules/debug/src/browser.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/* eslint-env browser */ /**
 * This is the web browser implementation of `debug()`.
 */ exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (()=>{
    let warned = false;
    return ()=>{
        if (!warned) {
            warned = true;
            console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
        }
    };
})();
/**
 * Colors.
 */ exports.colors = [
    '#0000CC',
    '#0000FF',
    '#0033CC',
    '#0033FF',
    '#0066CC',
    '#0066FF',
    '#0099CC',
    '#0099FF',
    '#00CC00',
    '#00CC33',
    '#00CC66',
    '#00CC99',
    '#00CCCC',
    '#00CCFF',
    '#3300CC',
    '#3300FF',
    '#3333CC',
    '#3333FF',
    '#3366CC',
    '#3366FF',
    '#3399CC',
    '#3399FF',
    '#33CC00',
    '#33CC33',
    '#33CC66',
    '#33CC99',
    '#33CCCC',
    '#33CCFF',
    '#6600CC',
    '#6600FF',
    '#6633CC',
    '#6633FF',
    '#66CC00',
    '#66CC33',
    '#9900CC',
    '#9900FF',
    '#9933CC',
    '#9933FF',
    '#99CC00',
    '#99CC33',
    '#CC0000',
    '#CC0033',
    '#CC0066',
    '#CC0099',
    '#CC00CC',
    '#CC00FF',
    '#CC3300',
    '#CC3333',
    '#CC3366',
    '#CC3399',
    '#CC33CC',
    '#CC33FF',
    '#CC6600',
    '#CC6633',
    '#CC9900',
    '#CC9933',
    '#CCCC00',
    '#CCCC33',
    '#FF0000',
    '#FF0033',
    '#FF0066',
    '#FF0099',
    '#FF00CC',
    '#FF00FF',
    '#FF3300',
    '#FF3333',
    '#FF3366',
    '#FF3399',
    '#FF33CC',
    '#FF33FF',
    '#FF6600',
    '#FF6633',
    '#FF9900',
    '#FF9933',
    '#FFCC00',
    '#FFCC33'
];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */ // eslint-disable-next-line complexity
function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
    }
    let m;
    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    // eslint-disable-next-line no-return-assign
    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || ("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);
    if (!this.useColors) {
        return;
    }
    const c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');
    // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match)=>{
        if (match === '%%') {
            return;
        }
        index++;
        if (match === '%c') {
            // We only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
        }
    });
    args.splice(lastC, 0, c);
}
/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */ exports.log = console.debug || console.log || (()=>{});
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    try {
        if (namespaces) {
            exports.storage.setItem('debug', namespaces);
        } else {
            exports.storage.removeItem('debug');
        }
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    let r;
    try {
        r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG');
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
    }
    return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */ function localstorage() {
    try {
        // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
        // The Browser also has localStorage in the global context.
        return localStorage;
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
module.exports = __turbopack_context__.r("[project]/TMFG/node_modules/debug/src/common.js [app-route] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */ formatters.j = function(v) {
    try {
        return JSON.stringify(v);
    } catch (error) {
        return '[UnexpectedJSONParseError]: ' + error.message;
    }
};
}),
"[project]/TMFG/node_modules/debug/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */ if (typeof process === 'undefined' || process.type === 'renderer' || ("TURBOPACK compile-time value", false) === true || process.__nwjs) {
    module.exports = __turbopack_context__.r("[project]/TMFG/node_modules/debug/src/browser.js [app-route] (ecmascript)");
} else {
    module.exports = __turbopack_context__.r("[project]/TMFG/node_modules/debug/src/node.js [app-route] (ecmascript)");
}
}),
"[project]/TMFG/node_modules/has-flag/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = (flag, argv = process.argv)=>{
    const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf('--');
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};
}),
"[project]/TMFG/node_modules/supports-color/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const os = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const tty = __turbopack_context__.r("[externals]/tty [external] (tty, cjs)");
const hasFlag = __turbopack_context__.r("[project]/TMFG/node_modules/has-flag/index.js [app-route] (ecmascript)");
const { env } = process;
let forceColor;
if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false') || hasFlag('color=never')) {
    forceColor = 0;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
    forceColor = 1;
}
if ('FORCE_COLOR' in env) {
    if (env.FORCE_COLOR === 'true') {
        forceColor = 1;
    } else if (env.FORCE_COLOR === 'false') {
        forceColor = 0;
    } else {
        forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
}
function translateLevel(level) {
    if (level === 0) {
        return false;
    }
    return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
    };
}
function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
        return 0;
    }
    if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
        return 3;
    }
    if (hasFlag('color=256')) {
        return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
        return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === 'dumb') {
        return min;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        // Windows 10 build 10586 is the first Windows release that supports 256 colors.
        // Windows 10 build 14931 is the first release that supports 16m/TrueColor.
        const osRelease = os.release().split('.');
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
    }
    //TURBOPACK unreachable
    ;
}
function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
}
module.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};
}),
"[project]/TMFG/node_modules/follow-redirects/debug.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var debug;
module.exports = function() {
    if (!debug) {
        try {
            /* eslint global-require: off */ debug = __turbopack_context__.r("[project]/TMFG/node_modules/debug/src/index.js [app-route] (ecmascript)")("follow-redirects");
        } catch (error) {}
        if (typeof debug !== "function") {
            debug = function() {};
        }
    }
    debug.apply(null, arguments);
};
}),
"[project]/TMFG/node_modules/follow-redirects/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var url = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
var URL = url.URL;
var http = __turbopack_context__.r("[externals]/http [external] (http, cjs)");
var https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
var Writable = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Writable;
var assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
var debug = __turbopack_context__.r("[project]/TMFG/node_modules/follow-redirects/debug.js [app-route] (ecmascript)");
// Preventive platform detection
// istanbul ignore next
(function detectUnsupportedEnvironment() {
    var looksLikeNode = typeof process !== "undefined";
    var looksLikeBrowser = ("TURBOPACK compile-time value", "undefined") !== "undefined" && typeof document !== "undefined";
    var looksLikeV8 = isFunction(Error.captureStackTrace);
    if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
        console.warn("The follow-redirects package should be excluded from browser builds.");
    }
})();
// Whether to use the native URL object or the legacy url module
var useNativeURL = false;
try {
    assert(new URL(""));
} catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
}
// URL fields to preserve in copy operations
var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
];
// Create handlers that pass events from native requests
var events = [
    "abort",
    "aborted",
    "connect",
    "error",
    "socket",
    "timeout"
];
var eventHandlers = Object.create(null);
events.forEach(function(event) {
    eventHandlers[event] = function(arg1, arg2, arg3) {
        this._redirectable.emit(event, arg1, arg2, arg3);
    };
});
// Error types with codes
var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
// istanbul ignore next
var destroy = Writable.prototype.destroy || noop;
// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
    // Initialize the request
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    // Attach a callback if passed
    if (responseCallback) {
        this.on("response", responseCallback);
    }
    // React to responses of native requests
    var self = this;
    this._onNativeResponse = function(response) {
        try {
            self._processResponse(response);
        } catch (cause) {
            self.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({
                cause: cause
            }));
        }
    };
    // Perform the first request
    this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);
RedirectableRequest.prototype.abort = function() {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
};
RedirectableRequest.prototype.destroy = function(error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
};
// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function(data, encoding, callback) {
    // Writing is not allowed if end has been called
    if (this._ending) {
        throw new WriteAfterEndError();
    }
    // Validate input and shift parameters if necessary
    if (!isString(data) && !isBuffer(data)) {
        throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
    }
    // Ignore empty buffers, since writing them doesn't invoke the callback
    // https://github.com/nodejs/node/issues/22066
    if (data.length === 0) {
        if (callback) {
            callback();
        }
        return;
    }
    // Only write when we don't exceed the maximum body length
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
        this._requestBodyLength += data.length;
        this._requestBodyBuffers.push({
            data: data,
            encoding: encoding
        });
        this._currentRequest.write(data, encoding, callback);
    } else {
        this.emit("error", new MaxBodyLengthExceededError());
        this.abort();
    }
};
// Ends the current native request
RedirectableRequest.prototype.end = function(data, encoding, callback) {
    // Shift parameters if necessary
    if (isFunction(data)) {
        callback = data;
        data = encoding = null;
    } else if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
    }
    // Write data if needed and end
    if (!data) {
        this._ended = this._ending = true;
        this._currentRequest.end(null, null, callback);
    } else {
        var self = this;
        var currentRequest = this._currentRequest;
        this.write(data, encoding, function() {
            self._ended = true;
            currentRequest.end(null, null, callback);
        });
        this._ending = true;
    }
};
// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
};
// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
};
// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
    var self = this;
    // Destroys the socket on timeout
    function destroyOnTimeout(socket) {
        socket.setTimeout(msecs);
        socket.removeListener("timeout", socket.destroy);
        socket.addListener("timeout", socket.destroy);
    }
    // Sets up a timer to trigger a timeout event
    function startTimer(socket) {
        if (self._timeout) {
            clearTimeout(self._timeout);
        }
        self._timeout = setTimeout(function() {
            self.emit("timeout");
            clearTimer();
        }, msecs);
        destroyOnTimeout(socket);
    }
    // Stops a timeout from triggering
    function clearTimer() {
        // Clear the timeout
        if (self._timeout) {
            clearTimeout(self._timeout);
            self._timeout = null;
        }
        // Clean up all attached listeners
        self.removeListener("abort", clearTimer);
        self.removeListener("error", clearTimer);
        self.removeListener("response", clearTimer);
        self.removeListener("close", clearTimer);
        if (callback) {
            self.removeListener("timeout", callback);
        }
        if (!self.socket) {
            self._currentRequest.removeListener("socket", startTimer);
        }
    }
    // Attach callback if passed
    if (callback) {
        this.on("timeout", callback);
    }
    // Start the timer if or when the socket is opened
    if (this.socket) {
        startTimer(this.socket);
    } else {
        this._currentRequest.once("socket", startTimer);
    }
    // Clean up on events
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);
    return this;
};
// Proxy all other public ClientRequest methods
[
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
].forEach(function(method) {
    RedirectableRequest.prototype[method] = function(a, b) {
        return this._currentRequest[method](a, b);
    };
});
// Proxy all public ClientRequest properties
[
    "aborted",
    "connection",
    "socket"
].forEach(function(property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
        get: function() {
            return this._currentRequest[property];
        }
    });
});
RedirectableRequest.prototype._sanitizeOptions = function(options) {
    // Ensure headers are always present
    if (!options.headers) {
        options.headers = {};
    }
    // Since http.request treats host as an alias of hostname,
    // but the url module interprets host as hostname plus port,
    // eliminate the host property to avoid confusion.
    if (options.host) {
        // Use hostname if set, because it has precedence
        if (!options.hostname) {
            options.hostname = options.host;
        }
        delete options.host;
    }
    // Complete the URL object when necessary
    if (!options.pathname && options.path) {
        var searchPos = options.path.indexOf("?");
        if (searchPos < 0) {
            options.pathname = options.path;
        } else {
            options.pathname = options.path.substring(0, searchPos);
            options.search = options.path.substring(searchPos);
        }
    }
};
// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function() {
    // Load the native protocol
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
        throw new TypeError("Unsupported protocol " + protocol);
    }
    // If specified, use the agent corresponding to the protocol
    // (HTTP and HTTPS use different types of agents)
    if (this._options.agents) {
        var scheme = protocol.slice(0, -1);
        this._options.agent = this._options.agents[scheme];
    }
    // Create the native request and set up its event handlers
    var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events){
        request.on(event, eventHandlers[event]);
    }
    // RFC7230§5.3.1: When making a request directly to an origin server, […]
    // a client MUST send only the absolute path […] as the request-target.
    this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path;
    // End a redirected request
    // (The first request must be ended explicitly with RedirectableRequest#end)
    if (this._isRedirect) {
        // Write the request entity and end
        var i = 0;
        var self = this;
        var buffers = this._requestBodyBuffers;
        (function writeNext(error) {
            // Only write if this request has not been redirected yet
            // istanbul ignore else
            if (request === self._currentRequest) {
                // Report any write errors
                // istanbul ignore if
                if (error) {
                    self.emit("error", error);
                } else if (i < buffers.length) {
                    var buffer = buffers[i++];
                    // istanbul ignore else
                    if (!request.finished) {
                        request.write(buffer.data, buffer.encoding, writeNext);
                    }
                } else if (self._ended) {
                    request.end();
                }
            }
        })();
    }
};
// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function(response) {
    // Store the redirected response
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
        this._redirects.push({
            url: this._currentUrl,
            headers: response.headers,
            statusCode: statusCode
        });
    }
    // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
    // that further action needs to be taken by the user agent in order to
    // fulfill the request. If a Location header field is provided,
    // the user agent MAY automatically redirect its request to the URI
    // referenced by the Location field value,
    // even if the specific status code is not understood.
    // If the response is not a redirect; return it as-is
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
        response.responseUrl = this._currentUrl;
        response.redirects = this._redirects;
        this.emit("response", response);
        // Clean up
        this._requestBodyBuffers = [];
        return;
    }
    // The response is a redirect, so abort the current request
    destroyRequest(this._currentRequest);
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();
    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
        throw new TooManyRedirectsError();
    }
    // Store the request headers if applicable
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
        requestHeaders = Object.assign({
            // The Host header was set by nativeProtocol.request
            Host: response.req.getHeader("host")
        }, this._options.headers);
    }
    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
    // the server is redirecting the user agent to a different resource […]
    // A user agent can perform a retrieval request targeting that URI
    // (a GET or HEAD request if using HTTP) […]
    statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = "GET";
        // Drop a possible entity and headers related to it
        this._requestBodyBuffers = [];
        removeMatchingHeaders(/^content-/i, this._options.headers);
    }
    // Drop the Host header, as the redirect might lead to a different host
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
    // If the redirect is relative, carry over the host of the last request
    var currentUrlParts = parseUrl(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, {
        host: currentHost
    }));
    // Create the redirected request
    var redirectUrl = resolveUrl(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);
    // Drop confidential headers when redirecting to a less secure protocol
    // or to a different domain that is not a superdomain
    if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
        removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
    }
    // Evaluate the beforeRedirect callback
    if (isFunction(beforeRedirect)) {
        var responseDetails = {
            headers: response.headers,
            statusCode: statusCode
        };
        var requestDetails = {
            url: currentUrl,
            method: method,
            headers: requestHeaders
        };
        beforeRedirect(this._options, responseDetails, requestDetails);
        this._sanitizeOptions(this._options);
    }
    // Perform the redirected request
    this._performRequest();
};
// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
    // Default settings
    var exports = {
        maxRedirects: 21,
        maxBodyLength: 10 * 1024 * 1024
    };
    // Wrap each protocol
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function(scheme) {
        var protocol = scheme + ":";
        var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
        var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);
        // Executes a request, following redirects
        function request(input, options, callback) {
            // Parse parameters, ensuring that input is an object
            if (isURL(input)) {
                input = spreadUrlObject(input);
            } else if (isString(input)) {
                input = spreadUrlObject(parseUrl(input));
            } else {
                callback = options;
                options = validateUrl(input);
                input = {
                    protocol: protocol
                };
            }
            if (isFunction(options)) {
                callback = options;
                options = null;
            }
            // Set defaults
            options = Object.assign({
                maxRedirects: exports.maxRedirects,
                maxBodyLength: exports.maxBodyLength
            }, input, options);
            options.nativeProtocols = nativeProtocols;
            if (!isString(options.host) && !isString(options.hostname)) {
                options.hostname = "::1";
            }
            assert.equal(options.protocol, protocol, "protocol mismatch");
            debug("options", options);
            return new RedirectableRequest(options, callback);
        }
        // Executes a GET request, following redirects
        function get(input, options, callback) {
            var wrappedRequest = wrappedProtocol.request(input, options, callback);
            wrappedRequest.end();
            return wrappedRequest;
        }
        // Expose the properties on the wrapped protocol
        Object.defineProperties(wrappedProtocol, {
            request: {
                value: request,
                configurable: true,
                enumerable: true,
                writable: true
            },
            get: {
                value: get,
                configurable: true,
                enumerable: true,
                writable: true
            }
        });
    });
    return exports;
}
function noop() {}
function parseUrl(input) {
    var parsed;
    // istanbul ignore else
    if (useNativeURL) {
        parsed = new URL(input);
    } else {
        // Ensure the URL is valid and absolute
        parsed = validateUrl(url.parse(input));
        if (!isString(parsed.protocol)) {
            throw new InvalidUrlError({
                input
            });
        }
    }
    return parsed;
}
function resolveUrl(relative, base) {
    // istanbul ignore next
    return useNativeURL ? new URL(relative, base) : parseUrl(url.resolve(base, relative));
}
function validateUrl(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
        throw new InvalidUrlError({
            input: input.href || input
        });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
        throw new InvalidUrlError({
            input: input.href || input
        });
    }
    return input;
}
function spreadUrlObject(urlObject, target) {
    var spread = target || {};
    for (var key of preservedUrlFields){
        spread[key] = urlObject[key];
    }
    // Fix IPv6 hostname
    if (spread.hostname.startsWith("[")) {
        spread.hostname = spread.hostname.slice(1, -1);
    }
    // Ensure port is a number
    if (spread.port !== "") {
        spread.port = Number(spread.port);
    }
    // Concatenate path
    spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
    return spread;
}
function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for(var header in headers){
        if (regex.test(header)) {
            lastValue = headers[header];
            delete headers[header];
        }
    }
    return lastValue === null || typeof lastValue === "undefined" ? undefined : String(lastValue).trim();
}
function createErrorType(code, message, baseClass) {
    // Create constructor
    function CustomError(properties) {
        // istanbul ignore else
        if (isFunction(Error.captureStackTrace)) {
            Error.captureStackTrace(this, this.constructor);
        }
        Object.assign(this, properties || {});
        this.code = code;
        this.message = this.cause ? message + ": " + this.cause.message : message;
    }
    // Attach constructor and set default properties
    CustomError.prototype = new (baseClass || Error)();
    Object.defineProperties(CustomError.prototype, {
        constructor: {
            value: CustomError,
            enumerable: false
        },
        name: {
            value: "Error [" + code + "]",
            enumerable: false
        }
    });
    return CustomError;
}
function destroyRequest(request, error) {
    for (var event of events){
        request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop);
    request.destroy(error);
}
function isSubdomain(subdomain, domain) {
    assert(isString(subdomain) && isString(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}
function isString(value) {
    return typeof value === "string" || value instanceof String;
}
function isFunction(value) {
    return typeof value === "function";
}
function isBuffer(value) {
    return typeof value === "object" && "length" in value;
}
function isURL(value) {
    return URL && value instanceof URL;
}
// Exports
module.exports = wrap({
    http: http,
    https: https
});
module.exports.wrap = wrap;
}),
"[project]/TMFG/node_modules/@sendgrid/client/package.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"name":"@sendgrid/client","description":"Twilio SendGrid NodeJS API client","version":"8.1.6","author":"Twilio SendGrid <help@twilio.com> (sendgrid.com)","contributors":["Kyle Partridge <kyle.partridge@sendgrid.com>","David Tomberlin <david.tomberlin@sendgrid.com>","Swift <swift@sendgrid.com>","Brandon West <brandon.west@sendgrid.com>","Scott Motte <scott.motte@sendgrid.com>","Robert Acosta <robert.acosta@sendgrid.com>","Elmer Thomas <ethomas@twilio.com>","Adam Reis <adam@reis.nz>"],"license":"MIT","homepage":"https://sendgrid.com","repository":{"type":"git","url":"git://github.com/sendgrid/sendgrid-nodejs.git"},"publishConfig":{"access":"public"},"main":"index.js","engines":{"node":">=12.*"},"dependencies":{"@sendgrid/helpers":"^8.0.0","axios":"^1.12.0"},"devDependencies":{"chai":"4.2.0","nock":"^10.0.6"},"resolutions":{"chai":"4.2.0"},"tags":["http","rest","api","mail","sendgrid"],"gitHead":"498e2329e87d804d83f4a7b519d33fa09198d0ca"});}),
"[project]/TMFG/node_modules/@sendgrid/client/src/classes/client.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const axios = __turbopack_context__.r("[project]/TMFG/node_modules/axios/dist/node/axios.cjs [app-route] (ecmascript)");
const pkg = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/client/package.json (json)");
const { helpers: { mergeData }, classes: { Response, ResponseError } } = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/index.js [app-route] (ecmascript)");
const API_KEY_PREFIX = 'SG.';
const SENDGRID_BASE_URL = 'https://api.sendgrid.com/';
const TWILIO_BASE_URL = 'https://email.twilio.com/';
const SENDGRID_REGION = 'global';
// Initialize the allowed regions and their corresponding hosts
const REGION_HOST_MAP = {
    eu: 'https://api.eu.sendgrid.com/',
    global: 'https://api.sendgrid.com/'
};
class Client {
    constructor(){
        this.auth = '';
        this.impersonateSubuser = '';
        this.sendgrid_region = SENDGRID_REGION;
        this.defaultHeaders = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'sendgrid/' + pkg.version + ';nodejs'
        };
        this.defaultRequest = {
            baseUrl: SENDGRID_BASE_URL,
            url: '',
            method: 'GET',
            headers: {},
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        };
    }
    setApiKey(apiKey) {
        this.auth = 'Bearer ' + apiKey;
        this.setDefaultRequest('baseUrl', REGION_HOST_MAP[this.sendgrid_region]);
        if (!this.isValidApiKey(apiKey)) {
            console.warn(`API key does not start with "${API_KEY_PREFIX}".`);
        }
    }
    setTwilioEmailAuth(username, password) {
        const b64Auth = Buffer.from(username + ':' + password).toString('base64');
        this.auth = 'Basic ' + b64Auth;
        this.setDefaultRequest('baseUrl', TWILIO_BASE_URL);
        if (!this.isValidTwilioAuth(username, password)) {
            console.warn('Twilio Email credentials must be non-empty strings.');
        }
    }
    isValidApiKey(apiKey) {
        return this.isString(apiKey) && apiKey.trim().startsWith(API_KEY_PREFIX);
    }
    isValidTwilioAuth(username, password) {
        return this.isString(username) && username && this.isString(password) && password;
    }
    isString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    setImpersonateSubuser(subuser) {
        this.impersonateSubuser = subuser;
    }
    setDefaultHeader(key, value) {
        if (key !== null && typeof key === 'object') {
            // key is an object
            Object.assign(this.defaultHeaders, key);
            return this;
        }
        this.defaultHeaders[key] = value;
        return this;
    }
    setDefaultRequest(key, value) {
        if (key !== null && typeof key === 'object') {
            // key is an object
            Object.assign(this.defaultRequest, key);
            return this;
        }
        this.defaultRequest[key] = value;
        return this;
    }
    /**
   * Global is the default residency (or region)
   * Global region means the message will be sent through https://api.sendgrid.com
   * EU region means the message will be sent through https://api.eu.sendgrid.com
   **/ setDataResidency(region) {
        if (!REGION_HOST_MAP.hasOwnProperty(region)) {
            console.warn('Region can only be "global" or "eu".');
        } else {
            this.sendgrid_region = region;
            this.setDefaultRequest('baseUrl', REGION_HOST_MAP[region]);
        }
        return this;
    }
    createHeaders(data) {
        // Merge data with default headers.
        const headers = mergeData(this.defaultHeaders, data);
        // Add auth, but don't overwrite if header already set.
        if (typeof headers.Authorization === 'undefined' && this.auth) {
            headers.Authorization = this.auth;
        }
        if (this.impersonateSubuser) {
            headers['On-Behalf-Of'] = this.impersonateSubuser;
        }
        return headers;
    }
    createRequest(data) {
        let options = {
            url: data.uri || data.url,
            baseUrl: data.baseUrl,
            method: data.method,
            data: data.body,
            params: data.qs,
            headers: data.headers
        };
        // Merge data with default request.
        options = mergeData(this.defaultRequest, options);
        options.headers = this.createHeaders(options.headers);
        options.baseURL = options.baseUrl;
        delete options.baseUrl;
        return options;
    }
    request(data, cb) {
        data = this.createRequest(data);
        const promise = new Promise((resolve, reject)=>{
            axios(data).then((response)=>{
                return resolve([
                    new Response(response.status, response.data, response.headers),
                    response.data
                ]);
            }).catch((error)=>{
                if (error.response) {
                    if (error.response.status >= 400) {
                        return reject(new ResponseError(error.response));
                    }
                }
                return reject(error);
            });
        });
        // Throw an error in case a callback function was not passed.
        if (cb && typeof cb !== 'function') {
            throw new Error('Callback passed is not a function.');
        }
        if (cb) {
            return promise.then((result)=>cb(null, result)).catch((error)=>cb(error, null));
        }
        return promise;
    }
}
module.exports = Client;
}),
"[project]/TMFG/node_modules/@sendgrid/client/src/client.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const Client = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/client/src/classes/client.js [app-route] (ecmascript)");
//Export singleton instance
module.exports = new Client();
}),
"[project]/TMFG/node_modules/@sendgrid/client/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const client = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/client/src/client.js [app-route] (ecmascript)");
const Client = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/client/src/classes/client.js [app-route] (ecmascript)");
module.exports = client;
module.exports.Client = Client;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/convert-keys.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Helper to convert an object's keys
 */ module.exports = function convertKeys(obj, converter, ignored) {
    //Validate
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Non object passed to convertKeys: ' + obj);
    }
    //Ignore arrays
    if (Array.isArray(obj)) {
        return obj;
    }
    //Ensure array for ignored values
    if (!Array.isArray(ignored)) {
        ignored = [];
    }
    //Process all properties
    for(const key in obj){
        //istanbul ignore else
        if (obj.hasOwnProperty(key)) {
            //Convert key to snake case
            const converted = converter(key);
            //Recursive for child objects, unless ignored
            //The ignored check checks both variants of the key
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (!ignored.includes(key) && !ignored.includes(converted)) {
                    obj[key] = convertKeys(obj[key], converter, ignored);
                }
            }
            //Convert key to snake case and set if needed
            if (converted !== key) {
                obj[converted] = obj[key];
                delete obj[key];
            }
        }
    }
    //Return object
    return obj;
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/str-to-camel-case.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Internal conversion helper
 */ module.exports = function strToCamelCase(str) {
    if (typeof str !== 'string') {
        throw new Error('String expected for conversion to snake case');
    }
    return str.trim().replace(/_+|\-+/g, ' ').replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (Number(match) === 0) {
            return '';
        }
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-camel-case.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const convertKeys = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/convert-keys.js [app-route] (ecmascript)");
const strToCamelCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/str-to-camel-case.js [app-route] (ecmascript)");
/**
 * Convert object keys to camel case
 */ module.exports = function toCamelCase(obj, ignored) {
    return convertKeys(obj, strToCamelCase, ignored);
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/str-to-snake-case.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Internal conversion helper
 */ module.exports = function strToSnakeCase(str) {
    if (typeof str !== 'string') {
        throw new Error('String expected for conversion to snake case');
    }
    return str.trim().replace(/(\s*\-*\b\w|[A-Z])/g, function($1) {
        $1 = $1.trim().toLowerCase().replace('-', '');
        return ($1[0] === '_' ? '' : '_') + $1;
    }).slice(1);
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-snake-case.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const convertKeys = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/convert-keys.js [app-route] (ecmascript)");
const strToSnakeCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/str-to-snake-case.js [app-route] (ecmascript)");
/**
 * Convert object keys to snake case
 */ module.exports = function toSnakeCase(obj, ignored) {
    return convertKeys(obj, strToSnakeCase, ignored);
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/deep-clone.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Deep cloning helper for objects
 */ module.exports = function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/attachment.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const toCamelCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-camel-case.js [app-route] (ecmascript)");
const toSnakeCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-snake-case.js [app-route] (ecmascript)");
const deepClone = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/deep-clone.js [app-route] (ecmascript)");
const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
/**
 * Attachment class
 */ class Attachment {
    /**
   * Constructor
   */ constructor(data){
        //Create from data
        if (data) {
            this.fromData(data);
        }
    }
    /**
   * From data
   */ fromData(data) {
        //Expecting object
        if (typeof data !== 'object') {
            throw new Error('Expecting object for Mail data');
        }
        //Convert to camel case to make it workable, making a copy to prevent
        //changes to the original objects
        data = deepClone(data);
        data = toCamelCase(data);
        //Extract properties from data
        const { content, filename, type, disposition, contentId, filePath } = data;
        if (typeof content !== 'undefined' && typeof filePath !== 'undefined') {
            throw new Error("The props 'content' and 'filePath' cannot be used together.");
        }
        //Set data
        this.setFilename(filename);
        this.setType(type);
        this.setDisposition(disposition);
        this.setContentId(contentId);
        this.setContent(filePath ? this.readFile(filePath) : content);
    }
    /**
   * Read a file and return its content as base64
   */ readFile(filePath) {
        return fs.readFileSync(path.resolve(filePath));
    }
    /**
   * Set content
   */ setContent(content) {
        //Duck type check toString on content if it's a Buffer as that's the method that will be called.
        if (typeof content === 'string') {
            this.content = content;
            return;
        } else if (content instanceof Buffer && content.toString !== undefined) {
            this.content = content.toString();
            if (this.disposition === 'attachment') {
                this.content = content.toString('base64');
            }
            return;
        }
        throw new Error('`content` expected to be either Buffer or string');
    }
    /**
   * Set content
   */ setFileContent(content) {
        if (content instanceof Buffer && content.toString !== undefined) {
            this.content = content.toString('base64');
            return;
        }
        throw new Error('`content` expected to be Buffer');
    }
    /**
   * Set filename
   */ setFilename(filename) {
        if (typeof filename === 'undefined') {
            return;
        }
        if (filename && typeof filename !== 'string') {
            throw new Error('String expected for `filename`');
        }
        this.filename = filename;
    }
    /**
   * Set type
   */ setType(type) {
        if (typeof type === 'undefined') {
            return;
        }
        if (typeof type !== 'string') {
            throw new Error('String expected for `type`');
        }
        this.type = type;
    }
    /**
   * Set disposition
   */ setDisposition(disposition) {
        if (typeof disposition === 'undefined') {
            return;
        }
        if (typeof disposition !== 'string') {
            throw new Error('String expected for `disposition`');
        }
        this.disposition = disposition;
    }
    /**
   * Set content ID
   */ setContentId(contentId) {
        if (typeof contentId === 'undefined') {
            return;
        }
        if (typeof contentId !== 'string') {
            throw new Error('String expected for `contentId`');
        }
        this.contentId = contentId;
    }
    /**
   * To JSON
   */ toJSON() {
        //Extract properties from self
        const { content, filename, type, disposition, contentId } = this;
        //Initialize with mandatory properties
        const json = {
            content,
            filename
        };
        //Add whatever else we have
        if (typeof type !== 'undefined') {
            json.type = type;
        }
        if (typeof disposition !== 'undefined') {
            json.disposition = disposition;
        }
        if (typeof contentId !== 'undefined') {
            json.contentId = contentId;
        }
        //Return
        return toSnakeCase(json);
    }
}
//Export class
module.exports = Attachment;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/split-name-email.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Split name and email address from string
 */ module.exports = function splitNameEmail(str) {
    //If no email bracket present, return as is
    if (str.indexOf('<') === -1) {
        return [
            '',
            str
        ];
    }
    //Split into name and email
    let [name, email] = str.split('<');
    //Trim and fix up
    name = name.trim();
    email = email.replace('>', '').trim();
    //Return as array
    return [
        name,
        email
    ];
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/email-address.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const splitNameEmail = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/split-name-email.js [app-route] (ecmascript)");
/**
 * Email address class
 */ class EmailAddress {
    /**
	 * Constructor
	 */ constructor(data){
        //Construct from data
        if (data) {
            this.fromData(data);
        }
    }
    /**
   * From data
   */ fromData(data) {
        //String given
        if (typeof data === 'string') {
            const [name, email] = splitNameEmail(data);
            data = {
                name,
                email
            };
        }
        //Expecting object
        if (typeof data !== 'object') {
            throw new Error('Expecting object or string for EmailAddress data');
        }
        //Extract name and email
        const { name, email } = data;
        //Set
        this.setEmail(email);
        this.setName(name);
    }
    /**
   * Set name
   */ setName(name) {
        if (typeof name === 'undefined') {
            return;
        }
        if (typeof name !== 'string') {
            throw new Error('String expected for `name`');
        }
        this.name = name;
    }
    /**
   * Set email (mandatory)
   */ setEmail(email) {
        if (typeof email === 'undefined') {
            throw new Error('Must provide `email`');
        }
        if (typeof email !== 'string') {
            throw new Error('String expected for `email`');
        }
        this.email = email;
    }
    /**
	 * To JSON
	 */ toJSON() {
        //Get properties
        const { email, name } = this;
        //Initialize with mandatory properties
        const json = {
            email
        };
        //Add name if present
        if (name !== '') {
            json.name = name;
        }
        //Return
        return json;
    }
    /**************************************************************************
   * Static helpers
   ***/ /**
   * Create an EmailAddress instance from given data
   */ static create(data) {
        //Array?
        if (Array.isArray(data)) {
            return data.filter((item)=>!!item).map((item)=>this.create(item));
        }
        //Already instance of EmailAddress class?
        if (data instanceof EmailAddress) {
            return data;
        }
        //Create instance
        return new EmailAddress(data);
    }
}
//Export class
module.exports = EmailAddress;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/wrap-substitutions.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Wrap substitutions
 */ module.exports = function wrap(substitutions, left = '{{', right = '}}') {
    //Process arrays
    if (Array.isArray(substitutions)) {
        return substitutions.map((subs)=>wrap(subs, left, right));
    }
    //Initialize new wrapped object
    const wrapped = {};
    //Map substitutions and ensure string for value
    for(const key in substitutions){
        //istanbul ignore else
        if (substitutions.hasOwnProperty(key)) {
            wrapped[left + key + right] = String(substitutions[key]);
        }
    }
    //Return wrapped substitutions
    return wrapped;
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/personalization.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const EmailAddress = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/email-address.js [app-route] (ecmascript)");
const toCamelCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-camel-case.js [app-route] (ecmascript)");
const toSnakeCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-snake-case.js [app-route] (ecmascript)");
const deepClone = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/deep-clone.js [app-route] (ecmascript)");
const deepMerge = __turbopack_context__.r("[project]/TMFG/node_modules/deepmerge/dist/cjs.js [app-route] (ecmascript)");
const wrapSubstitutions = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/wrap-substitutions.js [app-route] (ecmascript)");
/**
 * Personalization class
 */ class Personalization {
    /**
   * Constructor
   */ constructor(data){
        //Init array and object placeholders
        this.to = [];
        this.cc = [];
        this.bcc = [];
        this.headers = {};
        this.customArgs = {};
        this.substitutions = {};
        this.substitutionWrappers = [
            '{{',
            '}}'
        ];
        this.dynamicTemplateData = {};
        //Build from data if given
        if (data) {
            this.fromData(data);
        }
    }
    /**
   * From data
   */ fromData(data) {
        //Expecting object
        if (typeof data !== 'object') {
            throw new Error('Expecting object for Mail data');
        }
        //Convert to camel case to make it workable, making a copy to prevent
        //changes to the original objects
        data = deepClone(data);
        data = toCamelCase(data, [
            'substitutions',
            'dynamicTemplateData',
            'customArgs',
            'headers'
        ]);
        //Extract properties from data
        const { to, from, cc, bcc, subject, headers, customArgs, sendAt, substitutions, substitutionWrappers, dynamicTemplateData } = data;
        //Set data
        this.setTo(to);
        this.setFrom(from);
        this.setCc(cc);
        this.setBcc(bcc);
        this.setSubject(subject);
        this.setHeaders(headers);
        this.setSubstitutions(substitutions);
        this.setSubstitutionWrappers(substitutionWrappers);
        this.setCustomArgs(customArgs);
        this.setDynamicTemplateData(dynamicTemplateData);
        this.setSendAt(sendAt);
    }
    /**
   * Set subject
   */ setSubject(subject) {
        if (typeof subject === 'undefined') {
            return;
        }
        if (typeof subject !== 'string') {
            throw new Error('String expected for `subject`');
        }
        this.subject = subject;
    }
    /**
   * Set send at
   */ setSendAt(sendAt) {
        if (typeof sendAt === 'undefined') {
            return;
        }
        if (!Number.isInteger(sendAt)) {
            throw new Error('Integer expected for `sendAt`');
        }
        this.sendAt = sendAt;
    }
    /**
   * Set to
   */ setTo(to) {
        if (typeof to === 'undefined') {
            return;
        }
        if (!Array.isArray(to)) {
            to = [
                to
            ];
        }
        this.to = EmailAddress.create(to);
    }
    /**
   * Set from
   * */ setFrom(from) {
        if (typeof from === 'undefined') {
            return;
        }
        this.from = EmailAddress.create(from);
    }
    /**
   * Add a single to
   */ addTo(to) {
        if (typeof to === 'undefined') {
            return;
        }
        this.to.push(EmailAddress.create(to));
    }
    /**
   * Set cc
   */ setCc(cc) {
        if (typeof cc === 'undefined') {
            return;
        }
        if (!Array.isArray(cc)) {
            cc = [
                cc
            ];
        }
        this.cc = EmailAddress.create(cc);
    }
    /**
   * Add a single cc
   */ addCc(cc) {
        if (typeof cc === 'undefined') {
            return;
        }
        this.cc.push(EmailAddress.create(cc));
    }
    /**
   * Set bcc
   */ setBcc(bcc) {
        if (typeof bcc === 'undefined') {
            return;
        }
        if (!Array.isArray(bcc)) {
            bcc = [
                bcc
            ];
        }
        this.bcc = EmailAddress.create(bcc);
    }
    /**
   * Add a single bcc
   */ addBcc(bcc) {
        if (typeof bcc === 'undefined') {
            return;
        }
        this.bcc.push(EmailAddress.create(bcc));
    }
    /**
   * Set headers
   */ setHeaders(headers) {
        if (typeof headers === 'undefined') {
            return;
        }
        if (typeof headers !== 'object' || headers === null) {
            throw new Error('Object expected for `headers`');
        }
        this.headers = headers;
    }
    /**
   * Add a header
   */ addHeader(key, value) {
        if (typeof key !== 'string') {
            throw new Error('String expected for header key');
        }
        if (typeof value !== 'string') {
            throw new Error('String expected for header value');
        }
        this.headers[key] = value;
    }
    /**
   * Set custom args
   */ setCustomArgs(customArgs) {
        if (typeof customArgs === 'undefined') {
            return;
        }
        if (typeof customArgs !== 'object' || customArgs === null) {
            throw new Error('Object expected for `customArgs`');
        }
        this.customArgs = customArgs;
    }
    /**
   * Add a custom arg
   */ addCustomArg(key, value) {
        if (typeof key !== 'string') {
            throw new Error('String expected for custom arg key');
        }
        if (typeof value !== 'string') {
            throw new Error('String expected for custom arg value');
        }
        this.customArgs[key] = value;
    }
    /**
   * Set substitutions
   */ setSubstitutions(substitutions) {
        if (typeof substitutions === 'undefined') {
            return;
        }
        if (typeof substitutions !== 'object') {
            throw new Error('Object expected for `substitutions`');
        }
        this.substitutions = substitutions;
    }
    /**
   * Add a substitution
   */ addSubstitution(key, value) {
        if (typeof key !== 'string') {
            throw new Error('String expected for substitution key');
        }
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new Error('String or Number expected for substitution value');
        }
        this.substitutions[key] = value;
    }
    /**
   * Reverse merge substitutions, preserving existing ones
   */ reverseMergeSubstitutions(substitutions) {
        if (typeof substitutions === 'undefined' || substitutions === null) {
            return;
        }
        if (typeof substitutions !== 'object') {
            throw new Error('Object expected for `substitutions` in reverseMergeSubstitutions');
        }
        this.substitutions = Object.assign({}, substitutions, this.substitutions);
    }
    /**
   * Set substitution wrappers
   */ setSubstitutionWrappers(wrappers) {
        if (typeof wrappers === 'undefined' || wrappers === null) {
            return;
        }
        if (!Array.isArray(wrappers) || wrappers.length !== 2) {
            throw new Error('Array expected with two elements for `substitutionWrappers`');
        }
        this.substitutionWrappers = wrappers;
    }
    /**
   * Reverse merge dynamic template data, preserving existing ones
   */ deepMergeDynamicTemplateData(dynamicTemplateData) {
        if (typeof dynamicTemplateData === 'undefined' || dynamicTemplateData === null) {
            return;
        }
        if (typeof dynamicTemplateData !== 'object') {
            throw new Error('Object expected for `dynamicTemplateData` in deepMergeDynamicTemplateData');
        }
        this.dynamicTemplateData = deepMerge(dynamicTemplateData, this.dynamicTemplateData);
    }
    /**
   * Set dynamic template data
   */ setDynamicTemplateData(dynamicTemplateData) {
        if (typeof dynamicTemplateData === 'undefined') {
            return;
        }
        if (typeof dynamicTemplateData !== 'object') {
            throw new Error('Object expected for `dynamicTemplateData`');
        }
        this.dynamicTemplateData = dynamicTemplateData;
    }
    /**
   * To JSON
   */ toJSON() {
        //Get data from self
        const { to, from, cc, bcc, subject, headers, customArgs, sendAt, substitutions, substitutionWrappers, dynamicTemplateData } = this;
        //Initialize with mandatory values
        const json = {
            to
        };
        //Arrays
        if (Array.isArray(cc) && cc.length > 0) {
            json.cc = cc;
        }
        if (Array.isArray(bcc) && bcc.length > 0) {
            json.bcc = bcc;
        }
        //Objects
        if (Object.keys(headers).length > 0) {
            json.headers = headers;
        }
        if (substitutions && Object.keys(substitutions).length > 0) {
            const [left, right] = substitutionWrappers;
            json.substitutions = wrapSubstitutions(substitutions, left, right);
        }
        if (Object.keys(customArgs).length > 0) {
            json.customArgs = customArgs;
        }
        if (dynamicTemplateData && Object.keys(dynamicTemplateData).length > 0) {
            json.dynamicTemplateData = dynamicTemplateData;
        }
        //Simple properties
        if (typeof subject !== 'undefined') {
            json.subject = subject;
        }
        if (typeof sendAt !== 'undefined') {
            json.sendAt = sendAt;
        }
        if (typeof from !== 'undefined') {
            json.from = from;
        }
        //Return as snake cased object
        return toSnakeCase(json, [
            'substitutions',
            'dynamicTemplateData',
            'customArgs',
            'headers'
        ]);
    }
}
//Export class
module.exports = Personalization;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/array-to-json.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Helper to convert an array of objects to JSON
 */ module.exports = function arrayToJSON(arr) {
    return arr.map((item)=>{
        if (typeof item === 'object' && item !== null && typeof item.toJSON === 'function') {
            return item.toJSON();
        }
        return item;
    });
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/constants/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const DYNAMIC_TEMPLATE_CHAR_WARNING = `
Content with characters ', " or & may need to be escaped with three brackets
{{{ content }}}
See https://sendgrid.com/docs/for-developers/sending-email/using-handlebars/ for more information.`;
module.exports = {
    DYNAMIC_TEMPLATE_CHAR_WARNING
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/validate-settings.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const validate = (parent, parentName, childName, childType)=>{
    if (typeof parent === 'undefined' || typeof parent[childName] === 'undefined') {
        return;
    }
    if (typeof parent[childName] !== childType) {
        throw new Error(`${childType} expected for \`${parentName}.${childName}\``);
    }
};
module.exports = {
    validateMailSettings (settings) {
        if (typeof settings !== 'object') {
            throw new Error('Object expected for `mailSettings`');
        }
        const { bcc, bypassListManagement, bypassSpamManagement, bypassBounceManagement, bypassUnsubscribeManagement, footer, sandboxMode, spamCheck } = settings;
        validate(bcc, 'bcc', 'enable', 'boolean');
        validate(bcc, 'bcc', 'email', 'string');
        validate(bypassListManagement, 'bypassListManagement', 'enable', 'boolean');
        validate(bypassSpamManagement, 'bypassSpamManagement', 'enable', 'boolean');
        validate(bypassBounceManagement, 'bypassBounceManagement', 'enable', 'boolean');
        validate(bypassUnsubscribeManagement, 'bypassUnsubscribeManagement', 'enable', 'boolean');
        validate(footer, 'footer', 'enable', 'boolean');
        validate(footer, 'footer', 'text', 'string');
        validate(footer, 'footer', 'html', 'string');
        validate(sandboxMode, 'sandboxMode', 'enable', 'boolean');
        validate(spamCheck, 'spamCheck', 'enable', 'boolean');
        validate(spamCheck, 'spamCheck', 'threshold', 'number');
        validate(spamCheck, 'spamCheck', 'postToUrl', 'string');
    },
    validateTrackingSettings (settings) {
        if (typeof settings !== 'object') {
            throw new Error('Object expected for `trackingSettings`');
        }
        const { clickTracking, openTracking, subscriptionTracking, ganalytics } = settings;
        validate(clickTracking, 'clickTracking', 'enable', 'boolean');
        validate(clickTracking, 'clickTracking', 'enableText', 'boolean');
        validate(openTracking, 'openTracking', 'enable', 'boolean');
        validate(openTracking, 'openTracking', 'substitutionTag', 'string');
        validate(subscriptionTracking, 'subscriptionTracking', 'enable', 'boolean');
        validate(subscriptionTracking, 'subscriptionTracking', 'text', 'string');
        validate(subscriptionTracking, 'subscriptionTracking', 'html', 'string');
        validate(subscriptionTracking, 'subscriptionTracking', 'substitutionTag', 'string');
        validate(ganalytics, 'ganalytics', 'enable', 'boolean');
        validate(ganalytics, 'ganalytics', 'utm_source', 'string');
        validate(ganalytics, 'ganalytics', 'utm_medium', 'string');
        validate(ganalytics, 'ganalytics', 'utm_term', 'string');
        validate(ganalytics, 'ganalytics', 'utm_content', 'string');
        validate(ganalytics, 'ganalytics', 'utm_campaign', 'string');
    }
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/mail.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const EmailAddress = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/email-address.js [app-route] (ecmascript)");
const Personalization = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/personalization.js [app-route] (ecmascript)");
const toCamelCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-camel-case.js [app-route] (ecmascript)");
const toSnakeCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-snake-case.js [app-route] (ecmascript)");
const deepClone = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/deep-clone.js [app-route] (ecmascript)");
const arrayToJSON = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/array-to-json.js [app-route] (ecmascript)");
const { DYNAMIC_TEMPLATE_CHAR_WARNING } = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/constants/index.js [app-route] (ecmascript)");
const { validateMailSettings, validateTrackingSettings } = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/validate-settings.js [app-route] (ecmascript)");
/**
 * Mail class
 */ class Mail {
    /**
   * Constructor
   */ constructor(data){
        //Initialize array and object properties
        this.isDynamic = false;
        this.hideWarnings = false;
        this.personalizations = [];
        this.attachments = [];
        this.content = [];
        this.categories = [];
        this.headers = {};
        this.sections = {};
        this.customArgs = {};
        this.trackingSettings = {};
        this.mailSettings = {};
        this.asm = {};
        //Helper properties
        this.substitutions = null;
        this.substitutionWrappers = null;
        this.dynamicTemplateData = null;
        //Process data if given
        if (data) {
            this.fromData(data);
        }
    }
    /**
   * Build from data
   */ fromData(data) {
        //Expecting object
        if (typeof data !== 'object') {
            throw new Error('Expecting object for Mail data');
        }
        //Convert to camel case to make it workable, making a copy to prevent
        //changes to the original objects
        data = deepClone(data);
        data = toCamelCase(data, [
            'substitutions',
            'dynamicTemplateData',
            'customArgs',
            'headers',
            'sections'
        ]);
        //Extract properties from data
        const { to, from, replyTo, cc, bcc, sendAt, subject, text, html, content, templateId, personalizations, attachments, ipPoolName, batchId, sections, headers, categories, category, customArgs, asm, mailSettings, trackingSettings, substitutions, substitutionWrappers, dynamicTemplateData, isMultiple, hideWarnings, replyToList } = data;
        //Set data
        this.setFrom(from);
        this.setReplyTo(replyTo);
        this.setSubject(subject);
        this.setSendAt(sendAt);
        this.setTemplateId(templateId);
        this.setBatchId(batchId);
        this.setIpPoolName(ipPoolName);
        this.setAttachments(attachments);
        this.setContent(content);
        this.setSections(sections);
        this.setHeaders(headers);
        this.setCategories(category);
        this.setCategories(categories);
        this.setCustomArgs(customArgs);
        this.setAsm(asm);
        this.setMailSettings(mailSettings);
        this.setTrackingSettings(trackingSettings);
        this.setHideWarnings(hideWarnings);
        this.setReplyToList(replyToList);
        if (this.isDynamic) {
            this.setDynamicTemplateData(dynamicTemplateData);
        } else {
            this.setSubstitutions(substitutions);
            this.setSubstitutionWrappers(substitutionWrappers);
        }
        //Add contents from text/html properties
        this.addTextContent(text);
        this.addHtmlContent(html);
        //Using "to" property for personalizations
        if (personalizations) {
            this.setPersonalizations(personalizations);
        } else if (isMultiple && Array.isArray(to)) {
            //Multiple individual emails
            to.forEach((to)=>this.addTo(to, cc, bcc));
        } else {
            //Single email (possibly with multiple recipients in the to field)
            this.addTo(to, cc, bcc);
        }
    }
    /**
   * Set from email
   */ setFrom(from) {
        if (this._checkProperty('from', from, [
            this._checkUndefined
        ])) {
            if (typeof from !== 'string' && typeof from.email !== 'string') {
                throw new Error('String or address object expected for `from`');
            }
            this.from = EmailAddress.create(from);
        }
    }
    /**
   * Set reply to
   */ setReplyTo(replyTo) {
        if (this._checkProperty('replyTo', replyTo, [
            this._checkUndefined
        ])) {
            if (typeof replyTo !== 'string' && typeof replyTo.email !== 'string') {
                throw new Error('String or address object expected for `replyTo`');
            }
            this.replyTo = EmailAddress.create(replyTo);
        }
    }
    /**
   * Set subject
   */ setSubject(subject) {
        this._setProperty('subject', subject, 'string');
    }
    /**
   * Set send at
   */ setSendAt(sendAt) {
        if (this._checkProperty('sendAt', sendAt, [
            this._checkUndefined,
            this._createCheckThatThrows(Number.isInteger, 'Integer expected for `sendAt`')
        ])) {
            this.sendAt = sendAt;
        }
    }
    /**
   * Set template ID, also checks if the template is dynamic or legacy
   */ setTemplateId(templateId) {
        if (this._setProperty('templateId', templateId, 'string')) {
            if (templateId.indexOf('d-') === 0) {
                this.isDynamic = true;
            }
        }
    }
    /**
   * Set batch ID
   */ setBatchId(batchId) {
        this._setProperty('batchId', batchId, 'string');
    }
    /**
   * Set IP pool name
   */ setIpPoolName(ipPoolName) {
        this._setProperty('ipPoolName', ipPoolName, 'string');
    }
    /**
   * Set ASM
   */ setAsm(asm) {
        if (this._checkProperty('asm', asm, [
            this._checkUndefined,
            this._createTypeCheck('object')
        ])) {
            if (typeof asm.groupId !== 'number') {
                throw new Error('Expected `asm` to include an integer in its `groupId` field');
            }
            if (asm.groupsToDisplay && (!Array.isArray(asm.groupsToDisplay) || !asm.groupsToDisplay.every((group)=>typeof group === 'number'))) {
                throw new Error('Array of integers expected for `asm.groupsToDisplay`');
            }
            this.asm = asm;
        }
    }
    /**
   * Set personalizations
   */ setPersonalizations(personalizations) {
        if (!this._doArrayCheck('personalizations', personalizations)) {
            return;
        }
        if (!personalizations.every((personalization)=>typeof personalization === 'object')) {
            throw new Error('Array of objects expected for `personalizations`');
        }
        //Clear and use add helper to add one by one
        this.personalizations = [];
        personalizations.forEach((personalization)=>this.addPersonalization(personalization));
    }
    /**
   * Add personalization
   */ addPersonalization(personalization) {
        //We should either send substitutions or dynamicTemplateData
        //depending on the templateId
        if (this.isDynamic && personalization.substitutions) {
            delete personalization.substitutions;
        } else if (!this.isDynamic && personalization.dynamicTemplateData) {
            delete personalization.dynamicTemplateData;
        }
        //Convert to class if needed
        if (!(personalization instanceof Personalization)) {
            personalization = new Personalization(personalization);
        }
        //If this is dynamic, set dynamicTemplateData, or set substitutions
        if (this.isDynamic) {
            this.applyDynamicTemplateData(personalization);
        } else {
            this.applySubstitutions(personalization);
        }
        //Push personalization to array
        this.personalizations.push(personalization);
    }
    /**
   * Convenience method for quickly creating personalizations
   */ addTo(to, cc, bcc) {
        if (typeof to === 'undefined' && typeof cc === 'undefined' && typeof bcc === 'undefined') {
            throw new Error('Provide at least one of to, cc or bcc');
        }
        this.addPersonalization(new Personalization({
            to,
            cc,
            bcc
        }));
    }
    /**
   * Set substitutions
   */ setSubstitutions(substitutions) {
        this._setProperty('substitutions', substitutions, 'object');
    }
    /**
   * Set substitution wrappers
   */ setSubstitutionWrappers(substitutionWrappers) {
        let lengthCheck = (propertyName, value)=>{
            if (!Array.isArray(value) || value.length !== 2) {
                throw new Error('Array expected with two elements for `' + propertyName + '`');
            }
        };
        if (this._checkProperty('substitutionWrappers', substitutionWrappers, [
            this._checkUndefined,
            lengthCheck
        ])) {
            this.substitutionWrappers = substitutionWrappers;
        }
    }
    /**
   * Helper which applies globally set substitutions to personalizations
   */ applySubstitutions(personalization) {
        if (personalization instanceof Personalization) {
            personalization.reverseMergeSubstitutions(this.substitutions);
            personalization.setSubstitutionWrappers(this.substitutionWrappers);
        }
    }
    /**
   * Helper which applies globally set dynamic_template_data to personalizations
   */ applyDynamicTemplateData(personalization) {
        if (personalization instanceof Personalization) {
            personalization.deepMergeDynamicTemplateData(this.dynamicTemplateData);
        }
    }
    /**
   * Set dynamicTemplateData
   */ setDynamicTemplateData(dynamicTemplateData) {
        if (typeof dynamicTemplateData === 'undefined') {
            return;
        }
        if (typeof dynamicTemplateData !== 'object') {
            throw new Error('Object expected for `dynamicTemplateData`');
        }
        // Check dynamic template for non-escaped characters and warn if found
        if (!this.hideWarnings) {
            Object.values(dynamicTemplateData).forEach((value)=>{
                if (/['"&]/.test(value)) {
                    console.warn(DYNAMIC_TEMPLATE_CHAR_WARNING);
                }
            });
        }
        this.dynamicTemplateData = dynamicTemplateData;
    }
    /**
   * Set content
   */ setContent(content) {
        if (this._doArrayCheck('content', content)) {
            if (!content.every((contentField)=>typeof contentField === 'object')) {
                throw new Error('Expected each entry in `content` to be an object');
            }
            if (!content.every((contentField)=>typeof contentField.type === 'string')) {
                throw new Error('Expected each `content` entry to contain a `type` string');
            }
            if (!content.every((contentField)=>typeof contentField.value === 'string')) {
                throw new Error('Expected each `content` entry to contain a `value` string');
            }
            this.content = content;
        }
    }
    /**
   * Add content
   */ addContent(content) {
        if (this._checkProperty('content', content, [
            this._createTypeCheck('object')
        ])) {
            this.content.push(content);
        }
    }
    /**
   * Add text content
   */ addTextContent(text) {
        if (this._checkProperty('text', text, [
            this._checkUndefined,
            this._createTypeCheck('string')
        ])) {
            this.addContent({
                value: text,
                type: 'text/plain'
            });
        }
    }
    /**
   * Add HTML content
   */ addHtmlContent(html) {
        if (this._checkProperty('html', html, [
            this._checkUndefined,
            this._createTypeCheck('string')
        ])) {
            this.addContent({
                value: html,
                type: 'text/html'
            });
        }
    }
    /**
   * Set attachments
   */ setAttachments(attachments) {
        if (this._doArrayCheck('attachments', attachments)) {
            if (!attachments.every((attachment)=>typeof attachment.content === 'string')) {
                throw new Error('Expected each attachment to contain a `content` string');
            }
            if (!attachments.every((attachment)=>typeof attachment.filename === 'string')) {
                throw new Error('Expected each attachment to contain a `filename` string');
            }
            if (!attachments.every((attachment)=>!attachment.type || typeof attachment.type === 'string')) {
                throw new Error('Expected the attachment\'s `type` field to be a string');
            }
            if (!attachments.every((attachment)=>!attachment.disposition || typeof attachment.disposition === 'string')) {
                throw new Error('Expected the attachment\'s `disposition` field to be a string');
            }
            this.attachments = attachments;
        }
    }
    /**
   * Add attachment
   */ addAttachment(attachment) {
        if (this._checkProperty('attachment', attachment, [
            this._checkUndefined,
            this._createTypeCheck('object')
        ])) {
            this.attachments.push(attachment);
        }
    }
    /**
   * Set categories
   */ setCategories(categories) {
        let allElementsAreStrings = (propertyName, value)=>{
            if (!Array.isArray(value) || !value.every((item)=>typeof item === 'string')) {
                throw new Error('Array of strings expected for `' + propertyName + '`');
            }
        };
        if (typeof categories === 'string') {
            categories = [
                categories
            ];
        }
        if (this._checkProperty('categories', categories, [
            this._checkUndefined,
            allElementsAreStrings
        ])) {
            this.categories = categories;
        }
    }
    /**
   * Add category
   */ addCategory(category) {
        if (this._checkProperty('category', category, [
            this._createTypeCheck('string')
        ])) {
            this.categories.push(category);
        }
    }
    /**
   * Set headers
   */ setHeaders(headers) {
        this._setProperty('headers', headers, 'object');
    }
    /**
   * Add a header
   */ addHeader(key, value) {
        if (this._checkProperty('key', key, [
            this._createTypeCheck('string')
        ]) && this._checkProperty('value', value, [
            this._createTypeCheck('string')
        ])) {
            this.headers[key] = value;
        }
    }
    /**
   * Set sections
   */ setSections(sections) {
        this._setProperty('sections', sections, 'object');
    }
    /**
   * Set custom args
   */ setCustomArgs(customArgs) {
        this._setProperty('customArgs', customArgs, 'object');
    }
    /**
   * Set tracking settings
   */ setTrackingSettings(settings) {
        if (typeof settings === 'undefined') {
            return;
        }
        validateTrackingSettings(settings);
        this.trackingSettings = settings;
    }
    /**
   * Set mail settings
   */ setMailSettings(settings) {
        if (typeof settings === 'undefined') {
            return;
        }
        validateMailSettings(settings);
        this.mailSettings = settings;
    }
    /**
   * Set hide warnings
   */ setHideWarnings(hide) {
        if (typeof hide === 'undefined') {
            return;
        }
        if (typeof hide !== 'boolean') {
            throw new Error('Boolean expected for `hideWarnings`');
        }
        this.hideWarnings = hide;
    }
    /**
   * To JSON
   */ toJSON() {
        //Extract properties from self
        const { from, replyTo, sendAt, subject, content, templateId, personalizations, attachments, ipPoolName, batchId, asm, sections, headers, categories, customArgs, mailSettings, trackingSettings, replyToList } = this;
        //Initialize with mandatory values
        const json = {
            from,
            subject,
            personalizations: arrayToJSON(personalizations)
        };
        //Array properties
        if (Array.isArray(attachments) && attachments.length > 0) {
            json.attachments = arrayToJSON(attachments);
        }
        if (Array.isArray(categories) && categories.length > 0) {
            json.categories = categories.filter((cat)=>cat !== '');
        }
        if (Array.isArray(content) && content.length > 0) {
            json.content = arrayToJSON(content);
        }
        //Object properties
        if (Object.keys(headers).length > 0) {
            json.headers = headers;
        }
        if (Object.keys(mailSettings).length > 0) {
            json.mailSettings = mailSettings;
        }
        if (Object.keys(trackingSettings).length > 0) {
            json.trackingSettings = trackingSettings;
        }
        if (Object.keys(customArgs).length > 0) {
            json.customArgs = customArgs;
        }
        if (Object.keys(sections).length > 0) {
            json.sections = sections;
        }
        if (Object.keys(asm).length > 0) {
            json.asm = asm;
        }
        //Simple properties
        if (typeof replyTo !== 'undefined') {
            json.replyTo = replyTo;
        }
        if (typeof sendAt !== 'undefined') {
            json.sendAt = sendAt;
        }
        if (typeof batchId !== 'undefined') {
            json.batchId = batchId;
        }
        if (typeof templateId !== 'undefined') {
            json.templateId = templateId;
        }
        if (typeof ipPoolName !== 'undefined') {
            json.ipPoolName = ipPoolName;
        }
        if (typeof replyToList !== 'undefined') {
            json.replyToList = replyToList;
        }
        //Return as snake cased object
        return toSnakeCase(json, [
            'substitutions',
            'dynamicTemplateData',
            'customArgs',
            'headers',
            'sections'
        ]);
    }
    /**************************************************************************
   * Static helpers
   ***/ /**
   * Create a Mail instance from given data
   */ static create(data) {
        //Array?
        if (Array.isArray(data)) {
            return data.filter((item)=>!!item).map((item)=>this.create(item));
        }
        //Already instance of Mail class?
        if (data instanceof Mail) {
            return data;
        }
        //Create instance
        return new Mail(data);
    }
    /**************************************************************************
   * helpers for property-setting checks
   ***/ /**
   * Perform a set of checks on the new property value. Returns true if all
   * checks complete successfully without throwing errors or returning true.
   */ _checkProperty(propertyName, value, checks) {
        return !checks.some((e)=>e(propertyName, value));
    }
    /**
   * Set a property with normal undefined and type-checks
   */ _setProperty(propertyName, value, propertyType) {
        let propertyChecksPassed = this._checkProperty(propertyName, value, [
            this._checkUndefined,
            this._createTypeCheck(propertyType)
        ]);
        if (propertyChecksPassed) {
            this[propertyName] = value;
        }
        return propertyChecksPassed;
    }
    /**
   * Fail if the value is undefined.
   */ _checkUndefined(propertyName, value) {
        return typeof value === 'undefined';
    }
    /**
   * Create and return a function that checks for a given type
   */ _createTypeCheck(propertyType) {
        return (propertyName, value)=>{
            if (typeof value !== propertyType) {
                throw new Error(propertyType + ' expected for `' + propertyName + '`');
            }
        };
    }
    /**
   * Create a check out of a callback. If the callback
   * returns false, the check will throw an error.
   */ _createCheckThatThrows(check, errorString) {
        return (propertyName, value)=>{
            if (!check(value)) {
                throw new Error(errorString);
            }
        };
    }
    /**
   * Set an array property after checking that the new value is an
   * array.
   */ _setArrayProperty(propertyName, value) {
        if (this._doArrayCheck(propertyName, value)) {
            this[propertyName] = value;
        }
    }
    /**
   * Check that a value isn't undefined and is an array.
   */ _doArrayCheck(propertyName, value) {
        return this._checkProperty(propertyName, value, [
            this._checkUndefined,
            this._createCheckThatThrows(Array.isArray, 'Array expected for`' + propertyName + '`')
        ]);
    }
    /**
   * Set the replyToList from email body
   */ setReplyToList(replyToList) {
        if (this._doArrayCheck('replyToList', replyToList) && replyToList.length) {
            if (!replyToList.every((replyTo)=>replyTo && typeof replyTo.email === 'string')) {
                throw new Error('Expected each replyTo to contain an `email` string');
            }
            this.replyToList = replyToList;
        }
    }
}
//Export class
module.exports = Mail;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/response.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

class Response {
    constructor(statusCode, body, headers){
        this.statusCode = statusCode;
        this.body = body;
        this.headers = headers;
    }
    toString() {
        return 'HTTP ' + this.statusCode + ' ' + this.body;
    }
}
module.exports = Response;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/response-error.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Response error class
 */ class ResponseError extends Error {
    /**
   * Constructor
   */ constructor(response){
        //Super
        super();
        //Extract data from response
        const { headers, status, statusText, data } = response;
        //Set data
        this.code = status;
        this.message = statusText;
        this.response = {
            headers,
            body: data
        };
        //Capture stack trace
        if (!this.stack) {
            Error.captureStackTrace(this, this.constructor);
        }
        //Clean up stack trace
        const regex = new RegExp(process.cwd() + '/', 'gi');
        this.stack = this.stack.replace(regex, '');
    }
    /**
   * Convert to string
   */ toString() {
        const { body } = this.response;
        let err = `${this.message} (${this.code})`;
        if (body && Array.isArray(body.errors)) {
            body.errors.forEach((error)=>{
                const message = error.message;
                const field = error.field;
                const help = error.help;
                err += `\n  ${message}\n    ${field}\n    ${help}`;
            });
        }
        return err;
    }
    /**
   * Convert to simple object for JSON responses
   */ toJSON() {
        const { message, code, response } = this;
        return {
            message,
            code,
            response
        };
    }
}
//Export
module.exports = ResponseError;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/statistics.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const toCamelCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-camel-case.js [app-route] (ecmascript)");
const deepClone = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/deep-clone.js [app-route] (ecmascript)");
/**
 * Options
 */ const AggregatedByOptions = [
    'day',
    'week',
    'month'
];
const CountryOptions = [
    'us',
    'ca'
];
const SortByDirection = [
    'desc',
    'asc'
];
/**
 * Statistics class
 */ class Statistics {
    constructor(data){
        this.startDate = null;
        this.endDate = null;
        this.aggregatedBy = null;
        if (data) {
            this.fromData(data);
        }
    }
    /**
   * Build from data
   */ fromData(data) {
        //Expecting object
        if (typeof data !== 'object') {
            throw new Error('Expecting object for Statistics data');
        }
        //Convert to camel case to make it workable, making a copy to prevent
        //changes to the original objects
        data = deepClone(data);
        data = toCamelCase(data, [
            'substitutions',
            'customArgs'
        ]);
        const { startDate, endDate, aggregatedBy } = data;
        this.setStartDate(startDate);
        this.setEndDate(endDate);
        this.setAggregatedBy(aggregatedBy);
    }
    /**
   * Set startDate
   */ setStartDate(startDate) {
        if (typeof startDate === 'undefined') {
            throw new Error('Date expected for `startDate`');
        }
        if (new Date(startDate) === 'Invalid Date' || isNaN(new Date(startDate))) {
            throw new Error('Date expected for `startDate`');
        }
        console.log(startDate);
        this.startDate = new Date(startDate).toISOString().slice(0, 10);
    }
    /**
   * Set endDate
   */ setEndDate(endDate) {
        if (typeof endDate === 'undefined') {
            this.endDate = new Date().toISOString().slice(0, 10);
            return;
        }
        if (new Date(endDate) === 'Invalid Date' || isNaN(new Date(endDate))) {
            throw new Error('Date expected for `endDate`');
        }
        this.endDate = new Date(endDate).toISOString().slice(0, 10);
    }
    /**
   * Set aggregatedBy
   */ setAggregatedBy(aggregatedBy) {
        if (typeof aggregatedBy === 'undefined') {
            return;
        }
        if (typeof aggregatedBy === 'string' && AggregatedByOptions.includes(aggregatedBy.toLowerCase())) {
            this.aggregatedBy = aggregatedBy;
        } else {
            throw new Error('Incorrect value for `aggregatedBy`');
        }
    }
    /**
   * Get Global
   */ getGlobal() {
        const { startDate, endDate, aggregatedBy } = this;
        return {
            startDate,
            endDate,
            aggregatedBy
        };
    }
    /**
   * Get Advanced
   */ getAdvanced(country) {
        const json = this.getGlobal();
        if (typeof country === 'undefined') {
            return json;
        }
        if (typeof country === 'string' && CountryOptions.includes(country.toLowerCase())) {
            json.country = country;
        }
        return json;
    }
    /**
   * Get Advanced Mailbox Providers
   */ getAdvancedMailboxProviders(mailBoxProviders) {
        const json = this.getGlobal();
        if (typeof mailBoxProviders === 'undefined') {
            return json;
        }
        if (Array.isArray(mailBoxProviders) && mailBoxProviders.some((x)=>typeof x !== 'string')) {
            throw new Error('Array of strings expected for `mailboxProviders`');
        }
        json.mailBoxProviders = mailBoxProviders;
        return json;
    }
    /**
   * Get Advanced Browsers
   */ getAdvancedBrowsers(browsers) {
        const json = this.getGlobal();
        if (typeof browsers === 'undefined') {
            return json;
        }
        if (Array.isArray(browsers) && browsers.some((x)=>typeof x !== 'string')) {
            throw new Error('Array of strings expected for `browsers`');
        }
        json.browsers = browsers;
        return json;
    }
    /**
   * Get Categories
   */ getCategories(categories) {
        if (typeof categories === 'undefined') {
            throw new Error('Array of strings expected for `categories`');
        }
        if (!this._isValidArrayOfStrings(categories)) {
            throw new Error('Array of strings expected for `categories`');
        }
        const json = this.getGlobal();
        json.categories = categories;
        return json;
    }
    /**
   * Get Subuser
   */ getSubuser(subusers) {
        if (typeof subusers === 'undefined') {
            throw new Error('Array of strings expected for `subusers`');
        }
        if (!this._isValidArrayOfStrings(subusers)) {
            throw new Error('Array of strings expected for `subusers`');
        }
        const json = this.getGlobal();
        json.subusers = subusers;
        return json;
    }
    /**
   * Get Subuser Sum
   */ getSubuserSum(sortByMetric = 'delivered', sortByDirection = SortByDirection[0], limit = 5, offset = 0) {
        if (typeof sortByMetric !== 'string') {
            throw new Error('string expected for `sortByMetric`');
        }
        if (!SortByDirection.includes(sortByDirection.toLowerCase())) {
            throw new Error('desc or asc expected for `sortByDirection`');
        }
        if (typeof limit !== 'number') {
            throw new Error('number expected for `limit`');
        }
        if (typeof offset !== 'number') {
            throw new Error('number expected for `offset`');
        }
        const json = this.getGlobal();
        json.sortByMetric = sortByMetric;
        json.sortByDirection = sortByDirection;
        json.limit = limit;
        json.offset = offset;
        return json;
    }
    /**
   * Get Subuser Monthly
   */ getSubuserMonthly(sortByMetric = 'delivered', sortByDirection = SortByDirection[0], limit = 5, offset = 0) {
        if (typeof sortByMetric !== 'string') {
            throw new Error('string expected for `sortByMetric`');
        }
        if (!SortByDirection.includes(sortByDirection.toLowerCase())) {
            throw new Error('desc or asc expected for `sortByDirection`');
        }
        if (typeof limit !== 'number') {
            throw new Error('number expected for `limit`');
        }
        if (typeof offset !== 'number') {
            throw new Error('number expected for `offset`');
        }
        const json = this.getGlobal();
        json.sortByMetric = sortByMetric;
        json.sortByDirection = sortByDirection;
        json.limit = limit;
        json.offset = offset;
        return json;
    }
    _isValidArrayOfStrings(arr) {
        if (!Array.isArray(arr)) {
            return false;
        }
        if (arr.length < 1 || arr.some((x)=>typeof x !== 'string')) {
            return false;
        }
        return true;
    }
}
//Export class
module.exports = Statistics;
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/classes/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Expose classes
 */ const Attachment = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/attachment.js [app-route] (ecmascript)");
const EmailAddress = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/email-address.js [app-route] (ecmascript)");
const Mail = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/mail.js [app-route] (ecmascript)");
const Personalization = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/personalization.js [app-route] (ecmascript)");
const Response = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/response.js [app-route] (ecmascript)");
const ResponseError = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/response-error.js [app-route] (ecmascript)");
const Statistics = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/statistics.js [app-route] (ecmascript)");
/**
 * Export
 */ module.exports = {
    Attachment,
    EmailAddress,
    Mail,
    Personalization,
    Response,
    ResponseError,
    Statistics
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/merge-data.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Merge data helper
 */ module.exports = function mergeData(base, data) {
    //Validate data
    if (typeof base !== 'object' || base === null) {
        throw new Error('Not an object provided for base');
    }
    if (typeof data !== 'object' || data === null) {
        throw new Error('Not an object provided for data');
    }
    //Copy base
    const merged = Object.assign({}, base);
    //Add data
    for(const key in data){
        //istanbul ignore else
        if (data.hasOwnProperty(key)) {
            if (data[key] && Array.isArray(data[key])) {
                merged[key] = data[key];
            } else if (data[key] && typeof data[key] === 'object') {
                merged[key] = Object.assign({}, data[key]);
            } else if (data[key]) {
                merged[key] = data[key];
            }
        }
    }
    //Return
    return merged;
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/helpers/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Expose helpers
 */ const arrayToJSON = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/array-to-json.js [app-route] (ecmascript)");
const convertKeys = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/convert-keys.js [app-route] (ecmascript)");
const deepClone = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/deep-clone.js [app-route] (ecmascript)");
const mergeData = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/merge-data.js [app-route] (ecmascript)");
const splitNameEmail = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/split-name-email.js [app-route] (ecmascript)");
const toCamelCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-camel-case.js [app-route] (ecmascript)");
const toSnakeCase = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/to-snake-case.js [app-route] (ecmascript)");
const wrapSubstitutions = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/wrap-substitutions.js [app-route] (ecmascript)");
/**
 * Export
 */ module.exports = {
    arrayToJSON,
    convertKeys,
    deepClone,
    mergeData,
    splitNameEmail,
    toCamelCase,
    toSnakeCase,
    wrapSubstitutions
};
}),
"[project]/TMFG/node_modules/@sendgrid/helpers/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Load support assets
 */ const classes = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/classes/index.js [app-route] (ecmascript)");
const helpers = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/helpers/index.js [app-route] (ecmascript)");
/**
 * Export
 */ module.exports = {
    classes,
    helpers
};
}),
"[project]/TMFG/node_modules/deepmerge/dist/cjs.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
};
function isNonNullObject(value) {
    return !!value && typeof value === 'object';
}
function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
}
// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;
function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
}
function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
}
function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
}
function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function(element) {
        return cloneUnlessOtherwiseSpecified(element, options);
    });
}
function getMergeFunction(key, options) {
    if (!options.customMerge) {
        return deepmerge;
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
}
function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
        return Object.propertyIsEnumerable.call(target, symbol);
    }) : [];
}
function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}
function propertyIsOnObject(object, property) {
    try {
        return property in object;
    } catch (_) {
        return false;
    }
}
// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
     && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
     && Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
    ;
}
function mergeObject(target, source, options) {
    var destination = {};
    if (options.isMergeableObject(target)) {
        getKeys(target).forEach(function(key) {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
    }
    getKeys(source).forEach(function(key) {
        if (propertyIsUnsafe(target, key)) {
            return;
        }
        if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
            destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        } else {
            destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
    });
    return destination;
}
function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
    } else {
        return mergeObject(target, source, options);
    }
}
deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
        throw new Error('first argument should be an array');
    }
    return array.reduce(function(prev, next) {
        return deepmerge(prev, next, options);
    }, {});
};
var deepmerge_1 = deepmerge;
module.exports = deepmerge_1;
}),
"[project]/TMFG/node_modules/@sendgrid/mail/src/classes/mail-service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const { Client } = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/client/index.js [app-route] (ecmascript)");
const { classes: { Mail } } = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/helpers/index.js [app-route] (ecmascript)");
/**
 * Mail service class
 */ class MailService {
    /**
   * Constructor
   */ constructor(){
        // Set client, initialize substitution wrappers and secret rules filter.
        this.setClient(new Client());
        this.setSubstitutionWrappers('{{', '}}');
        this.secretRules = [];
    }
    /**
   * Set client
   */ setClient(client) {
        this.client = client;
        return this;
    }
    /**
   * SendGrid API key passthrough for convenience.
   */ setApiKey(apiKey) {
        this.client.setApiKey(apiKey);
        return this;
    }
    /**
   * Twilio Email Auth passthrough for convenience.
   */ setTwilioEmailAuth(username, password) {
        this.client.setTwilioEmailAuth(username, password);
    }
    /**
   * Set client timeout
   */ setTimeout(timeout) {
        if (typeof timeout === 'undefined') {
            return;
        }
        this.client.setDefaultRequest('timeout', timeout);
    }
    /**
   * Set substitution wrappers
   */ setSubstitutionWrappers(left, right) {
        if (typeof left === 'undefined' || typeof right === 'undefined') {
            throw new Error('Must provide both left and right side wrappers');
        }
        if (!Array.isArray(this.substitutionWrappers)) {
            this.substitutionWrappers = [];
        }
        this.substitutionWrappers[0] = left;
        this.substitutionWrappers[1] = right;
        return this;
    }
    /**
   * Set secret rules for filtering the e-mail content
   */ setSecretRules(rules) {
        if (!(rules instanceof Array)) {
            rules = [
                rules
            ];
        }
        const tmpRules = rules.map(function(rule) {
            const ruleType = typeof rule;
            if (ruleType === 'string') {
                return {
                    pattern: new RegExp(rule)
                };
            } else if (ruleType === 'object') {
                // normalize rule object
                if (rule instanceof RegExp) {
                    rule = {
                        pattern: rule
                    };
                } else if (rule.hasOwnProperty('pattern') && typeof rule.pattern === 'string') {
                    rule.pattern = new RegExp(rule.pattern);
                }
                try {
                    // test if rule.pattern is a valid regex
                    rule.pattern.test('');
                    return rule;
                } catch (err) {
                // continue regardless of error
                }
            }
        });
        this.secretRules = tmpRules.filter(function(val) {
            return val;
        });
    }
    /**
   * Check if the e-mail is safe to be sent
   */ filterSecrets(body) {
        if (typeof body === 'object' && !body.hasOwnProperty('content')) {
            return;
        }
        const self = this;
        body.content.forEach(function(data) {
            self.secretRules.forEach(function(rule) {
                if (rule.hasOwnProperty('pattern') && !rule.pattern.test(data.value)) {
                    return;
                }
                let message = `The pattern '${rule.pattern}'`;
                if (rule.name) {
                    message += `identified by '${rule.name}'`;
                }
                message += ' was found in the Mail content!';
                throw new Error(message);
            });
        });
    }
    /**
   * Send email
   */ send(data, isMultiple = false, cb) {
        //Callback as second parameter
        if (typeof isMultiple === 'function') {
            cb = isMultiple;
            isMultiple = false;
        }
        //Array? Send in parallel
        if (Array.isArray(data)) {
            //Create promise
            const promise = Promise.all(data.map((item)=>{
                return this.send(item, isMultiple);
            }));
            //Execute callback if provided
            if (cb) {
                promise.then((result)=>cb(null, result)).catch((error)=>cb(error, null));
            }
            //Return promise
            return promise;
        }
        //Send mail
        try {
            //Append multiple flag to data if not set
            if (typeof data.isMultiple === 'undefined') {
                data.isMultiple = isMultiple;
            }
            //Append global substitution wrappers if not set in data
            if (typeof data.substitutionWrappers === 'undefined') {
                data.substitutionWrappers = this.substitutionWrappers;
            }
            //Create Mail instance from data and get JSON body for request
            const mail = Mail.create(data);
            const body = mail.toJSON();
            //Filters the Mail body to avoid sensitive content leakage
            this.filterSecrets(body);
            //Create request
            const request = {
                method: 'POST',
                url: '/v3/mail/send',
                headers: mail.headers,
                body
            };
            //Send
            return this.client.request(request, cb);
        } catch (error) {
            //Pass to callback if provided
            if (cb) {
                // eslint-disable-next-line callback-return
                cb(error, null);
            }
            //Reject promise
            return Promise.reject(error);
        }
    }
    /**
   * Send multiple emails (shortcut)
   */ sendMultiple(data, cb) {
        return this.send(data, true, cb);
    }
}
//Export class
module.exports = MailService;
}),
"[project]/TMFG/node_modules/@sendgrid/mail/src/mail.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Dependencies
 */ const MailService = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/mail/src/classes/mail-service.js [app-route] (ecmascript)");
//Export singleton instance
module.exports = new MailService();
}),
"[project]/TMFG/node_modules/@sendgrid/mail/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const mailer = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/mail/src/mail.js [app-route] (ecmascript)");
const MailService = __turbopack_context__.r("[project]/TMFG/node_modules/@sendgrid/mail/src/classes/mail-service.js [app-route] (ecmascript)");
module.exports = mailer;
module.exports.MailService = MailService;
}),
];

//# sourceMappingURL=88044_c9722575._.js.map