import {
  describe,
  test,
  expect,
  jest
} from '@jest/globals'
import Routes from '../../src/routes'
import fs from 'fs'
import FileHelper from '../../src/fileHelper'

describe('#FileHelper', () => {
  describe('#getFileStatus', () => {
    test('it should return files status in correct format', async () => {
      const statMock = {
        dev: 2053,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 278825,
        size: 2969771,
        blocks: 5808,
        atimeMs: 1630985847401.105,
        mtimeMs: 1630985841628.831,
        ctimeMs: 1630985841672.8333,
        birthtimeMs: 1630985841624.8308,
        atime: '2021 - 09 - 07T03: 37: 27.401Z',
        mtime: '2021 - 09 - 07T03: 37: 21.629Z',
        ctime: '2021 - 09 - 07T03: 37: 21.673Z',
        birthtime: '2021 - 09 - 07T03: 37: 21.625Z'
      }
      const mockUser = 'lopes'
      process.env.USER = mockUser
      const filename = 'file.png'

      jest.spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename])

      jest.spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock)

      const result = await FileHelper.getFilesStatus("/tmp")

      const expectedResult = [
        {
          size: '2.97 MB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename
        }
      ]

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`)
      expect(result).toMatchObject(expectedResult)
    })
  })
})