// --- generateEnquiryPDF.js ---
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function generateEnquiryPDF(data, outputFilePath) {
  // ---------------------------
  // 1. Decide Which HTML Template to Use
  // ---------------------------
  let templateFileName;

  if (data.isBE) {
    templateFileName = "enquiryFormTemplate.html";
  } else if (data.isLateral) {
    templateFileName = "lateralFormTemplate.html";
  } else if (data.isME) {
    templateFileName = "meFormTemplate.html";
  } else {
    templateFileName = "enquiryFormTemplate.html"; 
  }

  const templatePath = path.join(
    __dirname,
    `pdfTemplates/${templateFileName}`
  );

  // Load selected HTML template
  let template = fs.readFileSync(templatePath, "utf-8");

  // ---------------------------
  // 2. Replace placeholders safely (NO regex)
  // ---------------------------
  for (const [key, value] of Object.entries(data)) {
    template = template.split(`{{${key}}}`).join(String(value ?? ""));
  }

  // ---------------------------
  // 3. Generate PDF with Puppeteer
  // ---------------------------
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-zygote"
    ],
  });

  const page = await browser.newPage();

  await page.setContent(template, { waitUntil: "domcontentloaded" });

  // Wait for fonts to load (older Puppeteer behaviour)
  await page.evaluate(() => {
    if (document.fonts) return document.fonts.ready;
    return Promise.resolve();
  });

  await page.pdf({
    path: outputFilePath,
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
}

module.exports = generateEnquiryPDF;




// // --- localcode ---
// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");

// async function generateEnquiryPDF(data, outputFilePath) {
//   let templateFileName;
  
//   if (data.isBE) {
//     templateFileName = "enquiryFormTemplate.html";
//   } else if (data.isLateral) {
//     templateFileName = "lateralFormTemplate.html";
//   } else if (data.isME) {
//     templateFileName = "meFormTemplate.html";
//   } else {
//     templateFileName = "enquiryFormTemplate.html"; 
//   }

//   const templatePath = path.join(
//     __dirname,
//     `pdfTemplates/${templateFileName}`
//   );

//   let template = fs.readFileSync(templatePath, "utf-8");

//   // Safe placeholder replacement (no regex!)
//   for (const [key, value] of Object.entries(data)) {
//     template = template.split(`{{${key}}}`).join(String(value ?? ""));
//   }

//   const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-dev-shm-usage"
//     ],
//   });

//   const page = await browser.newPage();

//   // Load HTML safely
//   await page.setContent(template, { waitUntil: "domcontentloaded" });

//   // Wait for fonts to fully load (old Puppeteer behavior)
//   await page.evaluate(() => {
//     if (document.fonts) {
//       return document.fonts.ready;
//     }
//     return Promise.resolve();
//   });

//   await page.pdf({
//     path: outputFilePath,
//     format: "A4",
//     printBackground: true,
//     margin: { top: 0, right: 0, bottom: 0, left: 0 },
//   });

//   await browser.close();
// }

// module.exports = generateEnquiryPDF;
