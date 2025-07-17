// const express = require("express");
// const app = express();
// const mongoose = require('mongoose'); 
// const dotenv = require("dotenv");
// const helmet = require("morgan");

// dotenv.config();

// mongoose.connect(process.env.MONGO_URL,{userNewUrlParser:true},()=>{
//         console.log("connected to MONGODB")
// });

// app.listen(8800,()=>{
//     console.log("Backr=end server is running!")
// })

const express = require("express");
const app = express();
const mongoose = require('mongoose'); 
const dotenv = require("dotenv");
const morgan = require("morgan"); // You meant "morgan", not "helmet" here
const { default: helmet } = require("helmet");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const multer = require("multer");
const path = require("path");



dotenv.config();

// Use async/await instead of callback in mongoose.connect
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "public/images")));


// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  // ✅ Proper use of path
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/images"));
  },
  // ✅ Safely get filename from req.body or fallback
  filename: (req, file, cb) => {
    // const filename = req.body.name || Date.now() + "-" + file.originalname; 
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json({ filename: req.file.filename });
  } catch (err) {
    console.log(err);
  }
});

app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/posts",postRoute);

app.listen(8800, () => {
    console.log("✅ Backend server is running on port 8800!");
});
