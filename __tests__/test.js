const test = require('ava')
const Level = require('../src').Level
const Replay = require('../src').Replay
const nullpadString = require('../src').util.nullpadString
const formatTime = require('../src').util.formatTime

/* * * * * * * *
 * Level tests *
 * * * * * * * */
test('Valid level 1: load() parses level correctly', t => {
  t.plan(68)

  return Level.load('test/assets/levels/lev_valid_1.lev').then(result => {
    t.true(result instanceof Level)
    t.is(result.version, 'Elma')
    t.is(result.link, 1524269776)
    t.is(result.integrity[0], -1148375.210607791)
    t.is(result.integrity[1], 1164056.210607791)
    t.is(result.integrity[2], 1162467.210607791)
    t.is(result.integrity[3], 1162283.210607791)
    t.is(result.name, 'Rust test')
    t.is(result.lgr, 'default')
    t.is(result.ground, 'ground')
    t.is(result.sky, 'sky')
    t.is(result.polygons.length, 2)
    t.false(result.polygons[0].grass)
    t.is(result.polygons[0].vertices[0].x, -23.993693053024586)
    t.is(result.polygons[0].vertices[1].y, -3.135779367971911)
    t.is(result.polygons[0].vertices[2].y, 1.995755366905195)
    t.is(result.polygons[0].vertices[2].x, -15.989070625361132)
    t.is(result.polygons[0].vertices[3].y, 2)
    t.true(result.polygons[1].grass)
    t.is(result.polygons[1].vertices[0].y, 2.310222676563402)
    t.is(result.polygons[1].vertices[1].x, -17.60428907951465)
    t.is(result.polygons[1].vertices[2].y, 1.8956975865594021)
    t.is(result.polygons[1].vertices[3].x, -23.96510511578293)
    t.is(result.polygons[1].vertices[3].y, 1.924285523801057)
    t.is(result.objects.length, 8)
    t.is(result.objects[0].x, -23.221818747499896)
    t.is(result.objects[0].y, -1.3204453531268072)
    t.is(result.objects[0].type, 'killer')
    t.is(result.objects[1].x, -20.37252715482359)
    t.is(result.objects[1].y, -0.3124543521844827)
    t.is(result.objects[1].type, 'apple')
    t.is(result.objects[1].animation, 9)
    t.is(result.objects[1].gravity, 'normal')
    t.is(result.objects[2].animation, 1)
    t.is(result.objects[2].gravity, 'up')
    t.is(result.objects[3].animation, 5)
    t.is(result.objects[3].gravity, 'right')
    t.is(result.objects[4].y, 0.38243398140588436)
    t.is(result.objects[4].gravity, 'left')
    t.is(result.objects[6].x, -20.075620321380434)
    t.is(result.objects[6].y, -1.2473950191969765)
    t.is(result.objects[6].type, 'exit')
    t.is(result.objects[7].type, 'start')
    t.is(result.pictures.length, 2)
    t.is(result.pictures[0].name, 'barrel')
    t.is(result.pictures[0].texture, '')
    t.is(result.pictures[0].mask, '')
    t.is(result.pictures[0].x, -19.37674118849727)
    t.is(result.pictures[0].y, 0.895119783101471)
    t.is(result.pictures[0].distance, 380)
    t.is(result.pictures[0].clip, 'sky')
    t.is(result.pictures[1].name, '')
    t.is(result.pictures[1].texture, 'stone1')
    t.is(result.pictures[1].mask, 'maskbig')
    t.is(result.pictures[1].x, -24.465394017511894)
    t.is(result.pictures[1].y, -3.964829547979911)
    t.is(result.pictures[1].distance, 750)
    t.is(result.pictures[1].clip, 'sky')
    t.is(result.top10.single.length, 10)
    t.is(result.top10.single[0].name1, 'Rust')
    t.is(result.top10.single[0].name2, 'Cargo')
    t.is(result.top10.single[0].time, 201)
    t.is(result.top10.single[2].name1, 'Cargo')
    t.is(result.top10.single[2].name2, 'Rust')
    t.is(result.top10.single[2].time, 206)
    t.is(result.top10.single[9].name1, 'Rust')
    t.is(result.top10.single[9].name2, 'Cargo')
    t.is(result.top10.single[9].time, 308)
  }).catch(error => t.fail(error.Error))
})

test('Valid level 2: load() parses level correctly', t => {
  t.plan(14)

  return Level.load('test/assets/levels/lev_valid_2.lev').then(result => {
    t.true(result instanceof Level)
    t.is(result.version, 'Elma')
    t.is(result.link, 1505288190)
    t.is(result.name, '')
    t.is(result.ground, 'brick')
    t.is(result.sky, 'ground')
    t.is(result.polygons.length, 5)
    t.false(result.polygons[0].grass)
    t.is(result.polygons[0].vertices.length, 4)
    t.is(result.polygons[0].vertices[0].x, 18.507991950076164)
    t.is(result.polygons[0].vertices[1].y, 17.978810742022475)
    t.is(result.objects.length, 17)
    t.is(result.pictures.length, 3)
    t.is(result.top10.single.length, 0)
  }).catch(error => t.fail(error.Error))
})

test('Across level: load() returns error', t => {
  t.plan(1)

  return Level.load('test/assets/levels/lev_across.lev').then(result => t.fail()).catch(error => t.pass(error))
})

test('Garbage invalid level: load() returns error', t => {
  t.plan(1)

  return Level.load('test/assets/levels/lev_invalid_1.lev').then(result => t.fail()).catch(error => t.pass(error))
})

test('Generate link returns a number at least', t => {
  t.plan(1)
  return Level.load('test/assets/levels/lev_valid_1.lev').then(result => {
    result.generateLink()
    t.true(typeof result.link === 'number')
  }).catch(error => t.fail(error))
})

test('Level toBuffer() returns buffer with valid data', t => {
  t.plan(11)
  return Level.load('test/assets/levels/lev_valid_1.lev').then(result => {
    return result.toBuffer().then(buffer => {
      t.is(buffer[0], 0x50)
      t.is(buffer[180], 0x0A)
      t.is(buffer[227], 0x8A)
      t.is(buffer[341], 0x00)
      t.is(buffer[768], 0x41)
      t.is(buffer[919], 0xAF)
      t.is(buffer[1017], 0x1D)
      t.is(buffer[1097], 0x90)
      t.is(buffer[1125], 0x21)
      t.is(buffer[1224], 0x38)
      t.is(buffer[1325], 0x00)
    }).catch(error => t.fail(error))
  }).catch(error => t.fail(error))
})

test('Level save() without argument returns error', t => {
  t.plan(1)
  return Level.load('test/assets/levels/lev_valid_1.lev').then(result => {
    return result.save().then(_ => {
      t.fail('Should not save')
    }).catch(error => t.pass(error))
  }).catch(error => t.fail(error))
})

test('Level save() method without modifications matches original level', t => {
  t.plan(1)
  return Level.load('test/assets/levels/lev_valid_1.lev').then(original => {
    return original.save('temp/save_lev_valid_1.lev').then(_ => {
      return Level.load('temp/save_lev_valid_1.lev').then(saved => {
        t.deepEqual(original, saved)
      }).catch(error => t.fail(error))
    }).catch(error => t.fail(error.Error))
  }).catch(error => t.fail(error))
})

test('Invalid clipping value gives error', t => {
  t.plan(1)
  return Level.load('test/assets/levels/invalid_clip.lev').then(level => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('Invalid gravity value gives error', t => {
  t.plan(1)
  return Level.load('test/assets/levels/invalid_grav.lev').then(level => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('Invalid object value gives error', t => {
  t.plan(1)
  return Level.load('test/assets/levels/invalid_obj.lev').then(level => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('Wrong end-of-data marker value gives error', t => {
  t.plan(1)
  return Level.load('test/assets/levels/missing_EOD.lev').then(level => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('Wrong end-of-file marker value gives error', t => {
  t.plan(1)
  return Level.load('test/assets/levels/missing_EOF.lev').then(level => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('Create a level and save it', t => {
  let level = new Level()
  level.objects.push({ x: 0, y: 0, type: 'apple', gravity: 'down', animation: 1 })
  level.pictures.push({ x: 10, y: 50, name: 'barrel', texture: '', mask: '', distance: 555, clip: 'unclipped' })
  level.pictures.push({ x: 10, y: 50, name: 'barrel', texture: '', mask: '', distance: 555, clip: 'ground' })
  level.pictures.push({ x: 10, y: 50, name: 'barrel', texture: '', mask: '', distance: 555, clip: 'sky' })
  return level.save('temp/save_lev_constructed.lev').then(_ => {
    t.pass('Saved')
  }).catch(error => t.fail(error))
})

test('Invalid object value gives error', t => {
  let level = new Level()
  level.objects.push({ x: 0, y: 0, type: 'notactuallyanobject', gravity: '', animation: 0 })
  return level.save('temp/save_lev_constructed_invalid_obj.lev').then(_ => {
    t.fail('Should not save')
  }).catch(error => t.pass(error))
})

test('Invalid gravity value gives error', t => {
  let level = new Level()
  level.objects.push({ x: 0, y: 0, type: 'apple', gravity: 'notvalid', animation: 0 })
  return level.save('temp/save_lev_constructed_invalid_grav.lev').then(_ => {
    t.fail('Should not save')
  }).catch(error => t.pass(error))
})

test('Invalid clip value gives error', t => {
  let level = new Level()
  level.pictures.push({ x: 1, y: 30, name: 'barrel', texture: '', mask: '', distance: 555, clip: 'notvalidclip' })
  return level.save('temp/save_lev_constructed_invalid_clip.lev').then(_ => {
    t.fail('Should not save')
  }).catch(error => t.pass(error))
})

test('Saving Across level gives error', t => {
  let level = new Level()
  level.version = 'Across'
  return level.save('temp/save_across_lev.lev').then(_ => {
    t.fail('Should not save')
  }).catch(error => t.pass(error))
})

/* * * * * * * * *
 * Replay tests  *
 * * * * * * * * */
test('Valid replay 1: load() parses replay correctly', t => {
  t.plan(15)

  return Replay.load('test/assets/replays/rec_valid_1.rec').then(result => {
    t.true(result instanceof Replay)
    t.false(result.multi)
    t.false(result.flagTag)
    t.is(result.link, 2549082363)
    t.is(result.level, 'tutor14.lev')
    t.is(result.frames[0].length, 440)
    // few random frames
    t.deepEqual(result.frames[0][0],
      {
        bike: { x: 34.3025016784668, y: -1.1253118515014648 },
        leftWheel: { x: -850, y: -524 },
        rightWheel: { x: 849, y: -524 },
        head: { x: 0, y: 439 },
        rotation: 10000,
        leftRotation: 250,
        rightRotation: 0,
        throttle: true,
        right: false,
        volume: 5120
      })
    t.deepEqual(result.frames[0][100],
      {
        bike: { x: 27.14251708984375, y: -1.1152113676071167 },
        leftWheel: { x: -903, y: -514 },
        rightWheel: { x: 586, y: -534 },
        head: { x: 74, y: 397 },
        rotation: 9826,
        leftRotation: 248,
        rightRotation: 238,
        throttle: true,
        right: false,
        volume: -5398
      })
    t.deepEqual(result.frames[0][201],
      {
        bike: { x: 11.071295738220215, y: 2.8753623962402344 },
        leftWheel: { x: -511, y: 917 },
        rightWheel: { x: -692, y: -789 },
        head: { x: 471, y: 10 },
        rotation: 7325,
        leftRotation: 25,
        rightRotation: 23,
        throttle: true,
        right: false,
        volume: -5398
      })
    t.deepEqual(result.frames[0][439],
      {
        bike: { x: -34.77971267700195, y: 11.52646541595459 },
        leftWheel: { x: -1050, y: -33 },
        rightWheel: { x: 286, y: -757 },
        head: { x: 226, y: 376 },
        rotation: 9047,
        leftRotation: 73,
        rightRotation: 163,
        throttle: true,
        right: false,
        volume: 5652
      })
    // some random events
    t.is(result.events[0].length, 24)
    t.deepEqual(result.events[0][0], { time: 1.57728480001688, info: -1, eventType: 'voltRight' })
    t.deepEqual(result.events[0][1], { time: 1.6974048000097273, info: -1, eventType: 'ground1' })
    t.deepEqual(result.events[0][11], { time: 3.9464880000114437, info: -1, eventType: 'voltLeft' })
    t.deepEqual(result.events[0][23], { time: 6.398683200001716, info: 3, eventType: 'touch' })
  }).catch(error => t.fail(error.Error))
})

test('Valid multi-replay 1: load() parses replay correctly', t => {
  // t.plan(1)

  return Replay.load('test/assets/replays/rec_valid_2.rec').then(result => {
    t.true(result instanceof Replay)
    t.true(result.multi)
    t.false(result.flagTag)
    t.is(result.link, 2549082363)
    t.is(result.level, 'tutor14.lev')
    t.is(result.frames[0].length, 440)
    t.deepEqual(result.frames[0][439],
      {
        bike: { x: -34.77971267700195, y: 11.52646541595459 },
        leftWheel: { x: -1050, y: -33 },
        rightWheel: { x: 286, y: -757 },
        head: { x: 226, y: 376 },
        rotation: 9047,
        leftRotation: 73,
        rightRotation: 163,
        throttle: true,
        right: false,
        volume: 5652
      })
    t.is(result.events[0].length, 24)
    t.is(result.frames[1].length, 441)
    t.is(result.frames[1][100].bike.x, 27.138593673706055)
    t.is(result.frames[1][0].bike.y, -1.1253118515014648)
    t.is(result.events[1].length, 23)
  }).catch(error => t.fail(error.Error))
})

test('Replay save() without argument returns error', t => {
  t.plan(1)
  return Replay.load('test/assets/replays/rec_valid_1.rec').then(result => {
    return result.save().then(_ => {
      t.fail('Should not save')
    }).catch(error => t.pass(error))
  }).catch(error => t.fail(error))
})

test('Replay save() method without modifications matches original replay', t => {
  return Replay.load('test/assets/replays/rec_valid_1.rec').then(original => {
    return original.save('temp/save_rec_valid_1.rec').then(_ => {
      return Replay.load('temp/save_rec_valid_1.rec').then(saved => {
        t.deepEqual(original, saved)
      }).catch(error => t.fail(error))
    }).catch(error => t.fail(error))
  }).catch(error => t.fail(error))
})

test('Replay save() method without modifications matches original multi-replay', t => {
  return Replay.load('test/assets/replays/rec_valid_2.rec').then(original => {
    return original.save('temp/save_rec_valid_2.rec').then(_ => {
      return Replay.load('temp/save_rec_valid_2.rec').then(saved => {
        t.deepEqual(original, saved)
      }).catch(error => t.fail(error))
    }).catch(error => t.fail(error))
  }).catch(error => t.fail(error))
})

test('Replay save() method without modifications matches original replay 2', t => {
  return Replay.load('test/assets/replays/rec_valid_3.rec').then(original => {
    return original.save('temp/save_rec_valid_3.rec').then(_ => {
      return Replay.load('temp/save_rec_valid_3.rec').then(saved => {
        t.deepEqual(original, saved)
      }).catch(error => t.fail(error))
    }).catch(error => t.fail(error))
  }).catch(error => t.fail(error))
})

test('Replay save() method gives error when unknown event type', t => {
  return Replay.load('test/assets/replays/rec_valid_3.rec').then(original => {
    original.events[0][2].eventType = 'totallynotvalidevent'
    return original.save('temp/save_rec_invalid_1.rec').then(_ => {
      t.fail('Should not save')
    }).catch(error => t.pass(error))
  }).catch(error => t.fail(error))
})

test('Missing end-of-replay marker gives error, single', t => {
  return Replay.load('test/assets/replays/missing_EOR_single.rec').then(result => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('Missing end-of-replay marker gives error, multi', t => {
  return Replay.load('test/assets/replays/missing_EOR_multi.rec').then(result => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('Invalid Replay event: load() gives error', t => {
  return Replay.load('test/assets/replays/invalid_event.rec').then(result => {
    t.fail('Should not load')
  }).catch(error => t.pass(error))
})

test('getTime, finished, single', t => {
  return Replay.load('test/assets/replays/rec_valid_1.rec').then(result => {
    t.deepEqual(result.getTime(), { time: 14649, finished: true, reason: undefined })
  }).catch(error => t.fail(error))
})

test('getTime, finished, multi', t => {
  return Replay.load('test/assets/replays/rec_valid_2.rec').then(result => {
    t.deepEqual(result.getTime(), { time: 14671, finished: true, reason: undefined })
  }).catch(error => t.fail(error))
})

test('getTime, unfinished, no event', t => {
  return Replay.load('test/assets/replays/unfinished.rec').then(result => {
    t.deepEqual(result.getTime(), { time: 533, finished: false, reason: 'framediff' })
  }).catch(error => t.fail(error))
})

test('getTime, unfinished, single, event', t => {
  return Replay.load('test/assets/replays/rec_valid_3.rec').then(result => {
    t.deepEqual(result.getTime(), { time: 4767, finished: false, reason: 'framediff' })
  }).catch(error => t.fail(error))
})

test('getTime, unfinished, multi, event', t => {
  return Replay.load('test/assets/replays/multi_event_unfinished.rec').then(result => {
    t.deepEqual(result.getTime(), { time: 1600, finished: false, reason: 'framediff' })
  }).catch(error => t.fail(error))
})

test('getTime, unfinished, multi, event 2', t => {
  return Replay.load('test/assets/replays/multi_event_unfinished_2.rec').then(result => {
    t.deepEqual(result.getTime(), { time: 3233, finished: false, reason: 'notouch' })
  }).catch(error => t.fail(error))
})

test('getTime, unfinished, single, event, framediff', t => {
  return Replay.load('test/assets/replays/event_unfinished.rec').then(result => {
    t.deepEqual(result.getTime(), { time: 8567, finished: false, reason: 'framediff' })
  }).catch(error => t.fail(error))
})

test('Replay toBuffer() returns buffer with valid data', t => {
  return Replay.load('test/assets/replays/rec_valid_1.rec').then(result => {
    return result.toBuffer().then(buffer => {
      t.is(buffer[0], 0xB8)
      t.is(buffer[178], 0x05)
      t.is(buffer[292], 0x4B)
      t.is(buffer[449], 0xA5)
      t.is(buffer[950], 0xCF)
      t.is(buffer[1110], 0xB1)
      t.is(buffer[1585], 0x80)
      t.is(buffer[1989], 0xE8)
      t.is(buffer[2383], 0x3F)
      t.is(buffer[2601], 0x05)
      t.is(buffer[3010], 0xB4)
    }).catch(error => t.fail(error))
  }).catch(error => t.fail(error))
})

/* * * * * * * *
 * Util tests  *
 * * * * * * * */
test('nullpadString, string length longer than padding', t => {
  t.is(nullpadString('teststring', 4), 'test')
})

test('nullpadString, non-ASCII string throws error', t => {
  const error = t.throws(() => {
    nullpadString('this is not ascii: ►', 4)
  }, Error)

  t.is(error.message, 'String contains non-ASCII values')
})

test('formatTime gives correct values', t => {
  t.is(formatTime(114801), '11:48,01')
  t.is(formatTime(10021), '01:00,21')
  t.is(formatTime(10099), '01:00,99')
  t.is(formatTime(590099), '59:00,99')
  t.is(formatTime(1000), '00:10,00')
  t.is(formatTime(0), '00:00,00')
  t.is(formatTime(1922039), '59:59,99')
})

test('formatTime, invalid time format throws error', t => {
  const error1 = t.throws(() => {
    formatTime(601039)
  }, Error)

  const error2 = t.throws(() => {
    formatTime(16039)
  }, Error)

  t.is(error1.message, 'Invalid time format')
  t.is(error2.message, 'Invalid time format')
})
