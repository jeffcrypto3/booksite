import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

// GET /api/download/:bookName
router.get("/:bookName", async (req, res) => {
  const { bookName } = req.params;
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "books", `${bookName}.pdf`);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Book not found" });
  }

  // For now: simple direct download (we’ll secure it later)
  res.download(filePath, `${bookName}.pdf`, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).json({ error: "Error downloading file" });
    }
  });
});

export default router;
