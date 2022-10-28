const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

router.get('/', async (req, res) => {
	const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
	res.json(users)
})

router.post('/', async (req, res) => {
	const body = req.body
	const salt = 10

	if (body.password.length < 3) {
		const err = new Error('Password is too short, need to be at least 3 characters')
		err.name = 'ValidationError'
		throw err
	}

	const passwordHash = await bcrypt.hash(body.password, salt)

	const user = new User({
		username: body.username,
		name: body.name,
		passwordHash,
	})

	const savedUser = await user.save()

	res.json(savedUser)
})

module.exports = router
