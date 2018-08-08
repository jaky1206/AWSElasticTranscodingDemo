/*jslint node: true */
'use strict';

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Load credentials and set region from JSON file
AWS.config.loadFromPath('./config.json');

// Create S3 service object
var s3 = new AWS.S3();

// call S3 to retrieve upload file to specified bucket
var bucketName = 'entertechbdasia';
var uploadParams = {Bucket: bucketName, Key: '', Body: ''};
var file = 'big_buck_bunny_720p_1mb.mp4';

var fs = require('fs');
var fileStream = fs.createReadStream(file);
fileStream.on('error', function (err) {
    console.log('File Error', err);
});
uploadParams.Body = fileStream;

var path = require('path');
uploadParams.Key = path.basename(file);

// call S3 to retrieve upload file to specified bucket
s3.upload (uploadParams, function (err, data) {
    if (err) {
        console.log("Error", err);
    }
    if (data) {
        console.log(path.basename(file) + "Upload Success", data.Location);
    }
});


// call S3 to retrieve upload file to specified bucket
var key = path.basename(file);
var outputprefix = key.substring(0, key.lastIndexOf('.'));

var eltr = new AWS.ElasticTranscoder();
var pipelineId = '1508671575126-6qhig7';
var webPreset1 = '1351620000001-200010'; //HLS PRESET 2M
var webPreset2 = '1351620000001-200030'; //HLS PRESET 1M
var webPreset3 = '1510780553168-d0j9af'; // HLS CUSTOM 720P
var outputKey1 = outputprefix + '_hls_576p';
var outputKey2 = outputprefix + '_hls_480p';
var outputKey3 = outputprefix + '_hls_720p';

var params = {
    PipelineId: pipelineId,
    OutputKeyPrefix: outputprefix + '/',
    Input: {
        Key: key,
        FrameRate: 'auto',
        Resolution: 'auto',
        AspectRatio: 'auto',
        Interlaced: 'auto',
        Container: 'auto'
    },

    Outputs: [ 
        {
            Key: outputKey1,
            ThumbnailPattern: outputKey1 + '-thumbs-{count}',
            SegmentDuration: '1',
            PresetId: webPreset1,
            Rotate: 'auto'
        },
        {
            Key: outputKey2,
            ThumbnailPattern: outputKey2 + '-thumbs-{count}',
            SegmentDuration: '1',
            PresetId: webPreset2,
            Rotate: 'auto'
        },
        {
            Key: outputKey3,
            ThumbnailPattern: outputKey3 + '-thumbs-{count}',
            SegmentDuration: '1',
            PresetId: webPreset3,
            Rotate: 'auto'
        }
    ],

    Playlists: [
        {
            Name: outputprefix,
            Format: 'HLSv3',
            OutputKeys: [
                outputKey1,
                outputKey2,
                outputKey3
            ]
        }
    ]
};

eltr.createJob(params, function (err, data) {
    if (err) {
        console.log('Failed to send new video' + key + 'to ET');
        console.log(err);
        console.log(err.stack)
    } else {
        console.log('success');
        console.log(data);
    }
});