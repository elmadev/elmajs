const test = require('ava')
const Level = require('../src').Level
const Replay = require('../src').Replay

/* * * * * * * *
 * Level tests *
 * * * * * * * */
test('Valid level 1: load() returns instance of Level', t => {
  t.plan(11)

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
  }).catch(error => t.fail(error.Error))
})

test('Valid level 2: load() returns instance of Level', t => {
  t.plan(1)

  return Level.load('lev_valid_2.lev').then(result => {
    t.true(result instanceof Level)
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

test.todo('read level file')
test.todo('check all level attributes with 3+ levels')
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
