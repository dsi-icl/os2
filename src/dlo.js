const request = require('request');
const MemoryStream = require('memorystream');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const Segment = require('./segment.js');


/**
 * @class DynamicLargeObject
 * @param container {Container} Container the segment is stored into
 * @param name {String} Name of this segment
 * @param prefix {String} Prefix is a string that all segment objects have in common
 * @constructor
 */
function DynamicLargeObject(container, name, prefix = 'default') {
    //Call supper constructor
    Segment.call(this, container, name);

    //Init member attributes
    this._prefix = prefix;

    this.createManifest = DynamicLargeObject.prototype.createManifest.bind(this);
    this.createFromDisk = DynamicLargeObject.prototype.createFromDisk.bind(this);
    this.createFromStream = DynamicLargeObject.prototype.createFromStream.bind(this);
    this.createFromStreams = DynamicLargeObject.prototype.createFromStreams.bind(this);
    this.getContentStream = DynamicLargeObject.prototype.getContentStream.bind(this);
    this.getPrefix = DynamicLargeObject.prototype.getPrefix.bind(this);
    this.setPrefix = DynamicLargeObject.prototype.setPrefix.bind(this);
}

DynamicLargeObject.prototype = Object.create(Segment.prototype); //Inherit js Style
DynamicLargeObject.prototype.constructor = DynamicLargeObject;

/**
 * @fn createManifest
 * @desc creates or updates this DLO manifest
 * @return {Promise} Resolves to true on success, reject a js native Error otherwise
 */
DynamicLargeObject.prototype.createManifest = function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
        // Create a DLO in the object storage using the container/prefix urlencoded header
        let object_manifest =  encodeURIComponent(_this._container.getName());
        object_manifest += '/' + encodeURIComponent(_this._prefix);

        let options = {
            method: 'PUT',
            baseUrl: _this._container.getAccount().getStorageUrl(),
            uri: _this._container.getName() + '/' + _this._name,
            headers: {
                'X-Auth-Token': _this._container.getAccount().getToken(),
                'X-Object-Manifest': object_manifest
            }
        };
        request(options, function(error, response, __unused__body) {
            if (error) {
                reject(error);
                return;
            }
            if (response.statusCode !== 201) {
                reject(new Error(response.statusMessage));
                return;
            }
            resolve(true);
        });

    });
};

/**
 * @fn createFromDisk
 * @desc Create a dlo from a file on disk. The file gets split in segments if needed
 * @param path {String} Path of the file on the disk
 * @param chunkSize Optional maximum size of the generated segments
 * @return {Promise} Resolves to a map of segments:status on success or reject a js Error type
 */
const fiveGigs = 1024 * 1024 * 1024 * 5;
DynamicLargeObject.prototype.createFromDisk = function(path, chunkSize = fiveGigs) {
    let _this = this;
    if (chunkSize > fiveGigs) //Max to 5Go
        chunkSize = fiveGigs;
    return new Promise(function(resolve, reject) {
        fs.stat(path, function(error, stats) {
            if (error) {
                reject(error);
                return;
            }

            let streams = [];
            let end = 0;

            // Generate read streams of 5Go chunks in the file
            for (let start = 0; end < (stats.size - 1); start += chunkSize) {
                end = start + chunkSize - 1;
                if (end >= stats.size)
                    end = stats.size - 1;
                streams.push(fs.createReadStream(path, {start: start, end: end}));
            }

            //Create from multiple streams
            _this.createFromStreams(streams).then(function(ok) {
                resolve(ok);
            }, function(error) {
                reject(error);
            })
        });
    });
};

/**
 * @fn createFromStreams
 * @desc Create a DLO from multiple data streams, where each stream is stored as a segment
 * The created DLO contains the concatenated content of the streams, ordered as received
 * @param streams {Array} An array of streams to get the data from
 * @return {Promise} Resolves a map of segments:status on success or reject a js Error type
 */
DynamicLargeObject.prototype.createFromStreams = function(streams) {
    let _this = this;
    let segments = [];
    let segmentsPromises = [];

    return new Promise(function(resolve, reject) {
        // Create one segment per read stream. Generates {prefix/uuidv4} names
        for (let stream_idx = 0; stream_idx < streams.length; stream_idx++) {
            let stream = streams[stream_idx];
            let segment_name = ("000000000" + stream_idx).slice(-9) + '_' + uuidv4();
            let segment = new Segment(_this._container, _this._prefix + '/' + segment_name);
            segments.push(segment);
            segmentsPromises.push(segment.createFromStream(stream));
        }
        // Asynchronous execution of all segments creation
        Promise.all(segmentsPromises).then(function(ok_array) {
            let result = {};
            segments.forEach(function (s, idx) {
                result[s.getName()] = ok_array[idx];
            });
            _this.createManifest().then(function(__unused__ok) {
                resolve(result);
            }, function(error) {
               reject(error);
            });
        }, function(error) {
            reject(error);
        });
    });
};

/**
 * @fn createFromStream
 * @desc Overload Segment interface to create a a DLO from a single stream.
 * It is not possible to store more than 5Go with this method
 * @see createFromStreams
 * @param stream {Readable} A stream to retrieve the content
 */
DynamicLargeObject.prototype.createFromStream = function(stream) {
    return this.createFromStreams([stream]);
};

/**
 * @fn getContentStream
 * @desc Get this DLO content or its manifest content.
 * @param manifest {Boolean} Set to true to get the manifest, false for the content. defaults to false
 * @return {Promise} Resolve to a ReadableStream on success or reject a js Error
 */
DynamicLargeObject.prototype.getContentStream = function(manifest = false) {
    let _this = this;
    const manifest_url_param = '?multipart-manifest=get';

    if (manifest === false) { // Get content from Segment implementation
        return Segment.prototype.getContentStream.call(this);
    }
    return new Promise(function(resolve, reject) {
        let options = {
            method: 'GET',
            baseUrl: _this._container.getAccount().getStorageUrl(),
            uri: _this._container.getName() + '/' + _this._name + manifest_url_param,
            headers: {
                'X-Auth-Token': _this._container.getAccount().getToken()
            }
        };
        request(options)
            .on('response', function(response) {
                if (response.statusCode !== 200) {
                    reject(new Error(response.statusMessage));
                    return;
                }
                let stream = new MemoryStream([]);
                response.on('data', function(data) {
                    stream.write(data);
                });
                response.on('end', function() {
                    stream.end(response.headers['x-object-manifest']);
                });
                resolve(stream);
            })
            .on('error', function(error) {
                reject(error);
            });
    });
};

/**
 * @fn getPrefix
 * @desc Getter on this DLO segments prefix
 * @return {String} Assigned segments prefix
 */
DynamicLargeObject.prototype.getPrefix = function() {
    return this._prefix;
};

/**
 * @fn setPrefix
 * @desc Setter on DLO segments prefix
 * @return {String} Assigned segments prefix
 */
DynamicLargeObject.prototype.setPrefix = function(prefix) {
    this._prefix = prefix;
    return this._prefix;
};

module.exports = DynamicLargeObject;
