const request = require('supertest')
const app = require('../src/app')

describe('Test the root path', () => {
  test('It should response a HTTP 200 with the GET method', done => {
    request(app)
      .get('/')
      .then(response => {
        expect(response.statusCode).toEqual(200)
        done()
      })
  })

  test('It should response a HTTP 405 with the POST method', done => {
    request(app)
      .post('/')
      .then(response => {
        expect(response.statusCode).toEqual(405)
        done()
      })
  })
})
