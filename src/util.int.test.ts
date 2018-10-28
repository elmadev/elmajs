import { formatTime, trimString } from './util'

describe('formatTime', () => {
  test('formats correctly', () => {
    expect(formatTime(114801)).toBe('19:08,01')
    expect(formatTime(10021)).toBe('01:40,21')
    expect(formatTime(10099)).toBe('01:40,99')
    expect(formatTime(590099)).toBe('1:38:20,99')
    expect(formatTime(1000)).toBe('00:10,00')
    expect(formatTime(60000)).toBe('10:00,00')
    expect(formatTime(0)).toBe('00:00,00')
    expect(formatTime(1922039)).toBe('5:20:20,39')
  })
})

describe('trimString', () => {
  test('trims correctly', () => {
    expect(
      trimString(Buffer.from('elma\x00this should be removed', 'ascii'))
    ).toBe('elma')

    expect(trimString(Buffer.from('\x00this should be removed', 'ascii'))).toBe(
      ''
    )

    expect(trimString(Buffer.from('elma', 'ascii'))).toBe('elma')
  })
})
