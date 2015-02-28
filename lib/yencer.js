var YencFile = require('./yencfile'),
    YencDecodeStream = require('./decode_stream'),
    Yencer;

/**
 * The main class
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Yencer = function Yencer() {};

/**
 * Create a YencDecodeStream
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Yencer.decodeStream = function decodeStream() {
	return new YencDecodeStream();
};

Yencer.YencFile = YencFile;
module.exports = Yencer;