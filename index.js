const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// هذه طريقة id المتسلسل التي لا افضلها ابدا
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dataFilePath = path.join(__dirname, 'data.json');
const counterFilePath = path.join(__dirname, 'counter.txt');

async function readCounter() {
    try {
        const content = await fs.readFile(counterFilePath, 'utf8');
        return parseInt(content.trim()) || 0;
    } catch (error) {
        console.error('Error reading counter:', error);
        return 0;
    }
}

async function incrementCounter(counter) {
    try {
        await fs.writeFile(counterFilePath, `${counter + 1}\n`);
        return counter + 1;
    } catch (error) {
        console.error('Error incrementing counter:', error);
        throw error;
    }
}

async function readData() {
    try {
        const content = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(content || '[]');
    } catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
}

async function writeData(data) {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
        throw error;
    }
}

// Create a new post
app.post('/posts', async (req, res) => {
    try {
        const { title, description, author } = req.body;
        
        if (!title || !description || !author) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const counter = await readCounter();
        const newPost = {
            id: counter,
            title,
            description,
            author,
            date: new Date().toISOString()
        };

        const posts = await readData();
        posts.push(newPost);
        await writeData(posts);
        await incrementCounter(counter);

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await readData();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a post
app.put('/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const { title, description, author } = req.body;

        const posts = await readData();
        const postIndex = posts.findIndex(post => post.id === postId);

        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (title) posts[postIndex].title = title;
        if (description) posts[postIndex].description = description;
        if (author) posts[postIndex].author = author;

        await writeData(posts);
        res.json(posts[postIndex]);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);

        const posts = await readData();
        const postIndex = posts.findIndex(post => post.id === postId);

        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const deletedPost = posts.splice(postIndex, 1)[0];
        await writeData(posts);

        res.json(deletedPost);
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
