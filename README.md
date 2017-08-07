# QuantaGame-Desktop

## Development

*You can find original development docs from [here](https://github.com/ngocdam-ibl/ETH-base-source/blob/master/README_ELECTRON.md)*

### React + Redux coding rules
1. Get data and process data must be done in Actions
2. Action function MUST have prefix "ac"
3. Reducer key MUST have prefix "rd"

[*React + Redux flow*](https://drive.google.com/drive/u/0/folders/0B4wnkSP1_xDFdGgwZ2c5NzF3Qkk)


### Config to allow Ethereum-js library to work with this app
*This changes has already been applied to code on develop branch*

**1. Change webpack.config.base.js file**
<pre>
...
...
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    },
    // Added by NGOC DAM - START
    {
      test: /\.node$/,
      use: 'node-loader'
    }
    // Added by NGOC DAM - END
    ]
  },
...
...
resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      path.join(__dirname, 'app'),
      'node_modules',
    ],
    // Added by NGOC DAM - START
    alias: {
      sha3: path.join(__dirname, 'node_modules/sha3/build/Release/sha3.node'),
      scrypt: path.join(__dirname, 'node_modules/scrypt/build/Release/scrypt.node'),
    },
    // Added by NGOC DAM - END
  },
  ...
</pre>

**2. Change postinstall command from pakage.json file**

CHANGE FROM:
<pre>
"postinstall": "concurrently \"npm run flow-typed\" \"npm run build-dll\" \"electron-builder install-app-deps\" \"node node_modules/fbjs-scripts/node/check-dev-engines.js package.json\"",
</pre>

TO:
<pre>
"postinstall": "./node_modules/.bin/electron-rebuild && concurrently \"npm run flow-typed\" \"npm run build-dll\" \"electron-builder install-app-deps\" \"node node_modules/fbjs-scripts/node/check-dev-engines.js package.json\"",
</pre>

**3. Execute command below**
<pre>
yarn add --dev node-loader electron-rebuild
</pre>