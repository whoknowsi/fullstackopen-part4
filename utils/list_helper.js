const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((prev, current) => {
        if(!Object.keys(prev).length || current.likes > prev.likes) prev = current
        return prev
    }, {})
}

const mostBlogs = (blogs) => {
    const authorByBlog = {}
    blogs.map(blog => {
        authorByBlog[blog.author] !== undefined
            ? authorByBlog[blog.author] += 1
            : authorByBlog[blog.author] = 1
    })

    return getMostXAuthorObject(authorByBlog, "blogs")
}

const mostLikes = (blogs) => {
    const authorByLikes = {}
    blogs.map(blog => {
        authorByLikes[blog.author] !== undefined
            ? authorByLikes[blog.author] += blog.likes
            : authorByLikes[blog.author] = blog.likes
    })

    return getMostXAuthorObject(authorByLikes, "likes")
}

const getMostXAuthorObject = (authorByX, quantityKey) => {
    const authorWithMoreX = {}
    for (let i = 0; i < Object.keys(authorByX).length; i++) {
        const author = Object.keys(authorByX)[i];
        const quantity = authorByX[author]

        if(!Object.keys(authorWithMoreX).length || quantity > authorWithMoreX[quantityKey]) {
            authorWithMoreX.author = author
            authorWithMoreX[quantityKey] = quantity
        } 
    }
    return authorWithMoreX
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}