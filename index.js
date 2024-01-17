const express = require('express')
const app = express()
const host = 3000
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
app.use(express.json())
app.use(cookieParser())

const cors = require('cors')
const { log } = require('console')
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}))

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString('hex');
    return secretKey;
}

const SECRET_KEY = generateSecretKey();
console.log('Generated Secret Key:', SECRET_KEY);


mongoose.connect('mongodb://127.0.0.1:27017/Connectify');
const db = mongoose.connection;
db.once('open',()=>{
    console.log('DB Connected...');
})


const User = mongoose.model('User', { 
    name: String,
    contact: Number,
    username: String,
    password: String,
    connections: [String],
    requests: [String],
    posts: [{
        serialNumber: String,
        user: String,
        content: String,
        title: String,
        likes: [String],
        likesCount: {type: Number, default: 0},
        comments: [{
            user: String,
            text: String,
            replies: [{
                user: String,
                text: String,
            }],
        }],
    }],
});
  
  



const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ "msg": "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ "msg": "Invalid token" });
    }
}




app.post('/register',async(req,res)=>{

    try {
        const existingUser = await User.findOne({ username: req.body.username })

        if(existingUser){
            return res.status(409).json({ "msg" : "Username already exists", "code" : 409 })
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            name: req.body.name,
            contact: req.body.contact,
            username: req.body.username,
            password: hashedPassword,
            connections: [],
            requests: [],
            posts: []
        })

        const saveUser = await newUser.save()
        const token = jwt.sign({ username: saveUser.username,connections: saveUser.connections, 
            requests: saveUser.requests, posts:saveUser.posts }, SECRET_KEY)
        res.cookie('token', token, { httpOnly: true })
        res.status(201).json({"msg" : "Registration successful", "code": 201, "user" : saveUser})
    }
    catch(error){
        res.status(500).json(error)
    }
})



app.post('/login',async(req,res)=>{

    try {
        const user = await User.findOne({ username: req.body.username })

        if(!user){
            return res.status(401).json({ "msg" : "Invalid credentials", "code": 401 })
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ "msg": "Invalid credentials", "code": 401 });
        }

        const token = jwt.sign({ username: user.username, connections: user.connections, 
            requests: user.requests, posts: user.posts }, SECRET_KEY);
        res.cookie('token', token, { httpOnly: true });

        res.json({ "msg" : 'Login successful', "code" : 200, "user" : user })
    }
    catch(error){
        res.status(500).json(error)
    }
})



app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ "msg": "Logout successful", "code" : 200 });
})



app.post('/createPost/:username', authenticateUser, async(req,res)=>{

    try {
        const user = await User.findOne({ username: req.params.username })

        if(!user){
            return res.status(404).json({ "msg" : "User not found", "code" : 404 })
        }

        const newPost = {
            serialNumber: req.body.serialNumber,
            user: user.username,
            content: req.body.content,
            title: req.body.title,
            likes: [],
            comments: []
        }

        user.posts.push(newPost)
        await user.save()
        res.status(201).json({ "msg" : "Post created successfully", "code" : 201, newPost })
    }

    catch(error){
        res.status(500).json(error)
    }
})





app.get('/getPost/:username',authenticateUser,async(req,res)=>{

    try{
        const loggedInUser = req.user;
        const targetUser = await User.findOne({ username: req.params.username });

        if(loggedInUser.username === targetUser.username){
            return res.json(targetUser.posts);
        }

        if(!loggedInUser || !targetUser){
            return res.status(404).json({ "msg" : "User not found", "code" : 404 })
        }

        const isConnected = targetUser.connections.includes(loggedInUser.username);

        if (!isConnected) {
            return res.status(403).json({ "msg": "Can't view posts as user is not your connection", "code" : 403 });
        }

        const posts = targetUser.posts;

        if(posts.length==0){
            return res.status(404).json({"msg":"User has not posted yet", "code":404})
        }
        res.json({"code" : 200, posts})
    }
    catch(error){
        res.status(500).json(error)
    }
})





app.put('/updatePost/:username/:serialNumber', authenticateUser, async (req, res) => {

    try {
        const loggedInUser = req.user;
        const targetUser = req.params.username;

        if (!loggedInUser || !targetUser) {
            return res.status(404).json({ "msg": "User not found", "code": 404 });
        }

        if(loggedInUser.username !== targetUser){
            return res.status(403).json({ "msg": "Forbidden", "code": 403 });
        }

        const updatedPost = await User.findOneAndUpdate(
            { username: targetUser, 'posts.serialNumber': req.params.serialNumber },
            { $set: { 'posts.$.content': req.body.content, 'posts.$.title': req.body.title } },
            { new: true }
        );

        if(!updatedPost){
            return res.status(404).json({"msg" : "Post not found", "code" : 404 })
        }

        res.json({ "msg": "Post updated successfully", "code": 200, updatedPost });

    } catch (error) {
        res.status(500).json(error);
    }
});





app.delete('/deletePost/:username/:serialNumber', authenticateUser, async (req, res) => {

    try {
        const loggedInUser = req.user;
        const targetUser = req.params.username;

        if (!loggedInUser || !targetUser) {
            return res.status(404).json({ "msg": "User not found", "code": 404 });
        }

        if(loggedInUser.username !== targetUser){
            return res.status(403).json({ "msg": "Forbidden", "code": 403 });
        }

        const deletedPost = await User.findOneAndUpdate(
            { username: req.params.username },
            { $pull: { posts: { serialNumber: req.params.serialNumber } } },
            { new: true }
        );

        if(!deletedPost){
            return res.status(404).json({"msg" : "Post not found", "code" : 404 })
        }

        res.status(200).json({ "msg": "Post deleted successfully", "code": 200, deletedPost }); 

    } catch (error) {
        res.status(500).json(error);
    }
});







app.post('/follow/:username',authenticateUser,async(req,res)=>{

    try {
        const user = req.user;
        const targetUser = await User.findOne({ username: req.params.username })

        if (!user || !targetUser) {
            return res.status(404).json({ "msg" : "User not found", "code" : 404 })
        }

        if (targetUser.requests.includes(user.username)) {
            return res.status(403).json({ "msg": "Request already sent", "code" : 403 });
        }

        targetUser.requests.push(user.username);
        await targetUser.save();

        res.json({ "msg" : "Request sent successfully", "code" : 200 })
    } 
    catch(error){
        res.status(500).json(error)
    }
})




app.get('/getRequests',authenticateUser,async(req,res)=>{

    try{
        const user = req.user;

        if(!user){
            return res.status(404).json({ "msg" : "User not found", "code" : 404 })
        }

        const requests = user.requests;
        if(requests.length == 0){
            return res.status(404).json({"msg" : "No requests found", "code" : 404});
        }
        res.json({"code" : 200, requests})
    }
    catch(error){
        res.status(500).json(error)
    }
})




app.post('/acceptRequest/:username',authenticateUser,async(req,res) => {

    try {
      const user = req.user;
      const loggedInUser = await User.findOne({ username: user.username });
      const requester = await User.findOne({ username: req.params.username });
  
      if (!loggedInUser || !requester) {
        return res.status(404).json({ "msg": "User not found", "code" : 404 });
      }
  
      
      if (!loggedInUser.requests.includes(requester.username)) {
        return res.status(403).json({ "msg": "No request found to accept", "code" : 403 });
      }
  
      // Accept the request
      loggedInUser.connections.push(requester.username);
      requester.connections.push(loggedInUser.username);
      loggedInUser.requests = loggedInUser.requests.filter(request => request !== requester.username);
  
      await loggedInUser.save();
      await requester.save();
      res.json({ "msg": "Request accepted successfully", "code" : 200 });
      
      
    } catch (error) {
        console.error('Error in acceptRequest:', error);
        res.status(500).json(error)
    }
});





app.post('/rejectRequest/:username',authenticateUser, async (req, res) => {

    try {
      const user = req.user;
      const loggedInUser = await User.findOne({ username: user.username });
      const requester = await User.findOne({ username: req.params.username });
  
      if (!loggedInUser || !requester) {
        return res.status(404).json({ "msg": "User not found", "code" : 404 });
      }
  
      if (!loggedInUser.requests.includes(requester.username)) {
        return res.status(403).json({ "msg": "No request found to reject", "code" : 403 });
      }
  
      // Reject the request
      loggedInUser.requests = loggedInUser.requests.filter(request => request !== requester.username);
  
      await loggedInUser.save();
      await requester.save();
  
      res.json({ "msg": "Request rejected successfully", "code" : 200 });
    } catch (error) {
        res.status(500).json(error)
    }
  });
  
  



app.post('/unfollow/:username',authenticateUser,async(req,res)=>{

    try {
        const user = req.user;
        const loggedInUser = await User.findOne({ username: user.username });
        const targetUser = await User.findOne({ username: req.params.username })

        if(!loggedInUser || !targetUser){
            return res.status(404).json({ "msg" : "User not found", "code" : 404 })
        }

        const isConnected = targetUser.connections.includes(loggedInUser.username);

        if (isConnected) {

            targetUser.connections = targetUser.connections.filter(connection => connection !== loggedInUser.username);
            loggedInUser.connections = loggedInUser.connections.filter(connection => connection !== targetUser.username)
            await loggedInUser.save();
            await targetUser.save();
      
            res.json({ "msg": "Unfollowed successfully", "code" : 200 });
        } 
        else {
            return res.status(403).json({ "msg": "No connection found", "code" : 403 });
        }
    } 
    catch(error){
        res.status(500).json(error)
    }
})



app.get('/checkConnections',authenticateUser,async(req,res)=>{

    try{
        const user = req.user;

        if(!user){
            return res.status(404).json({ "msg" : "User not found", "code" : 404 })
        }

        const connections = user.connections;
        if(connections.length == 0){
            return res.status(404).json({"msg" : "No connections found", "code" : 404});
        }
        res.json({"code" : 200, connections})
    }
    catch(error){
        res.status(500).json(error)
    }
})





app.post('/like/:username',authenticateUser,async(req,res)=>{

    try {
        const user = req.user;
        const loggedInUser = await User.findOne({ username: user.username });
        const targetUser = await User.findOne({ username: req.params.username });

        if(!loggedInUser || !targetUser){
            return res.status(404).json({ "msg" : "User not found", "code" : 404 })
        }

        const post = targetUser.posts[0];

        if(!post){
            return res.status(404).json({"msg" : "Post not found", "code" : 404})
        }

        if (!post.likes.includes(loggedInUser.username)) {

            post.likes.push(loggedInUser.username);
            post.likesCount = post.likes.length;
            await loggedInUser.save();
            res.json({ "msg": "Post liked successfully", "code" : 200, "likes": post.likes });

        } 
        else {
            return res.status(403).json({ "msg": "Post already liked", "code" : 403 });
        }
        
    } 
    catch(error){
        res.status(500).json(error)
    }
})




app.post('/comment/:username',authenticateUser, async (req, res) => {

    try {

        const user = req.user;
        const loggedInUser = await User.findOne({ username: user.username });
        const targetUser = await User.findOne({ username: req.params.username });
  
      if (!loggedInUser || !targetUser) {
        return res.status(404).json({ "msg": "User not found", "code" : 404 });
      }
  
      const post = targetUser.posts[0];
  
      if (!post) {
        return res.status(404).json({ "msg": "Post not found", "code" : 404 });
      }
  
      const newComment = {
        user: loggedInUser.username,
        text: commentText,
        replies: [],
      }
  
      post.comments.push(newComment);
      await loggedInUser.save();
  
      res.json({ "msg": "Comment added successfully", "comment": post.comments, "code" : 200 });
    } 
    catch (error) {
        res.status(500).json(error)
    }

});
  



app.post('/commentReply/:username',authenticateUser, async (req, res) => {

    try {
        const user = req.user;
        const loggedInUser = await User.findOne({ username: user.username });
        const targetUser = await User.findOne({ username: req.params.username });
        const replyText = req.body.replyText;
  
      if (!loggedInUser || !targetUser) {
        return res.status(404).json({ "msg": "User not found", "code" : 404 });
      }
  
      const post = targetUser.posts[0];
  
      if (!post) {
        return res.status(404).json({ "msg": "Post not found", "code" : 404 });
      }
  
      const comment = post.comments[0];
  
      if (!comment) {
        return res.status(404).json({ "msg": "Comment not found", "code" : 404 });
      }
  
      const newReply = {
        user: loggedInUser.username,
        text: replyText,
      };
  
      comment.replies.push(newReply);
      await loggedInUser.save();
  
      res.json({ "msg": "Reply added successfully", comment: post.comments, "code" : 200 });

    } 
    catch (error) {
        res.status(500).json(error)
    }

});



app.listen(host,()=>{
    console.log("server started...");
});

