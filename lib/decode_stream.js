var Transform = require('stream').Transform,
    YencFile = require('./yencfile'),
    util = require('util'),
    YDS;

/**
 * A Yenc Decoder stream
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
YDS = function YencDecodeStream() {
	Transform.call(this, arguments);

	this.yencfile = new YencFile();

	this.on('pipe', function gotStream(stream) {
		stream.on('close', this.end.bind(this));
	});
};

util.inherits(YDS, Transform);

/**
 * Attempt to decode the given chunk
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
YDS.prototype._transform = function _transform(chunk, encoding, callback) {

	// Decode this chunk
	var result = this.yencfile.decodePiece(chunk.toString('binary'), true);

	if (result) {
		this.push(result);
	}

	callback(null);
};



module.exports = YDS;