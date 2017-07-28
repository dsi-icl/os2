# os²
OpenStack Object Storage wrapper for Node.js 
---------------------------------------------

os² is a wrapper for the [OpenStack Object Storage API v1](https://developer.openstack.org/api-ref/object-storage/index.html).
Use it to communicate with an Object Storage via it's REST api without managing the HTTP requests.

## Features
  * Abstractions to write and read data from an Object Storage using Node.js streams. 
  * Authentication to the OpenStack Object Storage using the [TempAuth](https://docs.openstack.org/swift/latest/overview_auth.html#temp-auth) method. (No production, contributions are welcome)
  * Asynchronous communication using ES6 Promise
  
## Quick reference
1. [Store](#Store)
2. [Account](#Account)
3. [Container](#Contrainer)
4. [Segment](#Segment)
5. [Dynamic Large Object](#DLO)
6. [Static Large Object](#SLO)
7. [Error handling](#Error)

## Getting started

### Installation
Installing globally from the npm package manager:
```bash
npm install os2 --global
```

Or add os² as a dependency to a node.js project using the `package.json` file:
```json
"dependencies": {
  "os2": "1.0.0"
}
```
and then update the project's dependencies
```bash
npm install
```

### Import
Import os² components as any Node.js package. For example,
all os² components at once :
```javascript
const os2 = require('os2');
```
Or, to import os² components separately:
```javascript
// pick only what you need, lol
const { Store, Account, Container, Segment, DynamicLargeObject, StaticLargeObject } = require('os2');
```

## Store
A Store instance represents the Object Storage API service. It defined by a URL of where the service is hosted.

## Account
## Container
## Segment
## DLO
## SLO
## Error
When an operation on the Object Storage API timeouts or the HTTP status code indicates an error, the Promise will `reject` a native javascript `Error` containing an error message.
```javascript
let account = new Account(example_store, username, password);
account.connect().then(function() {
  ...
}, function (error) {
console.error(error.toString());
});
```
