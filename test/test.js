const test = require('ava')
const Level = require('../src').Level
const Replay = require('../src').Replay

/* * * * * * * *
 * Level tests *
 * * * * * * * */
test('Valid level 1: load() parses level correctly', t => {
  t.plan(68)

  return Level.load('lev_valid_1.lev').then(result => {
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
    t.is(result.polygons[0].grass, false)
    t.is(result.polygons[0].vertices[0].x, -23.993693053024586)
    t.is(result.polygons[0].vertices[1].y, -3.135779367971911)
    t.is(result.polygons[0].vertices[2].y, 1.995755366905195)
    t.is(result.polygons[0].vertices[2].x, -15.989070625361132)
    t.is(result.polygons[0].vertices[3].y, 2)
    t.is(result.polygons[1].grass, true)
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

  return Level.load('lev_valid_2.lev').then(result => {
    t.true(result instanceof Level)
    t.is(result.version, 'Elma')
    t.is(result.link, 1505288190)
    t.is(result.name, '')
    t.is(result.ground, 'brick')
    t.is(result.sky, 'ground')
    t.is(result.polygons.length, 5)
    t.is(result.polygons[0].grass, false)
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

  return Level.load('lev_across.lev').then(result => t.fail()).catch(error => t.pass(error))
})

test('Garbage invalid level: load() returns error', t => {
  t.plan(1)

  return Level.load('lev_invalid_1.lev').then(result => t.fail()).catch(error => t.pass(error))
})

test.skip('Level save() method without modifications matches original level', t => {
  t.plan(1)
  let level = Level.load()
  t.true(level.save())
})

test.todo('save level and check against original')

/* * * * * * * * *
 * Replay tests  *
 * * * * * * * * */
test('Replay load() static method returns instance of Replay', t => {
  t.plan(1)

  return Replay.load('rec_valid_1.rec').then(result => {
    t.true(result instanceof Replay)
  }).catch(error => t.fail(error.Error))
})

test.todo('read replay file')
test.todo('reject Across replays')
test.todo('check all replay attributes with 3+ replays')
test.todo('save replay and check against original')

/* * * * * * * *
 * Util tests  *
 * * * * * * * */
