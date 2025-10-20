import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import paystackRoutes from "./routes/paystack.js";
import groqAIRoutes from "./routes/groqAi.js";
import downloadRoutes from "./routes/download.js";
import successRoutes from "./routes/success.js";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://frontend-booksite.vercel.app", // old frontend (keep for testing)
      "https://azimikoko.com", // ✅ new custom domain
      "https://www.azimikoko.com", // ✅ www version
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Routes
app.use("/api/paystack", paystackRoutes);
app.use("/", groqAIRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/success", successRoutes);

// ✅ Serve static books folder
app.use("/books", express.static(path.join(__dirname, "books")));

const PORT = process.env.PORT || 8080; // ✅ use 8080 for Railway
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
