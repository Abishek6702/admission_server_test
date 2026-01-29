const Enquiry = require("../models/Enquiry");
const ExcelJS = require("exceljs");
const renderTemplate = require("../utils/templateHandler");
const sendMail = require("../utils/sendMail");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const renderPdf = require("../utils/pdfTemplates/enquiryPdf");
const generateEnquiryPDF = require("../utils/generateEnquiryPDF");
const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary").v2;

function preprocessEnquiryData(enquiry) {
  const d = { ...enquiry };
  d.addressCombined = d.address
    ? [
        d.address.doorNo,
        d.address.street,
        d.address.taluk,
        d.address.district,
        d.address.state,
        d.address.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  d.dob = d.dob ? new Date(d.dob).toLocaleDateString("en-IN") : "";
  d.dateOfVisit = d.dateOfVisit
    ? new Date(d.dateOfVisit).toLocaleDateString("en-IN")
    : "";
  d.courseRequiredCombined = Array.isArray(d.courseRequired)
    ? d.courseRequired.filter(Boolean).join(", ")
    : "";

  const tm = d.twelfthMarks || {};
  d.maths = tm.maths != null ? tm.maths : "";
  d.physics = tm.physics != null ? tm.physics : "";
  d.chemistry = tm.chemistry != null ? tm.chemistry : "";
  d.vocationalIfAny = tm.vocationalIfAny != null ? tm.vocationalIfAny : "";
  d.cutOff = tm.cutOff != null ? tm.cutOff : "";
  d.total = tm.total != null ? tm.total : "";
  d.isFirstGraduate = d.isFirstGraduate ? "Yes" : "No";

  d.fatherWorkType = d.fatherWorkType || "";
  d.fatherNatureOfWork = d.fatherNatureOfWork || "";
  d.motherWorkType = d.motherWorkType || "";
  d.motherNatureOfWork = d.motherNatureOfWork || "";

  // School Name Logic
  d.twelfthSchoolNameDisplay =
    d.twelfthSchoolName === "Others" ? d.schoolName : d.twelfthSchoolName;

  // College Name Logic
  d.CollegeNameDisplay =
    d.ugCollegeName === "Others" ? d.collegeName : d.ugCollegeName;

  // ✅ FIX THIS: Display custom name when "Others" is selected
  d.PolytechNameDisplay =
    d.polytechnicName === "Others"
      ? d.polytechnicCollegeName
      : d.polytechnicName;

  d.isBE = d.courseEntryType === "I Year B.E / B.Tech";
  d.isLateral = d.courseEntryType === "Lateral Entry";
  d.isME = d.courseEntryType === "I Year M.E";
  if (d.isBE) d.admissionTitle = "(1st Year)";
  else if (d.isLateral) d.admissionTitle = "(Lateral Entry)";
  else if (d.isME) d.admissionTitle = "(Post Graduate)";
  else d.admissionTitle = "";
  d.beOnlyDisplay = d.isBE ? "table" : "none";
  d.lateralOnlyDisplay = d.isLateral ? "table" : "none";
  d.meOnlyDisplay = d.isME ? "table" : "none";

  return d;
}
// Add new admission enquiry form
exports.createEnquiry = async (req, res) => {
  console.log("1");
  try {
    const {
      studentEmail,
      studentMobile,
      // fatherEmail,
      // fatherMobile,
      // motherEmail,
      // motherMobile,
    } = req.body;
    console.log("working");

    // Validating to prevent duplicate entries based on email and mobile
    const existing = await Enquiry.findOne({
      $or: [
        { studentEmail },
        { studentMobile },
        // { fatherEmail },
        // { fatherMobile },
        // { motherEmail },
        // { motherMobile },
      ],
    });
    console.log(existing);

    if (existing) {
      return res
        .status(400)
        .json({ message: "Duplicate entry: Email or Mobile already exists" });
    }
    console.log("2");

    const enquiry = new Enquiry(req.body);
    await enquiry.save();

    // pdf saving for future reference
    const uploadsDir = path.join(__dirname, "../uploads/enquiries");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    console.log("Uploads Directory:", uploadsDir);

    const fileName = `enquiry_${enquiry.studentName}.pdf`;

    const filePath = path.join(uploadsDir, fileName);
    const data = preprocessEnquiryData(enquiry.toObject());
    console.log("3");

    await generateEnquiryPDF(data, filePath);
    console.log("4");

    // Upload to Cloudinary
    const pdfUploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "enquiry_pdfs",
    });
    fs.unlinkSync(filePath);

    enquiry.enquiryPdfUrl = pdfUploadResult.secure_url;
    enquiry.enquiryPdfPublicId = pdfUploadResult.public_id;
    await enquiry.save();

    // const html = renderTemplate("enquiry", req.body);
    // await sendMail(
    //   req.body.studentEmail,
    //   "Your SECE Admission Enquiry",
    //   html,
    //   filePath
    // );

    res.status(201).json({
      message: "Enquiry created and email sent with PDF attached",
      enquiry,
      pdfUrl: enquiry.enquiryPdfUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all the enquiries
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get enquiry of particular id
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update enquiry status
// Update enquiry status AND other fields
exports.updateEnquiryStatus = async (req, res) => {
  try {
    // Destructure fields you want to allow updating
    const {
      status,
      allocatedStaff,
      amount,
      feesPaid,
      hasScholarship,
      scholarshipType,
      transactionNo,
      finalizedCourse,
      allocatedQuota,
      rejectRemark,
    } = req.body;

    // Validate status if provided
    if (status && !["Pending", "Selected", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Build update object dynamically
    const update = {};
    if (status) update.status = status;
    if (allocatedStaff !== undefined) update.allocatedStaff = allocatedStaff;
    if (amount !== undefined) update.amount = amount;
    if (feesPaid !== undefined) update.feesPaid = feesPaid;
    if (hasScholarship !== undefined) update.hasScholarship = hasScholarship;
    if (scholarshipType !== undefined) update.scholarshipType = scholarshipType;
    if (transactionNo !== undefined) update.transactionNo = transactionNo;
    if (finalizedCourse !== undefined) update.finalizedCourse = finalizedCourse;
    if (allocatedQuota !== undefined) update.allocatedQuota = allocatedQuota;
    if (rejectRemark !== undefined) update.rejectRemark = rejectRemark;

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update bulk ststus
exports.bulkUpdateEnquiryStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    // Validate inputs
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids must be a non-empty array" });
    }

    if (!["Pending", "Selected", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update multiple documents at once
    const result = await Enquiry.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    res.json({
      message: "Status updated successfully",
      matchedCount: result.matchedCount, // how many matched
      modifiedCount: result.modifiedCount, // how many actually updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Export enquiries to Excel
// exports.exportEnquiries = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     let enquiries;
//     if (ids && ids.length > 0) {
//       enquiries = await Enquiry.find({ _id: { $in: ids } }).lean();
//     } else {
//       enquiries = await Enquiry.find().lean();
//     }

//     if (!enquiries || enquiries.length === 0) {
//       return res.status(404).json({ message: "No enquiries found" });
//     }

//     // Create workbook & sheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Enquiries");

//     // Dynamically get all unique keys from the documents
//     const allKeys = new Set();
//     enquiries.forEach((doc) => {
//       Object.keys(doc).forEach((key) => allKeys.add(key));
//     });

//     const columns = Array.from(allKeys).map((key) => ({
//       header: key,
//       key,
//       width: 25,
//     }));

//     worksheet.columns = columns;

//     // Add rows
//     enquiries.forEach((doc) => {
//       worksheet.addRow(doc);
//     });

//     // Set response headers
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", "attachment; filename=enquiries.xlsx");

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Export error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// Enquiry Card Data
exports.getEnquiryStats = async (req, res) => {
  try {
    const TYPES = {
      BE: "I Year B.E / B.Tech",
      LATERAL: "Lateral Entry",
      ME: "I Year M.E",
    };

    // Helper function to get stats for one course type
    const getTypeStats = async (type) => {
      const total = await Enquiry.countDocuments({ courseEntryType: type });

      const selected = await Enquiry.countDocuments({
        courseEntryType: type,
        status: { $in: ["Selected", "UserCreated"] },
      });

      const pending = await Enquiry.countDocuments({
        courseEntryType: type,
        status: "Pending",
      });

      const rejected = await Enquiry.countDocuments({
        courseEntryType: type,
        status: "Rejected",
      });

      return { total, selected, pending, rejected };
    };

    // Fetch all 3 categories
    const beStats = await getTypeStats(TYPES.BE);
    const lateralStats = await getTypeStats(TYPES.LATERAL);
    const meStats = await getTypeStats(TYPES.ME);

    res.json({
      BE: beStats,
      LATERAL: lateralStats,
      ME: meStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addRevisit = async (req, res) => {
  try {
    const { date, visitedBy } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    enquiry.revisits.push({ date, visitedBy });

    if (!enquiry.revisited && enquiry.revisits.length === 1) {
      enquiry.revisited = true;
    }

    await enquiry.save();

    res.json({
      message: "Revisit recorded successfully",
      revisited: enquiry.revisited,
      revisits: enquiry.revisits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevisitedCount = async (req, res) => {
  try {
    const revisitedCount = await Enquiry.countDocuments({ revisited: true });
    res.json({ revisitedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = req.body;

    const existingEnquiry = await Enquiry.findById(id);
    if (!existingEnquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    // Fields to exclude from update
    const excludeFields = [
      "_id",
      "__v",
      "createdAt",
      "updatedAt",
      "enquiryPdfUrl",
      "enquiryPdfPublicId",
    ];

    // Copy all fields except excluded ones
    const updateData = {};
    for (const key in bodyData) {
      if (!excludeFields.includes(key)) updateData[key] = bodyData[key];
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Failed to update enquiry",
      });
    }

    // Delete old PDF from Cloudinary if exists
    if (existingEnquiry.enquiryPdfPublicId) {
      await cloudinary.uploader.destroy(existingEnquiry.enquiryPdfPublicId, {
        resource_type: "raw",
      });
    }

    // Generate new PDF and upload to Cloudinary
    const fileName = `enquiry_${updatedEnquiry.studentName}_${Date.now()}.pdf`;
    const tempFolder = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempFolder))
      fs.mkdirSync(tempFolder, { recursive: true });
    const filePath = path.join(tempFolder, fileName);
    const pdfData = preprocessEnquiryData(updatedEnquiry.toObject());
    await generateEnquiryPDF(pdfData, filePath);

    const pdfUploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "enquiry_pdfs",
    });
    fs.unlinkSync(filePath);

    updatedEnquiry.enquiryPdfUrl = pdfUploadResult.secure_url;
    updatedEnquiry.enquiryPdfPublicId = pdfUploadResult.public_id;
    await updatedEnquiry.save();

    res.status(200).json({
      success: true,
      message: "Enquiry updated and PDF regenerated in Cloudinary",
      data: updatedEnquiry,
      pdfUrl: updatedEnquiry.enquiryPdfUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating enquiry",
      error: error.message,
    });
  }
};

// Update enquiry by ID
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = req.body;

    // 1️⃣ Find existing enquiry
    const existingEnquiry = await Enquiry.findById(id);
    if (!existingEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    // 2️⃣ Prepare update data (exclude special fields)
    const excludeFields = [
      "_id",
      "__v",
      "createdAt",
      "updatedAt",
      "enquiryPdfUrl",
      "enquiryPdfPublicId",
    ];

    const updateData = {};
    for (const key in bodyData) {
      if (!excludeFields.includes(key)) {
        updateData[key] = bodyData[key];
      }
    }

    // 3️⃣ Update enquiry in DB
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // 4️⃣ Generate new PDF locally (temporary)
    const tempDir = path.join(__dirname, "../temp_pdfs");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `enquiry_${updatedEnquiry.studentName}_${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);

    const data = preprocessEnquiryData(updatedEnquiry.toObject());
    await generateEnquiryPDF(data, filePath);

    // 5️⃣ Delete old Cloudinary PDF if exists
    if (existingEnquiry.enquiryPdfPublicId) {
      try {
        await cloudinary.uploader.destroy(existingEnquiry.enquiryPdfPublicId, {
          resource_type: "raw",
        });
        console.log(
          "🗑️ Old Cloudinary PDF deleted:",
          existingEnquiry.enquiryPdfPublicId
        );
      } catch (err) {
        console.warn(
          "⚠️ Could not delete old PDF from Cloudinary:",
          err.message
        );
      }
    }

    // 6️⃣ Upload new PDF to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "enquiry_pdfs",
    });

    // 7️⃣ Delete local temporary file
    fs.unlinkSync(filePath);

    // 8️⃣ Update DB with new Cloudinary info
    updatedEnquiry.enquiryPdfUrl = uploadResult.secure_url;
    updatedEnquiry.enquiryPdfPublicId = uploadResult.public_id;
    await updatedEnquiry.save();

    console.log(
      "✅ New enquiry PDF uploaded to Cloudinary:",
      uploadResult.secure_url
    );

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully and PDF regenerated",
      data: updatedEnquiry,
      pdfUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating enquiry",
      error: error.message,
    });
  }
};

function buildQuery({
  categoryFilter,
  graduateFilter,
  statusFilter,
  cutOffFilter,
  dateFilter,
  search,
}) {
  const q = {};
  if (categoryFilter) q.community = categoryFilter;
  if (graduateFilter) q.isFirstGraduate = graduateFilter === "Yes";
  if (statusFilter) q.status = statusFilter;
  if (cutOffFilter) {
    if (cutOffFilter.from !== "")
      q["twelfthMarks.cutOff"] = {
        ...q["twelfthMarks.cutOff"],
        $gte: Number(cutOffFilter.from),
      };
    if (cutOffFilter.to !== "")
      q["twelfthMarks.cutOff"] = {
        ...q["twelfthMarks.cutOff"],
        $lte: Number(cutOffFilter.to),
      };
  }
  if (dateFilter) {
    if (dateFilter.from)
      q.dateOfVisit = { ...q.dateOfVisit, $gte: new Date(dateFilter.from) };
    if (dateFilter.to)
      q.dateOfVisit = { ...q.dateOfVisit, $lte: new Date(dateFilter.to) };
  }
  if (search) q.studentName = { $regex: search, $options: "i" };
  return q;
}

exports.pdfGenerate = async (req, res) => {
  try {
    const filters = req.body || {};
    let enquiries;
    // If selectedIds is present, use ONLY those for export
    if (
      filters.selectedIds &&
      Array.isArray(filters.selectedIds) &&
      filters.selectedIds.length > 0
    ) {
      enquiries = await Enquiry.find({
        _id: { $in: filters.selectedIds },
      }).select(
        "enquiryId studentName community isFirstGraduate twelfthMarks dateOfVisit status"
      );
    } else {
      // Otherwise, use filters as before
      const query = buildQuery(filters);
      enquiries = await Enquiry.find(query).select(
        "enquiryId studentName community isFirstGraduate twelfthMarks dateOfVisit status"
      );
    }
    // Build HTML table, matching your UI minus Action column
    const tableRows = enquiries
      .map(
        (enq) => `
      <tr>
        <td>${enq.enquiryId}</td>
        <td>${enq.studentName}</td>
        <td>${enq.community}</td>
        <td>${enq.isFirstGraduate ? "Yes" : "No"}</td>
        <td>${enq.twelfthMarks?.cutOff || ""}</td>
        <td>${
          enq.dateOfVisit
            ? new Date(enq.dateOfVisit).toISOString().split("T")[0]
            : ""
        }</td>
        <td>${enq.status}</td>
      </tr>
    `
      )
      .join("");

    // Full HTML document
    const html = `
<html>
  <head>
    <style>
      @media print {
        body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 0;
        }
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12px;
        margin: 30px 20px;
        background: #fff;
      }
      h2 {
        color: #0b56a4;
        text-align: center;
        font-size: 2rem;
        margin-bottom: 16px;
        font-family: 'Times New Roman', Times, serif;
      }
      table {
        width: 95%;
        margin:auto;
        max-width: 95%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 10px 6px;
        text-align: left;
        font-size: 12px;
        font-family: 'Times New Roman', Times, serif;
        word-break: break-word;
      }
      th {
        background: #0b56a4;
        color: #fff;
        font-weight: bold;
        font-size: 13px;
        font-family: 'Times New Roman', Times, serif;
      }
      /* Ensure column widths are consistent and status doesn't wrap badly */
      th, td {
        width: 14.29%;
      }
      tr:nth-child(even) {
        background: #f6f8fa;
      }
      tr:nth-child(odd) {
        background: #fff;
      }
    </style>
  </head>
  <body>
    <h2>Enquiry List</h2>
    <table>
      <thead>
        <tr>
          <th>Enquiry ID</th>
          <th>Name</th>
          <th>Community</th>
          <th>First Graduate</th>
          <th>Cutoff</th>
          <th>Date of Visit</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <!-- TABLE ROWS INSERTED HERE -->
        ${tableRows}
      </tbody>
    </table>
  </body>
</html>

`;

    // Render HTML as PDF via Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      // use for local
      // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote"
      ],
    });


    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Get PDF buffer from page
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    const tempFolder = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);

    const tempFileName = `bulk_enquiries_${Date.now()}.pdf`;
    const tempFilePath = path.join(tempFolder, tempFileName);

    // Save buffer to temp file
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "raw",
      folder: "enquiry_pdfs",
    });

    fs.unlinkSync(tempFilePath);

    // Now you may send the Cloudinary URL or buffer as needed.
    // For sending buffer download:
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="enquiries.pdf"'
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

exports.ScholarPdfGenerate = async (req, res) => {
  try {
    const filters = req.body || {};
    let enquiries;
    // If selectedIds is present, use ONLY those for export
    if (
      filters.selectedIds &&
      Array.isArray(filters.selectedIds) &&
      filters.selectedIds.length > 0
    ) {
      enquiries = await Enquiry.find({
        _id: { $in: filters.selectedIds },
      }).select(
        "enquiryId studentName community feesPaid allocatedStaff dateOfVisit status"
      );
    } else {
      // Otherwise, use filters as before
      const query = buildQuery(filters);
      enquiries = await Enquiry.find(query).select(
        "enquiryId studentName community feesPaid allocatedStaff dateOfVisit status"
      );
    }
    // Build HTML table, matching your UI minus Action column
    const tableRows = enquiries
      .map(
        (enq) => `
      <tr>
        <td>${enq.enquiryId}</td>
        <td>${enq.studentName}</td>
        <td>${enq.community}</td>
        <td>${enq.feesPaid ? "Yes" : "No"}</td>
        <td>${enq.allocatedStaff}</td>
        <td>${
          enq.dateOfVisit
            ? new Date(enq.dateOfVisit).toISOString().split("T")[0]
            : ""
        }</td>
        <td>${enq.status}</td>
      </tr>
    `
      )
      .join("");

    // Full HTML document
    const html = `
<html>
  <head>
    <style>
      @media print {
        body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 0;
        }
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12px;
        margin: 30px 20px;
        background: #fff;
      }
      h2 {
        color: #0b56a4;
        text-align: center;
        font-size: 2rem;
        margin-bottom: 16px;
        font-family: 'Times New Roman', Times, serif;
      }
      table {
        width: 95%;
        margin:auto;
        max-width: 95%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 10px 6px;
        text-align: left;
        font-size: 12px;
        font-family: 'Times New Roman', Times, serif;
        word-break: break-word;
      }
      th {
        background: #0b56a4;
        color: #fff;
        font-weight: bold;
        font-size: 13px;
        font-family: 'Times New Roman', Times, serif;
      }
      /* Ensure column widths are consistent and status doesn't wrap badly */
      th, td {
        width: 14.29%;
      }
      tr:nth-child(even) {
        background: #f6f8fa;
      }
      tr:nth-child(odd) {
        background: #fff;
      }
    </style>
  </head>
  <body>
    <h2>Enquiry List</h2>
    <table>
      <thead>
        <tr>
          <th>Enquiry ID</th>
          <th>Name</th>
          <th>Community</th>
          <th>Fees Paid</th>
          <th>Allocated Staff</th>
          <th>Date of Visit</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <!-- TABLE ROWS INSERTED HERE -->
        ${tableRows}
      </tbody>
    </table>
  </body>
</html>

`;

    // Render HTML as PDF via Puppeteer
    // Launch Puppeteer and render HTML to page
    const browser = await puppeteer.launch({
      headless: true,
      // use for local
      // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote"
      ],
    });


    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF buffer — MISSING in your code currently
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    // Now save buffer to temp file
    const tempFolder = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);

    const tempFileName = `scholar_enquiries_${Date.now()}.pdf`;
    const tempFilePath = path.join(tempFolder, tempFileName);

    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "raw",
      folder: "enquiry_pdfs",
    });

    fs.unlinkSync(tempFilePath);

    // Option to send back Cloudinary URL OR stream buffer
    // Here you are streaming buffer for download:
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="enquiries.pdf"'
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
exports.getScholarshipCount = async (req, res) => {
  try {
    // Count enquiries with and without scholarship
    const [scholarshipCount, nonScholarshipCount] = await Promise.all([
      Enquiry.countDocuments({ hasScholarship: true }),
      Enquiry.countDocuments({ hasScholarship: false }),
    ]);

    res.status(200).json({
      scholarshipCount,
      nonScholarshipCount,
    });
  } catch (error) {
    console.error("Error fetching scholarship counts:", error);
    res.status(500).json({ message: "Failed to fetch scholarship counts" });
  }
};



// FORMATTER (same as before)
function formatEnquiryForExcel(enquiry) {
  const e = enquiry;

  return {
    "Enquiry ID": e.enquiryId ?? "",
    "Course Entry Type": e.courseEntryType ?? "",
    "Student Name": e.studentName ?? "",
    "Date of Birth": e.dob ? new Date(e.dob).toLocaleDateString("en-IN") : "",
    Gender: e.gender ?? "",
    Community: e.community ?? "",

    "Door No": e.address?.doorNo ?? "",
    Street: e.address?.street ?? "",
    Taluk: e.address?.taluk ?? "",
    District: e.address?.district ?? "",
    State: e.address?.state ?? "",
    Pincode: e.address?.pincode ?? "",
    "12th School Name": e.twelfthSchoolName ?? "",
    "12th School Address": e.twelfthSchoolAddress ?? "",
    "12th School Board": e.twelfthSchoolBoard ?? "",
    "12th Register No": e.twelfthRegisterNo ?? "",

    Maths: e.twelfthMarks?.maths ?? "",
    Physics: e.twelfthMarks?.physics ?? "",
    Chemistry: e.twelfthMarks?.chemistry ?? "",
    "Vocational Marks": e.twelfthMarks?.vocationalIfAny ?? "",
    "Total Marks": e.twelfthMarks?.total ?? "",
    "Cut-Off": e.twelfthMarks?.cutOff ?? "",

    "10th School Board": e.tenthSchoolBoard ?? "",
    "10th Marks": e.tenthMarks ?? "",

    "Student Email": e.studentEmail ?? "",
    "Student Mobile": e.studentMobile ?? "",
    "Father Name": e.fatherName ?? "",
    "Father Mobile": e.fatherMobile ?? "",
    "Mother Name": e.motherName ?? "",
    "Mother Mobile": e.motherMobile ?? "",

    "Course Required": Array.isArray(e.courseRequired)
      ? e.courseRequired.join(", ")
      : "",

    "Date of Visit": e.dateOfVisit
      ? new Date(e.dateOfVisit).toLocaleDateString("en-IN")
      : "",
  };
}

exports.exportEnquiries = async (req, res) => {
  try {
    const { ids } = req.body;

    let enquiries;

    // KEEP OLD LOGIC  (unchanged)
    if (ids && ids.length > 0) {
      enquiries = await Enquiry.find({ _id: { $in: ids } }).lean();
    } else {
      enquiries = await Enquiry.find().lean();
    }

    if (!enquiries || enquiries.length === 0) {
      return res.status(404).json({ message: "No enquiries found" });
    }

    // Create workbook & sheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Enquiries");

    // Apply formatter to every enquiry
    const formattedRows = enquiries.map((e) => formatEnquiryForExcel(e));

    // Get header from keys of first row (ordered!)
    const header = Object.keys(formattedRows[0]);
    sheet.addRow(header);

    // Add each enquiry row
    formattedRows.forEach((row) => {
      sheet.addRow(Object.values(row));
    });

    // Format columns
    sheet.columns.forEach((col) => {
      col.width = 22;
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=enquiries.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: error.message });
  }
};
