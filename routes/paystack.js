import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import axios from "axios";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Initialize Paystack transaction
router.post("/initialize", async (req, res) => {
  const { email, amount, bookName } = req.body;
  
  if (!email || !amount || !bookName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
        const reference = `Book-Payment-Receipt-${Date.now()}`;
        const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // naira → kobo
        callback_url: `http://localhost:5050/api/success?book=${bookName}`, // call our success route
        reference
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data); // send authorization URL, reference etc.
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

// Secure download endpoint
router.get("/secure-download", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: "No valid token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const book = decoded.book;

    let filePath;
    if (book === "DreamsBeyondBorders") {
      filePath = path.join(__dirname, "../books/dreams-beyond-borders.pdf");
    } else if (book === "GodsToGoddesses") {
      filePath = path.join(__dirname, "../books/GodsToGoddesses.pdf");
    } else {
      return res.status(404).json({ error: "Book not found" });
    }

    res.download(filePath, `${book}.pdf`);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Optional: generate token if needed separately (frontend flow)
router.post("/generate-token", (req, res) => {
  const { book } = req.body;
  if (!book) return res.status(400).json({ error: "Book missing" });

  const token = jwt.sign({ book }, JWT_SECRET, { expiresIn: "5m" });
  res.json({ token });
});

export default router;

