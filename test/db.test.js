// @flow
/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true, "allow": ["_db"] }] */

import Db from '../src/db'

declare var describe: any
declare var it: any
declare var expect: any
declare var beforeEach: any
declare var afterEach: any
declare var beforeAll: any
declare var afterAll: any

describe('Db', async () => {
  beforeAll(async () => {
    expect(Db._db).toBeUndefined()
    Db.getConnection()
    expect(Db._db).toBeDefined()
  })

  beforeEach(async () => {
    try {
      await Db.dropUnP2shTable()
    } catch (err) {
      if (err.message !== 'table "unp2sh" does not exist') {
        throw err
      }
    }
  })

  describe('getConnection', async () => {
    it('should create a new DB', async () => {
      // test that DB._db is working
      const data = await Db._db.one('SELECT $1 AS value', 123)
      expect(data.value).toBe(123)
    })
  })

  describe('createUnP2shTable', async () => {
    it.only('should create the UnP2sh table', async () => {
      await Db.createUnP2shTable()
      const data = await Db._db.none('SELECT * FROM UnP2sh;')
      expect(data).toBe(null)
    })

    it('should throw an error if table is created twice', async () => {
      await Db.createUnP2shTable()

      await expect(Db.createUnP2shTable()).rejects.toThrow(
        'relation "unp2sh" already exists'
      )
    })
  })

  describe('dropUnP2shTable', async () => {
    it('should drop the UnP2sh table', async () => {
      // querying UnP2sh should throw an error if it does not exist yet
      await expect(Db._db.none('SELECT * FROM UnP2sh;')).rejects.toThrow(
        'relation "unp2sh" does not exist'
      )

      // querying UnP2sh should work after it is created
      await Db.createUnP2shTable()
      const data = await Db._db.none('SELECT * FROM UnP2sh;')
      expect(data).toBe(null)

      // querying UnP2sh should throw an error after it has been dropped
      await Db.dropUnP2shTable()
      await expect(Db._db.none('SELECT * FROM UnP2sh;')).rejects.toThrow(
        'relation "unp2sh" does not exist'
      )
    })

    it('should throw an error if UnP2sh is dropped twice', async () => {
      await Db.createUnP2shTable()
      await Db.dropUnP2shTable()

      await expect(Db.dropUnP2shTable()).rejects.toThrow(
        'table "unp2sh" does not exist'
      )
    })
  })

  afterAll(async () => {
    Db._db.$pool.end()
  })
})
