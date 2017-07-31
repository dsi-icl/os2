const request = require('request');
const MemoryStream = require('memorystream');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const DynamicLargeObject = require('./dlo.js');
const Segment = require('./segment.js');

/**
 * @class StaticLargeObject
 * @param container {Container} Container the segment is stored into
 * @param name {String} Name of this segment
 * @constructor
 */
function StaticLargeObject(container, name) {
    //Call super constructor
    DynamicLargeObject.call(this, container, name, '');

    //Bind member functions and overloads
    this.createManifest = StaticLargeObject.prototype.createManifest.bind(this);
    this.createFromStreams = StaticLargeObject.prototype.createFromStreams.bind(this);
    this.getContentStream = StaticLargeObject.prototype.getContentStream.bind(this);
    this.deleteWithContent = StaticLargeObject.prototype.deleteWithContent.bind(this);
}

StaticLargeObject.prototype = Object.create(DynamicLargeObject.prototype); //Inherit js Style
StaticLargeObject.prototype.constructor = DynamicLargeObject;

/**
 * @fn createManifest
 * @desc creates or updates this SLO manifest
 * @param manifestContent {Array} json list, where each element is an object representing a segment.
 * These objects may contain the following attributes:
 * path (required). The container and object name in the format: {container-name}/{object-name}
 * etag (optional). If provided, this value must match the ETag of the segment object. This was included in the response headers when the segment was created. Generally, this will be the MD5 sum of the segment.
 * size_bytes (optional). The size of the segment object. If provided, this value must match the Content-Length of that object.
 * range (optional). The subset of the referenced object that should be used for segment data. This behaves similar to the Range header. If omitted, the entire object will be used.
 * Providing the optional etag and size_bytes attributes for each segment ensures that the upload cannot corrupt your data.
 * @return {Promise} Resolves to true on success, reject a js native Error otherwise
 */
StaticLargeObject.prototype.createManifest = function(manifestContent = null) {
    let _this = this;
    const manifest_url_param = '?multipart-manifest=put';

    return new Promise(function(resolve, reject) {
        if (manifestContent === undefined || manifestContent === null) {
            reject(new Error('Create StaticLargeObject needs a manifest body'));
            return;
        }
        let options = {
            method: 'PUT',
            baseUrl: _this._container.getAccount().getStorageUrl(),
            uri: _this._container.getName() + '/' + _this._name + manifest_url_param,
            json: true,
            headers: {
                'X-Auth-Token': _this._container.getAccount().getToken()
            },
            body: manifestContent
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
 * @fn createFromStreams
 * @desc Create a SLO from multiple data streams, where each stream is stored as a segment
 * The created SLO contains the concatenated content of the streams, ordered as received
 * @param streams {Array} An array of streams to get the data from
 * @return {Promise} Resolves a map of segments:status on success or reject a js Error type
 */
StaticLargeObject.prototype.createFromStreams = function(streams) {
    let _this = this;
    let segments = [];
    let segmentsPromises = [];
    let manifest = [];
    return new Promise(function(resolve, reject) {
        // Create one segment per read stream. Generates {prefix/uuidv4} names
        for (let stream_idx = 0; stream_idx < streams.length; stream_idx++) {
            let stream = streams[stream_idx];
            let segment_name = ("000000000" + stream_idx).slice(-9) + '_' + uuidv4();
            let segment = new Segment(_this._container, segment_name);
            segments.push(segment);
            segmentsPromises.push(segment.createFromStream(stream));
            manifest.push({
                path: _this._container.getName() + '/' + segment_name
            });
        }
        // Asynchronous execution of all segments creation
        Promise.all(segmentsPromises).then(function(ok_array) {
            let result = {};
            segments.forEach(function (s, idx) {
                result[s.getName()] = ok_array[idx];
            });
            _this.createManifest(manifest).then(function(__unused__ok) {
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
 * @fn getContentStream
 * @desc Get this SLO content or its manifest content.
 * @param manifest {Boolean} Set to true to get the manifest, false for the content. defaults to false
 * @return {Promise} Resolve to a ReadableStream on success or reject a js Error
 */
StaticLargeObject.prototype.getContentStream = function(manifest = false) {
    let _this = this;
    const manifest_url_param = '?multipart-manifest=get';

    if (manifest === false) { // Get content from DLO implementation
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
                    stream.end();
                });
                resolve(stream);
            })
            .on('error', function(error) {
                reject(error);
            });
    });
};

/**
 * @fn deleteWithContent
 * @desc Delete this static large object and its segments
 * @return {Promise} Resolves to true on success, rejects a Native Js Error on error
 */
StaticLargeObject.prototype.deleteWithContent = function() {
    let _this = this;
    const manifest_url_param = '?multipart-manifest=delete';

    return new Promise(function(resolve, reject) {
        let options = {
            method: 'DELETE',
            baseUrl: _this._container.getAccount().getStorageUrl(),
            uri: _this._container.getName() + '/' + _this._name + manifest_url_param,
            headers: {
                'X-Auth-Token': _this._container.getAccount().getToken()
            }
        };
        request(options, function(error, response, __unused__body) {
            if (error) {
                reject(error);
                return;
            }
            if (response.statusCode !== 200) {
                reject(response.statusMessage);
                return;
            }
            resolve(true);
        });
    });
};

module.exports = StaticLargeObject;
