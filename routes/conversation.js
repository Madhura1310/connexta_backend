const router = require("express").Router();
const Conversation = require("../models/conversation");


// new conv

router.post("/", async (req,res)=>{
    const newConversation = new Conversation({
      members:[req.body.senderId, req.body.receiverId],
    });

    try{
     const savedConversation = await newConversation.save();
     res.status(200).json(savedConversation);
    }catch(err){
        res.status(500).json(err)
    }
});


// get conv for a user

router.get("/:userId", async (req,res)=>{
  try{
   const conversation = await Conversation.find({
      members: { $in: [req.params.userId]},
   });
   res.status(200).json(conversation);
  }catch(err){
    res.status(500).json(err);
  }
});



// Delete a conversation
router.delete("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if user is part of the conversation
    if (!conversation.members.includes(req.body.userId)) {
      return res.status(403).json({ message: "You can only delete your own conversations" });
    }
    
    // Delete all messages in this conversation first
    await Message.deleteMany({ conversationId: req.params.id });
    
    // Then delete the conversation
    await Conversation.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;