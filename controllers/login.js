const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const User = require('../models/user')

router.post('/', async (req, res) => {
    const { username, password } = req.body

	const foundUser = await User.findOne({ username: username })
	const correctPassword = foundUser === null 
		? false 
		: await bcrypt.compare(password, foundUser.passwordHash)

	if (!(foundUser && correctPassword)) {
		return res.status(401).json({ error: 'invalid username or password' })
	}

	const userForToken = {
		username: foundUser.username,
		id: foundUser._id
	}

	const token = jwt.sign(userForToken, process.env.SECRET_TOKEN)
	res.status(200).json({ token, username: foundUser.username, name: foundUser.name })
})

module.exports = router

