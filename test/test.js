const test = require('ava')
const Level = require('../src').Level
const Replay = require('../src').Replay

/* * * * * * * *
 * Level tests *
 * * * * * * * */
test('Valid Level 1: load() returns instance of Level', t => {
  t.plan(1)

  return Level.load('lev_valid_1.lev').then(result => {
    t.true(result instanceof Level)
  }).catch(error => t.fail(error.Error))
})

test('Valid Level 2: load() returns instance of Level', t => {
  t.plan(1)

  return Level.load('lev_valid_2.lev').then(result => {
    t.true(result instanceof Level)
  }).catch(error => t.fail(error.Error))
})

test.skip('Level save() method without modifications matches original level', t => {
  t.plan(1)
  let level = Level.load()
  t.true(level.save())
})

/* * * * * * * * *
 * Replay tests  *
 * * * * * * * * */
test('Replay load() static method returns instance of Replay', t => {
  t.plan(1)

  return Replay.load('rec_valid_1.rec').then(result => {
    t.true(result instanceof Replay)
  }).catch(error => t.fail(error.Error))
})

/* * * * * * * *
 * Util tests  *
 * * * * * * * */

test.todo('read level file')
test.todo('read replay file')
test.todo('returns undefined for Across levels')
test.todo('returns undefined for Across replays')
test.todo('check all level attributes with 3+ levels')
test.todo('save level and check against original')
