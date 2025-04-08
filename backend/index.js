import express from "express";
import ImageKit from "imagekit";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import mongoose from "mongoose";
import { requireAuth } from "@clerk/express";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// Set up CORS and other middleware (keep your existing code)
// ...

// Initialize Google Generative AI
console.log("GOOGLE_GEMINI_API_KEY:", process.env.GOOGLE_GEMINI_API_KEY ? "Set" : "Not Set");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ]
});

  app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

app.get("/", (req, res) => {
  res.send("root path");
});

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.get("/api/userchats", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    console.warn("Unauthorized access attempt - Missing userId");
    return res
      .status(401)
      .json({ error: "Unauthorized: No valid session token." });
  }

  try {
    const userChats = await UserChats.find({ userId });
    console.log(`Fetched user chats for userId: ${userId}`, userChats);
    res.status(200).json(userChats.length > 0 ? userChats[0].chats : []);
  } catch (err) {
    console.error("Error fetching user chats:", err);
    res.status(500).json({ error: "Error fetching user chats!" });
  }
});

app.get("/api/chats/:id", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Fetching chat with ID:", req.params.id); // Debugging Log

    const chat = await Chat.findOne({ _id: req.params.id, userId });

    if (!chat) {
      console.log(`Chat not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: "Chat not found" });
    }

    console.log("Found chat:", chat);
    res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chat:", err);
    res.status(500).json({ error: "Error fetching chat!" });
  }
});
// FIXED: Prevent `userId` missing error when creating a chat
app.post("/api/chats", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  const { text } = req.body;

  if (!userId) {
    console.warn("⚠️ Unauthorized attempt to create a chat - Missing userId");
    return res.status(401).json({ error: "Unauthorized: userId is missing" });
  }

  if (!text) {
    return res.status(400).json({ error: "Chat text is required" });
  }

  try {
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();

    const userChats = await UserChats.findOne({ userId });
    if (!userChats) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [{ _id: savedChat.id, title: text.substring(0, 40) }],
      });
      await newUserChats.save();
    } else {
      await UserChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: { _id: savedChat._id, title: text.substring(0, 40) },
          },
        }
      );
    }

    // Gemini API call
    let completion = "";
    try {
      console.log("Calling Gemini API with text:", text);
      const result = await model.generateContent(text);
      const response = await result.response;
      completion = response.text();
      console.log("Extracted completion:", completion);
    } catch (geminiErr) {
      console.error("❌ Gemini API Error:", geminiErr);
    }

    res.status(201).json({ id: savedChat.id, completion });
  } catch (err) {
    console.error("❌ Error creating chat:", err);
    res.status(500).json({ error: "Error creating chat!" });
  }
});

// Also update the PUT endpoint to update chats with new Gemini responses
app.put("/api/chats/:id", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  const { question, img } = req.body;

  if (!userId) {
    console.warn("⚠️ Unauthorized attempt to update chat - Missing userId");
    return res.status(401).json({ error: "Unauthorized: userId is missing" });
  }

  try {
    // Get Gemini response if there's a question
    let answer = "";
    if (question) {
      try {
        // If there's an image, process it with Gemini's multimodal capabilities
        if (img && img.aiData && img.aiData.inlineData) {
          const { data, mimeType } = img.aiData.inlineData;
          const imageData = {
            inlineData: {
              data,
              mimeType
            }
          };
          
          const result = await model.generateContent([question, imageData]);
          answer = result.response.text();
        } else {
          // Text-only prompt
          const result = await model.generateContent(question);
          answer = result.response.text();
        }
      } catch (geminiErr) {
        console.error("❌ Gemini API Error:", geminiErr);
        answer = "Sorry, I couldn't process that request.";
      }
    }

    const newItems = [
      ...(question
        ? [{ role: "user", parts: [{ text: question }], ...(img && { img: img.dbData.filePath }) }]
        : []),
      { role: "model", parts: [{ text: answer }] },
    ];

    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      { $push: { history: { $each: newItems } } }
    );
    res.status(200).json({ ...updatedChat, answer });
  } catch (err) {
    console.error("❌ Error updating chat:", err);
    res.status(500).json({ error: "Error updating chat!" });
  }
});
app.delete("/api/chats/:id", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    console.warn("⚠️ Unauthorized attempt to delete chat - Missing userId");
    return res.status(401).json({ error: "Unauthorized: userId is missing" });
  }

  try {
    // First, delete the chat document
    const deletedChat = await Chat.findOneAndDelete({ _id: req.params.id, userId });
    
    if (!deletedChat) {
      return res.status(404).json({ error: "Chat not found or you don't have permission to delete it" });
    }
    
    // Then, remove the chat from the user's chat list
    await UserChats.updateOne(
      { userId },
      { $pull: { chats: { _id: req.params.id } } }
    );
    
    console.log(`✅ Deleted chat with ID: ${req.params.id}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting chat:", err);
    res.status(500).json({ error: "Error deleting chat!" });
  }
});
// Authentication error handling
app.use((err, req, res, next) => {
  console.error("Unauthenticated request:", err.stack);
  res.status(401).json({ error: "Unauthenticated" });
});

app.listen(port, () => {
  connect();
  console.log(`Server Running on port ${port}`);
});
