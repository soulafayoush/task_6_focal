const express = require('express');
const bodyParser = require('body-parser');
const postsController = require('./posts.controller');



//هذا الكود التاني لتوليد id عشواءي
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/posts', postsController.getAllPosts);
app.post('/posts', postsController.createPost);
app.put('/posts/:id', postsController.updatePost);
app.delete('/posts/:id', postsController.deletePost);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
