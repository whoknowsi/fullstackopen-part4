const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const { initialBlogs, nonExistingId, getRandomBlog, randomBoolean } = require('./test_helper')
let token

beforeEach(async () => {
	await Blog.deleteMany({})
	await User.deleteMany({})

	const userData = {
		username: 'testing',
		password: 'testing'
	}

	const salt = 10
	const passwordHash = await bcrypt.hash(userData.password, salt)
	const newUser = new User({
		username: userData.username,
		name: 'testing',
		passwordHash: passwordHash,
		blogs: []
	})

	const savedUser = await newUser.save()

	const res = await api.post('/api/login/').send(userData)
	token = res.body.token

	const initBlogs = initialBlogs()
	for (let i = 0; i < initBlogs.length; i++) {
		const newBlog = new Blog({...initBlogs[i], user: savedUser._id})
		const savedBlog = await newBlog.save()

		savedUser.blogs = savedUser.blogs.concat(savedBlog._id)
		await savedUser.save()
	}
})

describe('/api/blogs/ when there is initial notes saved', () => {
	const url = '/api/blogs/'
	

	test('return the correct number of blogs', async () => {
		const response = await api.get(url)
		expect(response.body).toHaveLength(initialBlogs().length)
	})

	test('returned blog has and id key', async () => {
		const response = await api.get(url)

		expect(response.body[0].id).toBeDefined()
	})

	describe('calling a specific blog by id', () => {
		test('provides the correct blog entry', async () => {
			const randomBlog = await getRandomBlog()
			const responseBlog = await api.get(url + randomBlog.id)
			expect(responseBlog.body).toEqual(randomBlog)
		})

		test('return 404 if blog entry does not exist', async () => {
			await api.get(url + (await nonExistingId())).expect(404)
		})

		test('return 400 if the id provided is invalid', async () => {
			await api.get(url + 'xc,').expect(400)
		})
	})

	describe('creating a new blog entry', () => {
		test('creates the correct blog entry with the correct token', async () => {
			const newBlog = {
				title: 'Created blog entry',
				author: 'Edsger W.',
				url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Consed_Harmful.html',
				likes: 3,
			}

			const response = await api
				.post(url)
				.set('Authorization', 'Bearer ' + token)
				.send(newBlog)
				.expect(201)
				.expect('Content-Type', /application\/json/)

			expect(response.body).toMatchObject(newBlog)

			const responseBlogs = await api.get(url)
			expect(responseBlogs.body).toHaveLength(initialBlogs().length + 1)
		})

		test('return 401 if the token is invalid or missing', async () => {
			const newBlog = {
				title: 'Created blog entry',
				author: 'Edsger W.',
				url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Consed_Harmful.html',
				likes: 3,
			}

			let badToken = ''
			randomBoolean() && (badToken = 'Bearer x')

			await api
				.post(url)
				.set('Authorization', badToken)
				.send(newBlog)
				.expect(401)
		})

		test('has 0 likes if likes property is not passed', async () => {
			const newBlogWithoutLikes = {
				title: 'Created blog entry',
				author: 'Edsger W.',
				url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Consed_Harmful.html',
			}

			const response = await api
				.post(url)
				.set('Authorization', 'Bearer ' + token)
				.send(newBlogWithoutLikes)
				.expect(201)
				.expect('Content-Type', /application\/json/)
			expect(response.body.likes).toBe(0)
		})

		test('return 400 if title or url has not been provided', async () => {
			const newBlogWithoutTitleOrUrl = {
				author: 'Edsger W.',
				likes: 1,
			}

			randomBoolean()
				? (newBlogWithoutTitleOrUrl.title = 'has title')
				: (newBlogWithoutTitleOrUrl.url = 'has url')

			await api
				.post(url)
				.set('Authorization', 'Bearer ' + token)
				.send(newBlogWithoutTitleOrUrl)
				.expect(400)
				.expect('Content-Type', /application\/json/)
		})
	})

	describe('deleting a blog entry', () => {
		test('deletes the blog entry if the correct token and blog id is provided', async () => {
			const randomBlog = await getRandomBlog()
			const deletedBlog = await api
				.delete(url + randomBlog.id)
				.set('Authorization', 'Bearer ' + token)
				.send()
				.expect(200)

			expect(deletedBlog.body).toEqual(randomBlog)
		})

		test('returns 401 if token is missing or invalid', async () => {
			let badToken = ''
			randomBoolean() && (badToken = 'Bearer x')

			const randomBlog = await getRandomBlog()
			await api
				.delete(url + randomBlog.id)
				.set('Authorization', 'Bearer ' + badToken)
				.send()
				.expect(401)
		})

		test('with non existing id return 404', async () => {
			const id = await nonExistingId()
			await api
				.delete(url + id)
				.set('Authorization', 'Bearer ' + token)
				.send()
				.expect(404)
		})

		test('with invalid id return 400', async () => {
			await api
				.delete(url + '21df')
				.set('Authorization', 'Bearer ' + token)
				.send()
				.expect(400)
		})
	})

	describe('updating a blog entry', () => {
		test('updates the blog entry if correct token is provided', async () => {
			const randomBlog = await getRandomBlog()
			const updatedBlog = await api
										.put(url + randomBlog.id)
										.set('Authorization', 'Bearer ' + token)
										.send({ likes: 999 })

			expect(updatedBlog.body.likes).toBe(999)
		})

		test('return 401 if the token is invalid or missing', async () => {
			const randomBlog = await getRandomBlog()
			let badToken = ''
			randomBoolean() && (badToken = 'Bearer x')
			await api
				.put(url + randomBlog.id)
				.set('Authorization', 'Bearer ' + badToken)
				.send({ likes: 999 })
				.expect(401)
		})


		test('return 200 if not content is send', async () => {
			const randomBlog = await getRandomBlog()
			await api
				.put(url + randomBlog.id)
				.set('Authorization', 'Bearer ' + token)
				.send()
				.expect(200)
		})

		test('return 404 if it is non existing id', async () => {
			const id = await nonExistingId()
			await api
				.put(url + id)
				.set('Authorization', 'Bearer ' + token)
				.send({ likes: 999 })
				.expect(404)
		})

		test('return 400 if the id is not valid', async () => {
			await api
				.put(url + '156sd')
				.set('Authorization', 'Bearer ' + token)
				.send()
				.expect(400)
		})
	})
})

afterAll(() => {
	mongoose.connection.close()
})
