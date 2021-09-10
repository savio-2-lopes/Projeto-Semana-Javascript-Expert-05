import {
  describe,
  test,
  expect,
  jest
} from '@jest/globals'
import fs from 'fs'
import FileHelper from '../../src/fileHelper.js'

import Routes from './../../src/routes.js'
import FormData from 'form-data'

describe('#Routes integration Test', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => { }
  }
  beforeEach(() => {
    jest.spyOn(logger, 'info')
      .mockImplementation()
  })

  test('should upload file to the folder', async () => {
    const filename = 'video.mp4'
    const fileStream = fs.createReadStream(`./test/integration/mocks/${filename}`)
    const response = TestUtil.generateWritableStream(() => { })

    const form = new FormData()
    form.append('photo', fileStream)

    const defaultParams = {
      request: Object.assign(form, {
        headers: form.getHeaders(),
        method: 'POST',
        url: '?socketId=10'
      }),

      response: Object.assign(response, {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        end: jest.fn()
      }),
      values: () => Object.values(defaultParams)
    }

    const defautlDownloadsFolder = '/tmp'
    const routes = new Routes(defautlDownloadsFolder)
  })
})