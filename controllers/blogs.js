const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { authenticate } = require('../utils/middleware')

router.get('/', async (req, res) => {
	const foundBlogs = await Blog.find({}).populate('user', {username: 1, name: 1})
	res.json(foundBlogs)
})

router.get('/:id', async (req, res) => {
    const id = req.params.id
    const foundBlog = await Blog.findById(id).populate('user', {username: 1, name: 1})
    foundBlog
        ? res.json(foundBlog)
        : res.status(404).json({ message: "blog not found"})
})

router.post('/', authenticate, async (req, res) => {
    const blog = new Blog({...req.body, user: req.id})
    const savedBlog = await blog.save()

    const user = await User.findById(req.id)
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    res.status(201).json(savedBlog)
})

router.put('/:id', authenticate, async (req, res) => {
    const blogId = req.params.id
    const userId = req.id
    const toUpdate = {
        likes: req.body.likes
    }

    const blogToUpdate = await Blog.findById(blogId)
    if(!blogToUpdate) {
        res.status(404).json({ message: "blog not found" })
    }

    if(blogToUpdate.user.toString() !== userId) {
        res.status(401).json({ message: "invalid user" })
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, toUpdate, {
        new: true,
        runValidators: true
    })

    res.status(200).json(updatedBlog)
})

router.delete('/:id', authenticate, async (req, res) => {
    const blogId = req.params.id
    const foundBlog = await Blog.findById(blogId)

    if(!foundBlog) {
        return res.status(404).json({ message: "blog not found "})
    }

    if(foundBlog.user?.toString() !== req.id) {
        return res.status(401).json({ message: "invalid user"})
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId).populate('user', {username: 1, name: 1})
    res.status(200).json(deletedBlog)
})

module.exports = router
