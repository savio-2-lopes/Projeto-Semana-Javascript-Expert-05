import {
  describe,
  jest,
  test,
  expect
} from '@jest/globals'
import { logger } from '../../src/logger'

import Routes from '../../src/routes'
import UploadHandler from '../../src/uploadHandler'
import TestUtil from '../_util/testUtil'

describe('#Routes test suite', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info')
      .mockImplementation()
  })

  const request = TestUtil.generateReadableStream(['some file bytes'])
  const response = TestUtil.generateReadableStream(() => { })

  const defaultParams = {
    request: Object.assign(request, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      method: '',
      body: {}
    }),
    response: Object.assign(response, {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn()
    }),
    values: () => Object.values(defaultParams)
  }

  describe("#setSocketInstance", () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes()
      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => { }
      }
      routes.setSocketInstance(ioObj)
      expect(routes.io).toStrictEqual(ioObj)
    })
  })

  describe('#handler', () => {
    // Inexistent route
    test('given an inexistent route it should choose async default route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'inexistent'
      await routes.handler(...params.values())
      expect(params.response.end).toHaveBeenCalledWith('hello world')
    })

    // CORS enabled
    test('it should set any request with CORS enabled', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }
      params.request.method = 'inexistent'
      await routes.handler(...params.values())
      expect(params.response.setHeader)
        .toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
    })

    // Options route
    test('given method OPTIONS it should choose options route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'OPTIONS'
      await routes.handler(...params.values())
      expect(params.response.writeHead).toHaveBeenCalledWith(204)
      expect(params.response.end).toHaveBeenCalled()
    })

    // Method POST
    test('given method POST it should choose post route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }
      params.request.method = 'POST'
      jest.spyOn(routes, routes.post.name).mockResolvedValue()
      await routes.handler(...params.values())
      expect(routes.post).toHaveBeenCalled()
    })

    // Method GET
    test('given method GET it should choose post route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }
      params.request.method = 'GET'
      jest.spyOn(routes, routes.get.name).mockResolvedValue()
      await routes.handler(...params.values())
      expect(routes.get).toHaveBeenCalled()
    })
  })

  describe('#get', () => {
    test('given method GET it should list all files downloaded', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      const filesStatusesMock = [{
        size: '2.97 MB',
        lastModified: '2021 - 09 - 07T03: 37: 21.625Z',
        owner: 'lopes',
        file: 'file.txt'
      }]

      jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
        .mockResolvedValue(filesStatusesMock)

      params.request.method = 'GET'
      await routes.handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(200)
      expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(filesStatusesMock))
    })
  })

  describe('#post', () => {
    test('it should validate post route workflow', async () => {
      const routes = new Routes('/tmp')
      const options = {
        ...defaultParams
      }

      options.request.method = 'POST'
      options.request.url = '?socketId=10'

      jest.spyOn(
        UploadHandler.prototype,
        UploadHandler.prototype.registerEvents.name
      ).mockImplementation((headers, onFinish) => {
        const writable = TestUtil.generateWritableStream(() => { })
        writable.on('finish', onFinish)
        return writable
      })
      await routes.handler(...options.values())

      expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled()
      expect(options.response.writeHead).toHaveBeenCalledWith(200)

      const expectedResult = JSON.stringify({ result: 'Files uploaded with success!' })
      expect(options.response.end).toHaveBeenCalledWith(expectedResult)
    })
  })
})