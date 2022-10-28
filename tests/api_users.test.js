const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const { randomBoolean } = require('./test_helper')

describe('/api/users', () => {
	const url = '/api/users/'

	describe('user creation', () => {
		beforeEach(async () => {
			await User.deleteMany({})
		})

		test('creates a user if correct user and password is provided', async () => {
			const newUserData = {
				username: 'correctUsername',
				name: 'correctName',
				password: 'correctPassword',
			}

			const createdUser = await api.post(url).send(newUserData).expect(200)

			expect(createdUser.body.username).toBe(newUserData.username)
		})

		test('fails if password or username is too short', async () => {
			let data = ''

			const shortUsername = {
				username: 'a',
				name: 'correctName',
				password: 'correctPassword',
			}

			const shortPassword = {
				username: 'correctUsername2',
				name: 'correctName',
				password: '1',
			}

			randomBoolean() ? (data = shortUsername) : (data = shortPassword)

			await api
				.post(url)
				.send(data)
				.expect(400)
				.expect('Content-Type', /application\/json/)
		})

		test('fails if username is already taken', async () => {
			const newUserData = {
				username: 'correctUsernameTaken',
				name: 'correctName',
				password: 'correctPassword',
			}

			const createdUser = await api.post(url).send(newUserData)

			const takenUserData = {
				username: createdUser.body.username,
				name: 'correctName',
				password: 'correctPassword',
			}

			const restult = await api
				.post(url)
				.send(takenUserData)
				.expect(400)
				.expect('Content-Type', /application\/json/)

			expect(restult.body.error).toContain('username is already taken')
		})
	})
})

afterAll(() => {
	mongoose.connection.close()
})
