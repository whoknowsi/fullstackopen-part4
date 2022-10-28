const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
	logger.info('Method:', request.method)
	logger.info('Path:  ', request.path)
	logger.info('Body:  ', request.body)
	logger.info('---')
	next()
}

const authenticate = async (req, res, next) => {
	const token = req.token
	if (!token) {
		return res.status(401).json({ error: 'token missing or invalid' })
	}

	const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN)
	if (!decodedToken.id) {
		return res.status(401).json({ error: 'token missing or invalid' })
	}

	req.username = decodedToken.username
	req.id = decodedToken.id
	next()
}

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
	logger.error(error.message)

	if (error.name === 'ValidationError') {
		return res.status(400).send({ error: error.message })
	}

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'invalid id provided' })
	}

	if(error.name === 'JsonWebTokenError') {
		return res.status(401).send({ error: 'token missing or invalid'})
	}

	next(error)
}

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization')
	
	if(authorization && authorization.toLowerCase().startsWith('bearer ')) {
		req.token = authorization.substring(7)
		
	}

	next()
}

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	authenticate,
	tokenExtractor
}
