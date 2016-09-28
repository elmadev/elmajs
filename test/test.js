const test = require('ava')
const Level = require('../src').Level
const Replay = require('../src').Replay

/* * * * * * * *
 * Level tests *
 * * * * * * * */
test('Level load() static method returns instance of Level', t => {
  let level = Level.load()
  t.true(level instanceof Level)
})

test('Level save() method without modifications matches original level', t => {
  t.plan(1)
  let level = Level.load()
  t.true(level.save())
})

/* * * * * * * * *
 * Replay tests  *
 * * * * * * * * */
test('Replay load() static method returns instance of Replay', t => {
  let replay = Replay.load()
  t.true(replay instanceof Replay)
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
