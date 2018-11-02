import { Level, Version } from '../src/lev'

describe('Level', () => {
  test('parses valid level #1', async () => {
    const level = await Level.load('__tests__/assets/levels/lev_valid_1.lev')
    expect(level).toBeInstanceOf(Level)
    expect(level.version).toBe(Version.Elma)
    expect(level.link).toBe(1524269776)
    expect(level.integrity).toEqual([
      -1148375.210607791,
      1164056.210607791,
      1162467.210607791,
      1162283.210607791,
    ])
    expect(level.name).toBe('Rust test')
    expect(level.lgr).toBe('default')
    expect(level.ground).toBe('ground')
    expect(level.sky).toBe('sky')

    expect(level.polygons.length).toBe(2)
    expect(level.polygons[0].grass).toBeFalsy()
    expect(level.polygons[0].vertices[0].x).toBe(-23.993693053024586)
    expect(level.polygons[0].vertices[1].y).toBe(3.135779367971911)
    expect(level.polygons[0].vertices[2].x).toBe(-15.989070625361132)
    expect(level.polygons[0].vertices[3].y).toBe(-2)
    expect(level.polygons[1].grass).toBeTruthy()
    expect(level.polygons[1].vertices[0].y).toBe(-2.310222676563402)
    expect(level.polygons[1].vertices[1].x).toBe(-17.60428907951465)
    expect(level.polygons[1].vertices[2].y).toBe(-1.8956975865594021)
    expect(level.polygons[1].vertices[3].y).toBe(-1.924285523801057)
  })
})
