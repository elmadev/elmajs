const test = require('ava')
const Level = require('../src').Level
const Replay = require('../src').Replay

// Level test... test
test('Level load() static method returns instance of Level', t => {
  let level = Level.load()
  t.true(level instanceof Level)
})

// Replay test... test
test('Constructs replay class', t => {
  let replay = new Replay()
  t.true(replay instanceof Replay)
})

test.todo('read level file')
test.todo('read replay file')
