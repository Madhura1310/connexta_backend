const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt")

// update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) { // Check req.body.isAdmin (not req.user)
      if (req.body.password) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt); // Fixed: req.body.password
        } catch (err) {
          return res.status(500).json(err); // Added return + fixed typo (res.json → res.status)
        }
      }
      try {
        const user = await User.findByIdAndUpdate( // Fixed: User (uppercase) + findByIdAndUpdate (correct spelling)
          req.params.id,
          { $set: req.body },
          { new: true } // Returns the updated user
        );
        res.status(200).json("Account has been updated");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can update only your account");
    }
  });



//delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) { // Check req.body.isAdmin (not req.user)
      try {
        const user = await User.findByIdAndDelete( // Fixed: User (uppercase) + findByIdAndUpdate (correct spelling)
          req.params.id,
          { $set: req.body },
          { new: true } // Returns the updated user
        );
        res.status(200).json("Account has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can delete only your account");
    }
  });


//get a user

router.get("/",async (req,res)=>{
  const userId = req.query.userId;
  const username = req.query.username;
    try{
        const user =userId 
        ? await User.findById(userId) 
        : await User.findOne({username: username});
        const {password,upadatedAt, ...other} = user._doc
        res.status(200).json(other)
    }catch(err){
        res.status(500).json(err);
    }
})

//get friends 
router.get("/friends/:userId", async(req,res)=>{
  try{
     const user = await User.findById(req.params.userId);
     const friends = await Promise.all(
      user.followings.map(friendId=>{
        return User.findById(friendId)
      })
     )
     let friendList = [];
     friends.map(friend =>{
      const {_id,username,profilePicture} = friend;
      friendList.push({_id,username,profilePicture})
     });
     res.status(200).json(friendList)
  }catch(err){
    res.status(500).json(err)
  }
})



//follow a user
router.put("/:id/follow",async (req,res)=>{
    if(req.body.userId !== req.params.id){
     try{
     const user = await User.findById(req.params.id);
     const currentuser = await User.findById(req.body.userId);
     if(!user.followers.includes(req.body.userId)){
       await user.updateOne({$push:{followers: req.body.userId}});
       await currentuser.updateOne({$push:{followings: req.params.id}});
       res.status(200).json("user as been followed");
     }else{
        res.status(403).json("you allready follow this user");
     }
     }catch(err){
        res.status(500).json(err);
     }
    }else{
        res.status(403).json("you can follow yourself ");
    }
})

//unfollow a user

router.put("/:id/unfollow",async (req,res)=>{
  if(req.body.userId !== req.params.id){
   try{
   const user = await User.findById(req.params.id);
   const currentuser = await User.findById(req.body.userId);
   if(user.followers.includes(req.body.userId)){
     await user.updateOne({$pull:{followers: req.body.userId}});
     await currentuser.updateOne({$pull:{followings: req.params.id}});
     res.status(200).json("user as been unfollowed");
   }else{
      res.status(403).json("you dont follow this user");
   }
   }catch(err){
      res.status(500).json(err);
   }
  }else{
      res.status(403).json("you can unfollow yourself ");
  }
})

module.exports = router;

