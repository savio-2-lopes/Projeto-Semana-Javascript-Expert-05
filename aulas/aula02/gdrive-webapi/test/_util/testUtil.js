import { Readable, Writable, Transform } from 'stream'
import { jest } from '@jest/globals'
export default class TestUtil {

  static mockDateNow(mockImplementationPeriods) {
    const now = jest.spyOn(global.Date, global.Date.now.name)

    mockImplementationPeriods.forEach(time => {
      now.mockReturnValue(time);
    })
  }

  static getTimeFromDate(dateString) {
    return new Date(dateString).getTime()
  }

  static generateReadableStream(data) {
    return new Readable({
      objectMode: true,

      async read() {
        for (const item of data) {
          this.push(item)
        }
        this.push(null)
      }
    })
  }
  static generateWritableStream(onData) {
    return new Writable({
      objectMode: true,
      write(chunk, encondig, cb) {
        onData(chunk)
        cb(null, chunk)
      }
    })
  }

  static generateTransformStream(onData) {
    return new Transform({
      objectMode: true,

      transform(chunk, encondig, cb) {
        onData(chunk)
        cb(null, chunk)
      }
    })
  }
}