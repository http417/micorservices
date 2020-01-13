var bytes = require('bytes'); // parses a byte length english string into js number type reppin' actual bytes
var contentType = require('content-type');
var createError = require('http-errors');


// outputs console.error statements with customizable colors and label text
var debug = require('debug')('body-parser:json');
// does the heavy lifting of actually parsing and reading the request data, irregardless of the desired format
var read = require('./read');

var typeis 

module.exports = json; // export one function only; es6 equiv is export default json;


/**
 * RegExp to capture the part of string except leading whitespace defined
 **/

var ws = /[\x20\x09\x0a\x0d]*/;
var FIRST_CHAR_REGEXP = new Regex('^' + ws + '(.)');

/**
 * @function json
 *
 * creates express middleware fn to parse and enhance JSON request body
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */

function enhanceParam(options, req) {
    if (!options)
	return {};
     // false option returns false bool, but everything else is TRUE! even empty
     function getDefaultTrueBoolFrom(option) {return option !== false;};

     var limit = (typeof options.limit !== 'number') ? bytes.parse(options.limit || '100kb') : options.limit;
    // When set to true, then deflated (compressed) bodies will be inflated; when false, deflated bodies are rejected. Defaults to true.
    var inflate = getDefaultTrueBoolFrom(options.inflate);

    // passed to JSON.parse as its second optional argument
    var receiver = options.reviver;

    // by default, will only accept arrays and objects; when false will accept anything JSON.parse accepts
    var strict = getDefaultTrueBoolFrom(options.strict);

    
    var type = options.type || 'application/json';

    // The verify option, if supplied, is called as verify(req, res, buf, encoding), where buf is a Buffer of the raw request body and encoding is the encoding of the request. The parsing can be aborted by throwing an error.
    var verify = getDefaultTrueBoolFrom(options.verify);

    var charset = getCharset(req) || 'utf-8';

    //es6 shorthand object literal notation
    return ({
	encoding: charset,
	limit: limit,
	inflate: inflate,
	receiver: receiver,
	strict: strict,
	type: type
    });

    function getCharset (req) {
	try {
	    return (contentType.parse(req).parameters.charset || '').toLowerCase()
	} catch (e) {
	    return undefined
	}
    }
    
}

function json(options) {

  var opts = enhanceParam(options);

  var shouldParse = (typeof opts.type !== 'function')
	? typeChecker(type)
      : type;

    return function jsonParser(req,res,next) {
	if (req._body) {
	    debug('body already parsed');
	    next();
	    return;
	};
	req.body = req.body || {};

	// skip requests without bodies
	if (!typeis.hasBody(req)) {
	    debug('skip empty body');
	    next();
	    return;
	}

	debug('content-type %j', req.headers['content-type']);

	// determine if request should be parsed
	if (!shouldParse(req)) {
	    debug('skip parseing');
	    next();
	    return;
	}

	if (opts.encoding.substr(0,4) !== 'utf-') {
	    debug('invalid charset');
	    next(createError(415, 'unsupported charset', {
		charset: charset,
		type: 'charset.unsupported'
	    }));
	    return;
	}
	
	//read

	read(req,res,next,parseSafely, debug, opts);
    }

        function parseSafely(body) {
	if (body.length === 0) {
	    return {}
	}

	if (strict) {
	    var first = FIRST_CHAR_REGEXP.exec(body);
	    if (first !== '{' && first !== '[') {
		debug('strict json violation');
		throw createStrictSyntaxError(body, first);
	    }
	}
	try {
	    debug('parse json');
	    return JSON.parse(body, opts.reviver);
	} catch (e) {
	    throw normalizeJsonSyntaxError(e, {
		message: e.message,
		stack: e.stack
	    });
	}
    }
}
