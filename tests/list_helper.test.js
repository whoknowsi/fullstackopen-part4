const listHelper = require('../utils/list_helper')
const { blogs } = require('./test_helper')

test('dummy returns one', () => {
	expect(listHelper.dummy(blogs)).toBe(1)
})

describe('total likes', () => {
	test('of empty array is 0', () => {
		expect(listHelper.totalLikes([])).toBe(0)
	})
	test('of multiple blogs is the sum of the likes', () => {
		expect(listHelper.totalLikes(blogs)).toBe(46)
	})
})

describe('favorite blog', () => {
	test('is an empty object if the array empty', () => {
		expect(listHelper.favoriteBlog([])).toEqual({})
	})

	test('is the blog with more likes', () => {
		expect(listHelper.favoriteBlog(blogs)).toEqual({
			title: 'Canonical string reduction',
			author: 'Edsger W. Dijkstra',
			url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
			likes: 12,
		})
	})
})

describe('most blogs', () => {
	test('is an empty object if the array is empty', () => {
		expect(listHelper.mostBlogs([])).toEqual({})
	})


	test('is the correct author and his correct number of blogs', () => {
		expect(listHelper.mostBlogs(blogs)).toEqual({
			"author": "Edsger W. Dijkstra",
			"blogs": 4
		})
	})
})

describe('most likes', () => {
	test('is an empty object if the array is empty', () => {
		expect(listHelper.mostLikes([])).toEqual({})
	})

	test('is the correct author and his correct number of likes', () => {
		expect(listHelper.mostLikes(blogs)).toEqual({
			"author": "Edsger W. Dijkstra",
			"likes": 27
		})
	})
})

