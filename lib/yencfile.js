var SlowBuffer = require('buffer').SlowBuffer,
    crc32 = require('buffer-crc32'),
    YencFile;

/**
 * The YencFile class
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   segment   NZB segment information
 */
YencFile = function YencFile(segment) {

	// Does the next char have to be escaped?
	this.escaped = false;

	// The resulting buffer
	this.buffer = null;

	// Information on this yenc file
	this.info = {};

	// ybegin & yend flags
	this.ybegin = null;
	this.ypart = null;
	this.yend = null;

	// Have we begun received yenced data?
	this.ydata = false;

	// Does the crc check validate?
	this.intact = null;

	// The checksum of the finished buffer
	this.checksum = null;

	// At what index we're currently in the buffer
	this.index = 0;

	if (segment) {

		// Set the expected size of the *article*
		this.articlesize = segment.bytes;

		// Save the part number
		this.info.part = segment.number;
	}
};

/**
 * Decode a line containing "=" info
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.1
 *
 * @param    {String}   line
 *
 * @return   {Object}
 */
YencFile.prototype.decodeInfo = function decodeInfo(line) {

	var result = {},
	    info = {},
	    temp,
	    type,
	    key,
	    val,
	    i;

	// Prepare line for more info
	line = line.trim().split('=');

	for (i = 0; i < line.length; i++) {

		if (i+1 == line.length && key) {
			info[key] = line[i].trim();
			break;
		}

		temp = line[i].split(' ');

		if (key) {
			info[key] = temp[0];
		} else {
			type = temp[0];
		}

		key = temp[1];
	}

	for (key in info) {
		val = info[key];

		switch (key) {

			case 'size':
				if (type == 'ybegin') {
					key = 'filesize';
				} else if (type == 'yend') {
					key = 'partsize';
				}

			case 'part':
			case 'line':
			case 'end':
			case 'begin':
				val = Number(val);
				break;

			case 'pcrc32':
				val = parseInt(val, 16).toString(16);
				break;
		}

		result[key] = val;
	}

	return result;
};

/**
 * Decode a piece of text
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.1
 *
 * @param    {String}   piece
 * @param    {Boolean}  returnNewData
 */
YencFile.prototype.decodePiece = function decodePiece(piece, returnNewData) {

	var startIndex,
	    stopIndex,
	    oldIndex,
	    lines,
	    line,
	    temp,
	    key,
	    i;

	// Split the lines
	lines = piece.split('\n');

	// Store the current index
	oldIndex = this.index;

	// Look for the start headers
	startIndex = this.parseBegin(lines);

	// Look for the end headers
	stopIndex = this.parseEnd(lines);

	if (startIndex == null) {
		return;
	}

	// Create the buffer where the bytes will go
	if (!this.buffer) {
		this.buffer = new SlowBuffer(this.size);
	}

	// Go over every line
	for (i = startIndex; i < stopIndex; i++) {
		this.toBytes(lines[i]);
	}

	if (this.yend) {

		// Calculate the checksum
		this.checksum = crc32.unsigned(this.buffer).toString(16);

		// Compare the checksum if one was set in the pieces
		if (this.info.pcrc32) {
			this.intact = this.checksum == this.info.pcrc32;
		}
	}

	lines = null;
	piece = null;

	if (returnNewData && oldIndex != this.index) {
		return this.buffer.slice(oldIndex, this.index);
	}
};

/**
 * Look for ybegin headers
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Array}   lines
 *
 * @return   {Number}  line number that should be used next
 */
YencFile.prototype.parseBegin = function parseBegin(lines) {

	var startIndex,
	    line,
	    temp,
	    key,
	    i;

	if (this.ybegin != null && this.ypart != null) {
		return 0;
	}

	for (i = 0; i < lines.length; i++) {
		line = lines[i];

		if (this.ybegin == null || this.ybegin && this.ypart == null) {

			// Skip junk lines at the start of the body
			if (!this.ybegin && line.indexOf('=ybegin') !== 0) {
				continue;
			}

			// If there is a ypart info line it should be right after ybegin
			if (this.ybegin && line.indexOf('=ypart') == -1) {
				this.ypart = false;
				i--;
				break;
			}

			if (this.ybegin) {
				this.ypart = true;
			}

			// Indicate we found ybegin
			this.ybegin = true;

			temp = this.decodeInfo(line);

			for (key in temp) {
				this.info[key] = temp[key];
			}

			if (this.ypart) break;
		}
	}

	i++;

	if (this.ybegin != null && this.ypart != null) {
		// Get the index of the starting line of this piece
		startIndex = i;

		// Store the size of this filepiece
		this.size = 1 + this.info.end - this.info.begin;

		if (!this.size) {
			this.size = this.info.partsize || this.info.filesize;
		}
	} else {
		startIndex = null;
	}

	return startIndex;
};

/**
 * Look for yend headers
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Array}   lines
 *
 * @return   {Number}  line number that should be used next
 */
YencFile.prototype.parseEnd = function parseEnd(lines) {

	var stopIndex,
	    line,
	    temp,
	    key,
	    i;

	// Get the bottom line info
	for (i = lines.length-1; i > 0; i--) {

		if (lines[i].indexOf('=yend') != 0) {
			continue;
		}

		temp = this.decodeInfo(lines[i]);

		for (key in temp) {
			this.info[key] = temp[key];
		}

		this.yend = true;
		stopIndex = i;
		break;
	}

	// Return the index of the stopping line (exclusive)
	if (stopIndex == null) {
		return lines.length;
	} else {
		return stopIndex;
	}
};

/**
 * Decode a yenc string and store it in the buffer
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   input
 */
YencFile.prototype.toBytes = function toBytes(input) {

	var code,
	    len,
	    i;

	len = input.length;

	for (i = 0; i < len; i++) {
		code = String.prototype.charCodeAt.call(input, i);

		// Skip newlines
		if (code == 10 || code == 13) {
			continue;
		}

		// Look for escape chars
		if (code == 61 && !this.escaped) {
			this.escaped = true;
			continue;
		}

		// Special escape handling
		if (this.escaped) {
			code -= 64;
			this.escaped = false;
		}

		if (code < 42 && code > 0) {
			code += 214;
		} else {
			code -= 42;
		}

		this.buffer[this.index++] = code;
	}
};

module.exports = YencFile;