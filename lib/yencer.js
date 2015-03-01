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

/**
 * Decode an article
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   article
 *
 * @return   {YencFile}
 */
Yencer.decodeArticle = function decodeArticle(article) {

	var yf = new YencFile();

	if (Buffer.isBuffer(article)) {
		// @todo: don't do this
		article = article.toString('binary');
	}

	yf.decodePiece(article);

	return yf;
};

Yencer.YencFile = YencFile;
module.exports = Yencer;