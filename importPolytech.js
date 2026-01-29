import mongoose from "mongoose";
import xlsx from "xlsx";
import Polytech from "./models/PolyTech.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB (NO deprecated options)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Read Excel file (single column)
const workbook = xlsx.readFile("C:/Users/Abishek K/Downloads/School_College_DB.xlsx");
const sheetName = workbook.SheetNames[1];
const sheet = workbook.Sheets[sheetName];

// Convert sheet to JSON as array of arrays
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

async function importPolytech() {
  try {
    let added = 0;
    for (const row of rows) {
      const polytechName = row[0]?.toString().trim(); // first column, trim spaces
      if (polytechName) {
        const exists = await Polytech.findOne({ polytech_name: polytechName });
        if (!exists) {
          await Polytech.create({ polytech_name: polytechName });
          added++;
          console.log(`Added: ${polytechName}`);
        }
      }
    }
    console.log(`Done! Total new colleges added: ${added}`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importPolytech();
