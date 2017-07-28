# os²
Open Stack Object Storage wrapper for Node.js 
---------------------------------------------

os² is build for use against [OpenStack Object Storage API v1](https://developer.openstack.org/api-ref/object-storage/index.html)and uses the same concepts and hierarchy relations as exposed by this v1.


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
const { Store, Account, Container, Segment, DynamicLargeObject, StaticLargeObject } = require('os2');
```

## Store
A Store instance represents the Object Storage REST service. It defined by a URL of where the service is hosted.

## Account
## Container
## Segment
## DLO
## SLO
## Error