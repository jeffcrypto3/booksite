import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const __dirname = path.resolve();

router.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Load books
    const dataPath = path.join(__dirname, "data", "books.json");
    const books = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    // Add payment info
    const paymentInfo = `
        Customers can pay for any book securely through Paystack.
        The accepted payment methods are debit cards, credit cards, or bank transfer.
        After successful payment, a download or confirmation page appears.
      `;

    // ✅ Combined Context (readable + structured)
    const bookSummaries = books
      .map(
        (b) => `${b.title} by ${b.author}: ${b.description}. Price: ${b.price}`
      )
      .join("\n\n");

    const context = `
  You are an AI assistant for a book website called Ogiesoba Books.
  You help visitors learn about available books, their authors, prices, and how to pay.

  Here’s the summary of available books:
  ${bookSummaries}

  Here’s the detailed JSON data for reference:
  ${JSON.stringify(books, null, 2)}

  ${paymentInfo}

  Always answer politely, using only the data provided above.
  If a user asks something unrelated to the books or payments, tell them you only assist with book-related information.
  `;

    // Send to Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // ✅ Groq model
          messages: [
            {
              role: "system",
              content: "You are the Azimi Koko Booksite AI assistant.",
            },
            {
              role: "user",
              content: `Context:\n${context}\n\nUser question: ${message}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // ✅ Defensive check
    const aiReply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't get a response from the AI right now.";

    // ✅ Remove escaped quotes for cleaner display
    const cleanReply = aiReply.replace(/\\"/g, '"');

    // Debug in console (optional)
    console.log("Groq response:", JSON.stringify(data, null, 2));
    res.json({ reply: cleanReply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      reply: "Something went wrong while processing your request.",
      error: error.message,
    });
  }
});

// ✅ Export router
export default router;
