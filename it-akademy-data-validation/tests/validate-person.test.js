const request = require('supertest')
const app = require('../src/app')

const firstname = 'Marty'
const lastname = 'McFly'
const age = 18
const personalWebsite = 'https://hill-valley.com'

describe('Test the /validate-person endpoint', () => {
  test('It should be validated when the payload is valid', done => {
    request(app)
      .post('/validate-person')
      .send({
        firstname,
        lastname,
        age,
        'personal-website': personalWebsite
      })
      .then(response => {
        expect(response.statusCode).toEqual(200)
        done()
      })
  })

  test('It should be invalidated when firstname is missing', done => {
    request(app)
      .post('/validate-person')
      .send({
        lastname,
        age,
        'personal-website': personalWebsite
      })
      .then(response => {
        expect(response.statusCode).toEqual(400)
        done()
      })
  })

  test('It should be invalidated when the firstname is too short', done => {
    request(app)
      .post('/validate-person')
      .send({
        firstname: 'John',
        lastname,
        age,
        'personal-website': personalWebsite
      })
      .then(response => {
        expect(response.statusCode).toEqual(400)
        done()
      })
  })

  test('It should be invalidated when the firstname is too long', done => {
    request(app)
      .post('/validate-person')
      .send({
        firstname: 'JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn',
        lastname,
        age,
        'personal-website': personalWebsite
      })
      .then(response => {
        expect(response.statusCode).toEqual(400)
        done()
      })
  })
})
