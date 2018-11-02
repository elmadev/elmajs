import { Level, Version } from '../src/lev'
import { Gravity, ObjectType } from '../src/lev/ElmaObject'
import { Clip } from '../src/lev/Picture'

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

    expect(level.objects.length).toBe(8)
    expect(level.objects[0].position.x).toBe(-23.221818747499896)
    expect(level.objects[0].position.y).toBe(1.3204453531268072)
    expect(level.objects[0].type).toBe(ObjectType.Killer)
    expect(level.objects[0].animation).toBe(1)
    expect(level.objects[1].position.y).toBe(0.3124543521844827)
    expect(level.objects[1].type).toBe(ObjectType.Apple)
    expect(level.objects[1].animation).toBe(9)
    expect(level.objects[1].gravity).toBe(Gravity.None)
    expect(level.objects[2].gravity).toBe(Gravity.Up)
    expect(level.objects[3].gravity).toBe(Gravity.Right)
    expect(level.objects[3].animation).toBe(5)
    expect(level.objects[4].position.y).toBe(-0.38243398140588436)
    expect(level.objects[4].gravity).toBe(Gravity.Left)
    expect(level.objects[6].position.x).toBe(-20.075620321380434)
    expect(level.objects[6].type).toBe(ObjectType.Exit)
    expect(level.objects[7].type).toBe(ObjectType.Start)

    expect(level.pictures.length).toBe(2)
    expect(level.pictures[0].name).toBe('barrel')
    expect(level.pictures[0].texture).toBe('')
    expect(level.pictures[0].mask).toBe('')
    expect(level.pictures[0].position.x).toBe(-19.37674118849727)
    expect(level.pictures[0].position.y).toBe(-0.895119783101471)
    expect(level.pictures[0].distance).toBe(380)
    expect(level.pictures[0].clip).toBe(Clip.Sky)
    expect(level.pictures[1].name).toBe('')
    expect(level.pictures[1].texture).toBe('stone1')
    expect(level.pictures[1].mask).toBe('maskbig')
    expect(level.pictures[1].position.x).toBe(-24.465394017511894)
    expect(level.pictures[1].position.y).toBe(3.964829547979911)
    expect(level.pictures[1].distance).toBe(750)
    expect(level.pictures[1].clip).toBe(Clip.Sky)

    expect(level.top10.single.length).toBe(10)
    expect(level.top10.single[0].name1).toBe('Rust')
    expect(level.top10.single[0].name2).toBe('Cargo')
    expect(level.top10.single[0].time).toBe(201)
    expect(level.top10.single[2].name1).toBe('Cargo')
    expect(level.top10.single[2].time).toBe(206)
    expect(level.top10.single[9].time).toBe(308)
  })
})
