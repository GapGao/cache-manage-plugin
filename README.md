# cache-manage-plugin

A Webpack plugin used to manage multiply cache Directory.

Manage different code caches based on the hash.


## Usage

1. Install dependency.

`npm install --save-dev @mokahr/cache-manage-plugin`

2. Update webpack config file.

```js
const CacheManage = require('@mokahr/cache-manage-plugin');

const someHash = createHash();
// your webpack config
module.exports = {
  module: {
    rules: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: `node_modules/.cache/babel-loader/${someHash}`,
        },
      },
    ]
  }
  ...
  plugins: [
    ...
    new CacheManage({    // use
      cacheHash: someHash, 
      dependencyCachePaths: [`node_modules/.cache/babel-loader/${someHash}`],
    }), 
  ]
}
```

## Configuration

```js
new CacheManage(options)
```

### [optional] options.cacheRecordPath: string

cache directory, default value is `node_modules/.cache`

### [required] options.cacheHash: string

cacheHash mast  provide;

### [optional] options.maxAge: number

cache max age,  default value is `1 * 24 * 60 * 60 * 1000` one day

### [optional] options.dependencyCachePaths: 

need to manage cache's cacheDirectory list, default value is `[]` 

