# Yencer

Yencer encodes and decodes yEnc data

## Install

```bash
$ npm install yencer
```

## Todo

* yEnc encoding
* Multipart support
* Buffer/String issues

## Examples

### Get the Yencer class

```javascript
var Yencer = require('yencer');
```

### Decode a stream

Here I read out a usenet article stored to disk, including headers.
Yencer will take care of it.

```javascript
var fs = require('fs'),
    stream = Yencer.decodeStream();

// Stream the article file into the decoder
fs.createReadStream('/tmp/test.ntx').pipe(stream);

// Stream the decoder output into a new file
stream.pipe(fs.createWriteStream('/tmp/decoded-file'));
```

### Decode an article

Here I read out a usenet article stored to disk, including headers.
Yencer will take care of it.

```javascript

// Get the buffer to the file
var buffer = fs.readFileSync('/tmp/test.ntx');

// Decode the buffer, which returns a YencFile object
var result = Yencer.decodeArticle(buffer);

// Inspect the object
console.log(result);

    // { buffer: <Buffer ff d8 ff 64 ... >, // The thing you want
    //   info:                              // Info from the yEnc headers
    //    { part: 1,
    //      total: '1',
    //      line: 128,
    //      filesize: 315836,
    //      name: '1024x768_1283625878864.jpg',
    //      begin: 1,
    //      end: 315836,
    //      partsize: 315836,
    //      pcrc32: '72182d81' },
    //   ybegin: true,               // If there was a ybegin line
    //   ypart: true,                // If there was a ypart line
    //   yend: true,                 // If there was a yend line
    //   intact: true,               // If the checksums matched
    //   checksum: '72182d81',       // The decoded checksum
    //   index: 315836,              // Last written index
    //   size: 315836 }              // Supposed filesize
```