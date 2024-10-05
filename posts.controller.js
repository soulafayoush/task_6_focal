const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

async function getAllPosts(req, res) {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    const posts = JSON.parse(data);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
}

async function createPost(req, res) {
  try {
    const { title, description, author } = req.body;
    if (!title || !description || !author) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const data = await fs.readFile(dataPath, 'utf8');
    const posts = JSON.parse(data);
    
    const newPost = {
      id: Date.now(),
      title,
      description,
      author,
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    await fs.writeFile(dataPath, JSON.stringify(posts, null, 2));

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
}

async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, description, author } = req.body;

    const data = await fs.readFile(dataPath, 'utf8');
    let posts = JSON.parse(data);

    const postIndex = posts.findIndex(post => post.id === parseInt(id));
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    posts[postIndex] = {
      ...posts[postIndex],
      title: title || posts[postIndex].title,
      description: description || posts[postIndex].description,
      author: author || posts[postIndex].author,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(dataPath, JSON.stringify(posts, null, 2));

    res.status(200).json(posts[postIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post' });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;

    const data = await fs.readFile(dataPath, 'utf8');
    let posts = JSON.parse(data);

    const postIndex = posts.findIndex(post => post.id === parseInt(id));
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    posts.splice(postIndex, 1);
    await fs.writeFile(dataPath, JSON.stringify(posts, null, 2));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
}

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
};
