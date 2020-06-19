![Release](https://github.com/elmadev/elmajs/workflows/Release/badge.svg) [![npm](https://img.shields.io/npm/v/elmajs)](https://www.npmjs.com/package/elmajs) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/elmajs) [![codecov](https://codecov.io/gh/elmadev/elmajs/branch/master/graph/badge.svg)](https://codecov.io/gh/elmadev/elmajs)


# elmajs
Elasto Mania NPM package for working with all main game files: levels, replays, LGRs and state.dat.

# Install
`npm install elmajs --save`

# Documentation and usage
See [https://elmadev.github.io/elmajs/](https://elmadev.github.io/elmajs/) for extended documentation.

## Opening and editing a level file in Node.js

```js
const fs = require('fs');
const { Level } = require('elmajs');

const fileBuffer = fs.readFileSync('C:/EOL/lev/groof89.lev');
const level = Level.from(fileBuffer);
level.name = 'rename level';
level.top10.single = []; // remove single player best times list
fs.writeFileSync('testlev.lev', level.toBuffer());
```

## Using UMD bundle in browser directly

```html
<head>
  <script src="https://unpkg.com/elmajs@1.0.2/umd/main.js"></script>
  <script>
    (async () => {
      const file = await fetch('https://eol.ams3.digitaloceanspaces.com/replays/vq0y3cwqfn/37Spef5269.rec');
      const buffer = await file.arrayBuffer();
      const rec = ElmaJS.Replay.from(buffer); // the UMD bundle adds a ElmaJS global variable with all functionality

      const info = document.getElementById('info');
      // returns whether ride in replay is finished (has a touch event as the final event)
      // and the time (if finished, exact same of event -- otherwise approximation based on frame count or a touch event)
      const { finished, time, reason } = rec.getTime();
      info.innerHTML = `${rec.level}: ${time}`; // QWQUU037.LEV: 52690
    })()
  </script>
</head>

<body>
  <div id="info"></div>
</body>
```

# Contribute
1.  Fork this project
2.  Enter the following:
```shell
git clone https://github.com/YOUR-NAME/elmajs.git
cd elmajs
yarn
```
3.  Create your changes.
4.  `yarn test` and make sure everything passes.
5.  Send a pull request!

Do not modify any of the tests unless you know there is a mistake, or you need to add a new test for a new feature, or if something is missing.

# Issues
If you spot any errors, make a new issue and write as many details as you can regarding the error.
