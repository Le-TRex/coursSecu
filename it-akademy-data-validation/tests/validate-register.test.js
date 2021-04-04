const request = require('supertest')
const app = require('../src/app')

const password = '123abcABC$@'
const email = 'Marty.Mcfly+1@Hill-Valley.com'

const testPayload = (payload, expectedStatusCode, done) => {
  request(app)
    .post('/validate-register')
    .send(payload)
    .then(response => {
      expect(response.statusCode).toEqual(expectedStatusCode)
      done()
    })
}

describe('Test the /validate-register endpoint', () => {
  test('It should validate when the payload is valid', done => {
    testPayload({ email, password, 'confirm-password': password }, 200, done)
  })
  
  test('It should invalidate when email is missing', done => {
    testPayload({ password, 'confirm-password': password }, 400, done)
  })

  test('It should invalidate when the email is invalid', done => {
    testPayload({ email: 'not-an-email', password, 'confirm-password': password }, 400, done)
  })

  test('It should sanitize the email', done => {
    request(app)
      .post('/validate-register')
      .send({ email, password, 'confirm-password': password })
      .then(response => {
        expect(response.body.data.email).toEqual('marty.mcfly@hill-valley.com')
        done()
      })
  })

  test('It should invalidate when the password is missing', done => {
    testPayload({ email, 'confirm-password': password }, 400, done)
  })

  test('It should invalidate when the password is too short', done => {
    const password = 'aA@1'
    testPayload({ email, password, 'confirm-password': password }, 400, done)
  })
  
  test('It should invalidate when the password is too long', done => {
    const password = 'aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1aA@1'
    testPayload({ email, password, 'confirm-password': password }, 400, done)
  })

  test('It should invalidate when the password does not contain any uppercase character', done => {
    const password = '123abcabc$@'
    testPayload({ email, password, 'confirm-password': password }, 400, done)
  })
  
  test('It should invalidate when the password does not contain any lowercase character', done => {
    const password = '123ABCABC$@'
    testPayload({ email, password, 'confirm-password': password }, 400, done)
  })

  test('It should invalidate when the password does not contain any special character', done => {
    const password = '123ABCabc12'
    testPayload({ email, password, 'confirm-password': password }, 400, done)
  })

  test('It should invalidate when the password does not contain any number', done => {
    const password = 'abcABCabc$@'
    testPayload({ email, password, 'confirm-password': password }, 400, done)
  })

  test('It should invalidate when the password does not match the confirm-password', done => {
    testPayload({ email, password, 'confirm-password': 'not the same' }, 400, done)
  })
})
