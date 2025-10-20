import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.get("/", async (req, res) => {
  const { reference, book } = req.query;

  if (!reference || !book) {
    return res.redirect(`https://www.azimikoko.com/payment-failed`);
  }

  try {
    const verify = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    if (verify.data.data.status === "success") {
      // Generate JWT token valid for 5 minutes
      const token = jwt.sign({ book }, JWT_SECRET, { expiresIn: "10m" });

      // Redirect frontend with token and book
      return res.redirect(
        `https://www.azimikoko.com/payment-success?token=${token}&book=${book}`
      );
    } else {
      return res.redirect(`https://www.azimikoko.com/payment-failed`);
    }
  } catch (err) {
    console.error(err);
    return res.redirect(`https://www.azimikoko.com/payment-failed`);
  }
});

export default router;
