const router = require("express").Router();
const user = require("../models/user");
const User = require("../models/user");
const bcrypt = require("bcrypt")

//REGISTER
router.post("/register", async (req, res) => {
   
    try{
        //genrate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        //create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
//save user and response
        const user = await newUser.save();
        res.status(200).json(user);
    } catch(err){
        console.log(err)
    }
});


// LOGIN

router.post("/login", async (req, res) => {
    try {
      // 1. Find the user by email
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ error: "User not found" }); // 404 for "Not Found"
      }
  
      // 2. Compare passwords (hashed vs provided)
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Wrong password" }); // 401 for "Unauthorized"
      }
  
      res.status(200).json(user); 
  
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;

