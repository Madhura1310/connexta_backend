const router = require("express").Router();
const Post = require("../models/post")
const User = require("../models/user");

//create a post

router.post("/", async(req,res)=>{
    const newPost = new Post(req.body)
    try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }catch(err){
        res.status(500).json(err);
    }
})
//update a post
router.put("/:id",async (req,res)=>{
    try{
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId){
        await post.updateOne({$set:req.body});
        res.status(200).json(" the post has been updated")
    }else{
        res.status(403).json("you can update only your post")
    }
  }catch(err){
    res.status(500).json(err);
  }
})
//delete a post

router.delete("/:id",async (req,res)=>{
    try{
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId){
        await post.deleteOne({$set:req.body});
        res.status(200).json(" the post has been deleted")
    }else{
        res.status(403).json("you can delete only your post")
    }
  }catch(err){
    res.status(500).json(err);
  }
})
//like a post
router.put("/:id/like", async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.like.includes(req.body.userId)){
            await post.updateOne({$push:{like:req.body.userId}});
            res.status(200).json("the post has been liked")
        }else{
            await post.updateOne({$pull:{like:req.body.userId}});
            res.status(200).json("the post has been disliked");
        }
    }catch(err){
        res.status(500).json(err);
    }
});

//get a post
router.get("/:id", async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err)
    }
})


//get timeline posts

router.get("/timeline/:userId", async (req, res) => {
    try {
        console.log("Requested userId:", req.params.userId);
      const currentUser = await User.findById(req.params.userId);
      if (!currentUser) return res.status(404).json("User not found"); // Add this line
      
      const userPosts = await Post.find({ userId: currentUser._id });
      const friendPosts = await Promise.all(
        currentUser.followers.map((friendId) => Post.find({ userId: friendId }))
      );
      res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });


 // get users all posts

  router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({username:req.params.username})
        const posts = await Post.find({userId:user._id});
        res.status(200).json(posts);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

module.exports = router;