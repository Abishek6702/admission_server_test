const Application = require("../models/Application");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const renderTemplate = require("../utils/templateHandler");
const sendMail = require("../utils/sendMail");
const applicationPdf = require("../utils/pdfTemplates/applicationPdf");
const ExcelJS = require("exceljs");

const baseUrl = process.env.BASE_URL || "http://localhost:5000";
const normalizePath = (filePath) => filePath.replace(/\\/g, "/");
const diffFields = require("../utils/diffFields");
const { deprecate } = require("util");
const cloudinary = require("cloudinary").v2;

// 📦 Helper: Upload file(s) to Cloudinary and return URLs
// 📦 Helper: Upload file(s) to Cloudinary and return URLs
const uploadToCloudinary = async (files, folder) => {
  const uploadedUrls = [];

  for (const file of files) {
    const filePath = file.path;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // handles images, pdf, etc.
    });

    uploadedUrls.push(result.secure_url);

    // Delete local file only if it’s a real local path
    if (filePath && fs.existsSync(filePath) && !filePath.startsWith("http")) {
      fs.unlinkSync(filePath);
    }
  }

  return uploadedUrls;
};

exports.createApplication = async (req, res) => {
  console.log("application creation passed stage 1");

  try {
    const bodyData = req.body;
    const userId = bodyData.userId;

    // 1️⃣ Check if an application already exists
    const existingApp = await Application.findOne({ userId });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: "Application already exists for this user",
        data: existingApp,
      });
    }
    console.log("application creation passed stage 2");

    // 2️⃣ Map uploaded files
    if (req.files) {
      if (req.files.studentPhoto)
        bodyData.studentPhoto = await uploadToCloudinary(
          req.files.studentPhoto,
          "application_photos"
        );
      if (req.files.fatherPhoto)
        bodyData.fatherPhoto = await uploadToCloudinary(
          req.files.fatherPhoto,
          "application_photos"
        );
      if (req.files.motherPhoto)
        bodyData.motherPhoto = await uploadToCloudinary(
          req.files.motherPhoto,
          "application_photos"
        );
      if (req.files.tenthMarkSheet)
        bodyData.tenthMarkSheet = (
          await uploadToCloudinary(req.files.tenthMarkSheet, "application_docs")
        )[0];
      if (req.files.eleventhMarkSheet)
        bodyData.eleventhMarkSheet = (
          await uploadToCloudinary(
            req.files.eleventhMarkSheet,
            "application_docs"
          )
        )[0];
      if (req.files.twelthMarkSheet)
        bodyData.twelthMarkSheet = (
          await uploadToCloudinary(
            req.files.twelthMarkSheet,
            "application_docs"
          )
        )[0];
      //ug
      if (req.files.ugConsolidatedMarkSheet)
        bodyData.ugConsolidatedMarkSheet = (
          await uploadToCloudinary(
            req.files.ugConsolidatedMarkSheet,
            "application_docs"
          )
        )[0];
      if (req.files.ugCourseCompletion)
        bodyData.ugCourseCompletion = (
          await uploadToCloudinary(
            req.files.ugCourseCompletion,
            "application_docs"
          )
        )[0];
      if (req.files.ugProvisional)
        bodyData.ugProvisional = (
          await uploadToCloudinary(req.files.ugProvisional, "application_docs")
        )[0];
      if (req.files.ugDegree)
        bodyData.ugDegree = (
          await uploadToCloudinary(req.files.ugDegree, "application_docs")
        )[0];
      //polytechnic
      if (req.files.polytechnicMarkSheet)
        bodyData.polytechnicMarkSheet = (
          await uploadToCloudinary(
            req.files.polytechnicMarkSheet,
            "application_docs"
          )
        )[0];
      if (req.files.diplomaCourseCompletion)
        bodyData.diplomaCourseCompletion = (
          await uploadToCloudinary(
            req.files.diplomaCourseCompletion,
            "application_docs"
          )
        )[0];
      if (req.files.diplomaProvisional)
        bodyData.diplomaProvisional = (
          await uploadToCloudinary(
            req.files.diplomaProvisional,
            "application_docs"
          )
        )[0];
      if (req.files.diplomaDegree)
        bodyData.diplomaDegree = (
          await uploadToCloudinary(req.files.diplomaDegree, "application_docs")
        )[0];
         if (req.files.diplomaMarkSheet1)
        bodyData.diplomaMarkSheet1 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet1, "application_docs")
        )[0];
         if (req.files.diplomaMarkSheet2)
        bodyData.diplomaMarkSheet2 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet2, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet3)
        bodyData.diplomaMarkSheet3 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet3, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet4)
        bodyData.diplomaMarkSheet4 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet4, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet5)
        bodyData.diplomaMarkSheet5 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet5, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet6)
        bodyData.diplomaMarkSheet6 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet6, "application_docs")
        )[0];


           if (req.files.ugMarkSheet1)
        bodyData.ugMarkSheet1 = (
          await uploadToCloudinary(req.files.ugMarkSheet1, "application_docs")
        )[0];
         if (req.files.ugMarkSheet2)
        bodyData.ugMarkSheet2 = (
          await uploadToCloudinary(req.files.ugMarkSheet2, "application_docs")
        )[0];
        if (req.files.ugMarkSheet3)
        bodyData.ugMarkSheet3 = (
          await uploadToCloudinary(req.files.ugMarkSheet3, "application_docs")
        )[0];
        if (req.files.ugMarkSheet4)
        bodyData.ugMarkSheet4 = (
          await uploadToCloudinary(req.files.ugMarkSheet4, "application_docs")
        )[0];
        if (req.files.ugMarkSheet5)
        bodyData.ugMarkSheet5 = (
          await uploadToCloudinary(req.files.ugMarkSheet5, "application_docs")
        )[0];
        if (req.files.ugMarkSheet6)
        bodyData.ugMarkSheet6 = (
          await uploadToCloudinary(req.files.ugMarkSheet6, "application_docs")
        )[0];
        if (req.files.ugMarkSheet7)
        bodyData.ugMarkSheet7 = (
          await uploadToCloudinary(req.files.ugMarkSheet7, "application_docs")
        )[0];
        if (req.files.ugMarkSheet8)
        bodyData.ugMarkSheet8 = (
          await uploadToCloudinary(req.files.ugMarkSheet8, "application_docs")
        )[0];

      if (req.files.transferCertificate)
        bodyData.transferCertificate = (
          await uploadToCloudinary(
            req.files.transferCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.communityCertificate)
        bodyData.communityCertificate = (
          await uploadToCloudinary(
            req.files.communityCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.incomeCertificate)
        bodyData.incomeCertificate = (
          await uploadToCloudinary(
            req.files.incomeCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.migrationCertificate)
        bodyData.migrationCertificate = (
          await uploadToCloudinary(
            req.files.migrationCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.aadharCopy)
        bodyData.aadharCopy = (
          await uploadToCloudinary(req.files.aadharCopy, "application_docs")
        )[0];
      if (req.files.allotmentOrder)
        bodyData.allotmentOrder = (
          await uploadToCloudinary(req.files.allotmentOrder, "application_docs")
        )[0];
      if (req.files.firstGraduateCertificate)
        bodyData.firstGraduateCertificate = (
          await uploadToCloudinary(
            req.files.firstGraduateCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.declarationForm)
        bodyData.declarationForm = (
          await uploadToCloudinary(
            req.files.declarationForm,
            "application_docs"
          )
        )[0];
      if (req.files.physicalFitnessForm)
        bodyData.physicalFitnessForm = (
          await uploadToCloudinary(
            req.files.physicalFitnessForm,
            "application_docs"
          )
        )[0];
    }
    console.log("application creation passed stage 3");
    console.log("bodydata", bodyData.Quota);

    bodyData.fatherPhotoReason = bodyData.fatherPhotoReason || "";
    bodyData.motherPhotoReason = bodyData.motherPhotoReason || "";

    // 3️⃣ Create and save application
    const application = new Application(bodyData);
    await application.save();

    // 4️⃣ Update user with application _id
    await User.findByIdAndUpdate(userId, { application: application._id });
    await User.findByIdAndUpdate(userId, { firstTimeLogin: false });
    console.log("application creation passed stage 4");

    // 5️⃣ Generate PDF and save
    const fileName = `application_${application.studentName}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../temp", fileName);
    await applicationPdf(application, filePath);

    // Upload PDF to Cloudinary
    const pdfUploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "application_pdfs", // optional Cloudinary folder
    });
    console.log("application creation passed stage 5");

    // Save Cloudinary details
    application.applicationPdfUrl = pdfUploadResult.secure_url;
    application.applicationPdfPublicId = pdfUploadResult.public_id;
    await application.save();

    // You can create a custom PDF template function like renderPdfApplication
    // await applicationPdf(application, filePath);

    const html = renderTemplate("application", application);
    await sendMail(
      application.selfEmail,
      "Your Application Submission - SECE Admission",
      html,
      filePath
    );
    console.log("application creation passed stage 6");

    // Remove local PDF file
    fs.unlinkSync(filePath);
    res.status(201).json({
      success: true,
      message: "Application created, PDF generated, and email sent",
      data: application,
      pdfUrl: application.applicationPdfUrl,
    });
    console.log("application creation passed stage 7");
  } catch (error) {
    console.error("ERROR CREATING APPLICATION:");
    console.error(error);
    console.error(error.message);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: "Error creating application",
      error: error.message,
      stack: error.stack,
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = req.body;

    // Find existing application
    const existingApp = await Application.findById(id);
    if (!existingApp) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Clean and parse bodyData
    const updateData = {};
    const nestedObjectFields = [
      "permanentAddress",
      "temporaryAddress",
      "siblingDetails",
      "father",
      "mother",
      "guardian",
    ];

    // Get list of files to delete
    let filesToDelete = [];
    if (bodyData.filesToDelete) {
      try {
        filesToDelete = JSON.parse(bodyData.filesToDelete);
      } catch (e) {
        console.error("Error parsing filesToDelete:", e);
      }
    }

    // Parse all incoming data
    for (const key in bodyData) {
      if (
        [
          "_id",
          "__v",
          "createdAt",
          "updatedAt",
          "applicationPdfUrl",
          "applicationPdfPublicId",
          "revisionHistory",
          "remarks",
          "userId",
          "filesToDelete",
        ].includes(key)
      )
        continue;

      const value = bodyData[key];
      if (nestedObjectFields.includes(key) && typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (parsed._id) delete parsed._id;
          updateData[key] = parsed;
        } catch (e) {
          updateData[key] = value;
        }
      } else {
        updateData[key] = value;
      }
    }

    if (bodyData.fatherPhotoReason !== undefined)
      updateData.fatherPhotoReason = bodyData.fatherPhotoReason;
    if (bodyData.motherPhotoReason !== undefined)
      updateData.motherPhotoReason = bodyData.motherPhotoReason;

    // File deletions (for PDFs, use Cloudinary API)
    for (const fieldName of filesToDelete) {
      if (
        fieldName === "applicationPdfUrl" &&
        existingApp.applicationPdfPublicId
      ) {
        await cloudinary.uploader.destroy(existingApp.applicationPdfPublicId, {
          resource_type: "raw",
        });
        updateData.applicationPdfUrl = "";
        updateData.applicationPdfPublicId = "";
      } else {
        updateData[fieldName] = Array.isArray(existingApp[fieldName]) ? [] : "";
      }
    }

    // Map newly uploaded files (Cloudinary URLs)
    // Map newly uploaded files (Cloudinary URLs)
    if (req.files) {
      if (req.files.studentPhoto)
        updateData.studentPhoto = await uploadToCloudinary(
          req.files.studentPhoto,
          "application_photos"
        );
      if (req.files.fatherPhoto)
        updateData.fatherPhoto = await uploadToCloudinary(
          req.files.fatherPhoto,
          "application_photos"
        );
      if (req.files.motherPhoto)
        updateData.motherPhoto = await uploadToCloudinary(
          req.files.motherPhoto,
          "application_photos"
        );
      if (req.files.tenthMarkSheet)
        updateData.tenthMarkSheet = (
          await uploadToCloudinary(req.files.tenthMarkSheet, "application_docs")
        )[0];
      if (req.files.eleventhMarkSheet)
        updateData.eleventhMarkSheet = (
          await uploadToCloudinary(
            req.files.eleventhMarkSheet,
            "application_docs"
          )
        )[0];
      if (req.files.twelthMarkSheet)
        updateData.twelthMarkSheet = (
          await uploadToCloudinary(
            req.files.twelthMarkSheet,
            "application_docs"
          )
        )[0];
      //ug
      if (req.files.ugConsolidatedMarkSheet)
        bodyData.ugConsolidatedMarkSheet = (
          await uploadToCloudinary(
            req.files.ugConsolidatedMarkSheet,
            "application_docs"
          )
        )[0];
      if (req.files.ugCourseCompletion)
        bodyData.ugCourseCompletion = (
          await uploadToCloudinary(
            req.files.ugCourseCompletion,
            "application_docs"
          )
        )[0];
      if (req.files.ugDegree)
        bodyData.ugDegree = (
          await uploadToCloudinary(req.files.ugDegree, "application_docs")
        )[0];
      if (req.files.ugProvisional)
        bodyData.ugProvisional = (
          await uploadToCloudinary(req.files.ugProvisional, "application_docs")
        )[0];
      //polytechnic
      if (req.files.polytechnicMarkSheet)
        bodyData.polytechnicMarkSheet = (
          await uploadToCloudinary(
            req.files.polytechnicMarkSheet,
            "application_docs"
          )
        )[0];
      if (req.files.diplomaCourseCompletion)
        bodyData.diplomaCourseCompletion = (
          await uploadToCloudinary(
            req.files.diplomaCourseCompletion,
            "application_docs"
          )
        )[0];
      if (req.files.diplomaDegree)
        bodyData.diplomaDegree = (
          await uploadToCloudinary(req.files.diplomaDegree, "application_docs")
        )[0];
      if (req.files.diplomaProvisional)
        bodyData.diplomaProvisional = (
          await uploadToCloudinary(
            req.files.diplomaProvisional,
            "application_docs"
          )
        )[0];
        if (req.files.diplomaMarkSheet1)
        bodyData.diplomaMarkSheet1 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet1, "application_docs")
        )[0];
         if (req.files.diplomaMarkSheet2)
        bodyData.diplomaMarkSheet2 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet2, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet3)
        bodyData.diplomaMarkSheet3 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet3, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet4)
        bodyData.diplomaMarkSheet4 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet4, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet5)
        bodyData.diplomaMarkSheet5 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet5, "application_docs")
        )[0];
        if (req.files.diplomaMarkSheet6)
        bodyData.diplomaMarkSheet6 = (
          await uploadToCloudinary(req.files.diplomaMarkSheet6, "application_docs")
        )[0];

        if (req.files.ugMarkSheet1)
        bodyData.ugMarkSheet1 = (
          await uploadToCloudinary(req.files.ugMarkSheet1, "application_docs")
        )[0];
         if (req.files.ugMarkSheet2)
        bodyData.ugMarkSheet2 = (
          await uploadToCloudinary(req.files.ugMarkSheet2, "application_docs")
        )[0];
        if (req.files.ugMarkSheet3)
        bodyData.ugMarkSheet3 = (
          await uploadToCloudinary(req.files.ugMarkSheet3, "application_docs")
        )[0];
        if (req.files.ugMarkSheet4)
        bodyData.ugMarkSheet4 = (
          await uploadToCloudinary(req.files.ugMarkSheet4, "application_docs")
        )[0];
        if (req.files.ugMarkSheet5)
        bodyData.ugMarkSheet5 = (
          await uploadToCloudinary(req.files.ugMarkSheet5, "application_docs")
        )[0];
        if (req.files.ugMarkSheet6)
        bodyData.ugMarkSheet6 = (
          await uploadToCloudinary(req.files.ugMarkSheet6, "application_docs")
        )[0];
        if (req.files.ugMarkSheet7)
        bodyData.ugMarkSheet7 = (
          await uploadToCloudinary(req.files.ugMarkSheet7, "application_docs")
        )[0];
        if (req.files.ugMarkSheet8)
        bodyData.ugMarkSheet8 = (
          await uploadToCloudinary(req.files.ugMarkSheet8, "application_docs")
        )[0];


      if (req.files.transferCertificate)
        updateData.transferCertificate = (
          await uploadToCloudinary(
            req.files.transferCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.communityCertificate)
        updateData.communityCertificate = (
          await uploadToCloudinary(
            req.files.communityCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.incomeCertificate)
        updateData.incomeCertificate = (
          await uploadToCloudinary(
            req.files.incomeCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.migrationCertificate)
        updateData.migrationCertificate = (
          await uploadToCloudinary(
            req.files.migrationCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.aadharCopy)
        updateData.aadharCopy = (
          await uploadToCloudinary(req.files.aadharCopy, "application_docs")
        )[0];
      if (req.files.allotmentOrder)
        updateData.allotmentOrder = (
          await uploadToCloudinary(req.files.allotmentOrder, "application_docs")
        )[0];
      if (req.files.firstGraduateCertificate)
        updateData.firstGraduateCertificate = (
          await uploadToCloudinary(
            req.files.firstGraduateCertificate,
            "application_docs"
          )
        )[0];
      if (req.files.declarationForm)
        updateData.declarationForm = (
          await uploadToCloudinary(
            req.files.declarationForm,
            "application_docs"
          )
        )[0];
      if (req.files.physicalFitnessForm)
        updateData.physicalFitnessForm = (
          await uploadToCloudinary(
            req.files.physicalFitnessForm,
            "application_docs"
          )
        )[0];
    }

    // Track changes for revisionHistory
    const changes = diffFields(existingApp.toObject(), updateData);
    if (changes.length > 0) {
      updateData.lastModified = new Date();
      updateData.revisionHistory = existingApp.revisionHistory || [];
      updateData.revisionHistory.push({
        modifiedAt: new Date(),
        changes: changes,
        modifiedBy: existingApp.userId,
      });
    }

    // Update application with new data (no PDF logic yet)
    let updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Failed to update application",
      });
    }

    // ---- PDF Regeneration and Cloudinary Upload ----

    // Delete previous PDF from Cloudinary if exists
    if (existingApp.applicationPdfPublicId) {
      await cloudinary.uploader.destroy(existingApp.applicationPdfPublicId, {
        resource_type: "raw",
      });
    }

    // Generate new PDF locally to temp folder
    const fileName = `application_${
      updatedApplication.studentName
    }_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../temp", fileName);
    await applicationPdf(updatedApplication, filePath); // create PDF locally

    // Upload PDF to Cloudinary
    const pdfUploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "application_pdfs",
    });

    // Remove local temp PDF file
    require("fs").unlinkSync(filePath);

    // Store Cloudinary info in doc
    updatedApplication.applicationPdfUrl = pdfUploadResult.secure_url;
    updatedApplication.applicationPdfPublicId = pdfUploadResult.public_id;
    await updatedApplication.save();

    // (Send mail logic as needed...)

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
      pdfUrl: updatedApplication.applicationPdfUrl,
      changes: changes.length,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application",
      error: error.message,
    });
  }
};

const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting file ${filePath}:`, error.message);
  }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate("userId");
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate(
      "userId"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching application",
      error: error.message,
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Admitted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids must be a non-empty array" });
    }
    if (!["Pending", "Admitted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const result = await Application.updateMany(
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

function formatApplicationForExcel(app, baseUrl) {
  return {
    // Basic Info
    // "Application ID": app._id,
    "Student Name": app.studentName ?? "",
    "Course Entry Type": app.courseEntryType ?? "",
    "Preferred Course": app.preferredCourse ?? "",
    Quota: app.Quota ?? "",
    Gender: app.gender ?? "",
    "Date of Birth": app.dob
      ? new Date(app.dob).toLocaleDateString("en-IN")
      : "",
    Community: app.community ?? "",
    "Community Certificate No": app.communityCertificateNo ?? "",
    "Caste Name": app.casteName ?? "",
    Nationality: app.nationality ?? "",
    Religion: app.religion ?? "",
    "Mother Tongue": app.motherTongue ?? "",
    "Blood Group": app.bloodGroup ?? "",
    "Aadhar No": app.aadharNo ?? "",
    "EMIS No": app.emisNo ?? "",
    "Hostel / Day Scholar": app.hostelDayScholar ?? "",
    "Carrer Option": app.careerOption ?? "",
    "Insurance Nominee": app.insuranceNominee ?? "",

    // Permanent Address
    "Perm Door No": app.permanentAddress?.doorNo ?? "",
    "Perm Street": app.permanentAddress?.street ?? "",
    "Perm Taluk": app.permanentAddress?.taluk ?? "",
    "Perm District": app.permanentAddress?.district ?? "",
    "Perm State": app.permanentAddress?.state ?? "",
    "Perm Pincode": app.permanentAddress?.pincode ?? "",

    // Temporary Address
    "Temp Door No": app.temporaryAddress?.doorNo ?? "",
    "Temp Street": app.temporaryAddress?.street ?? "",
    "Temp Taluk": app.temporaryAddress?.taluk ?? "",
    "Temp District": app.temporaryAddress?.district ?? "",
    "Temp State": app.temporaryAddress?.state ?? "",
    "Temp Pincode": app.temporaryAddress?.pincode ?? "",

    //
    "Self Mobile": app.selfMobileNo ?? "",
    "Self Whatsapp": app.selfWhatsapp ?? "",
    "Self Email": app.selfEmail ?? "",

    // Father
    "Father Name": app.father?.name ?? "",
    "Father Qualification": app.father?.qualification ?? "",
    "Father Work Type": app.father?.workType ?? "",
    "Father Organization": app.father?.organizationName ?? "",
    "Father Designation": app.father?.designation ?? "",
    "Father Annual Income": app.father?.annualIncome ?? "",
    "Father Mobile": app.father?.mobile ?? "",
    "Father Whatsapp": app.father?.whatsapp ?? "",

    "Father Email": app.father?.email ?? "",

    // Mother
    "Mother Name": app.mother?.name ?? "",
    "Mother Qualification": app.mother?.qualification ?? "",
    "Mother Work Type": app.mother?.workType ?? "",
    "Mother Organization": app.mother?.organizationName ?? "",
    "Mother Designation": app.mother?.designation ?? "",
    "Mother Annual Income": app.mother?.annualIncome ?? "",
    "Mother Mobile": app.mother?.mobile ?? "",
    "Mother Email": app.mother?.email ?? "",
    "Mother Whatsapp": app.mother?.whatsapp ?? "",

    // Guardian
    "Guardian Name": app.guardian?.name ?? "",
    "Guardian Mobile": app.guardian?.mobile ?? "",

    "Family Income (Certificate)": app.familyIncomeAsPerCertificate ?? "",
    "Income Certificate No": app.incomeCertificateNo ?? "",
    "Counselling Application No": app.counsellingApplicationNo ?? "",
    "Counselling Overall Rank": app.counsellingOverallRank ?? "",
    "Counselling Community Rank": app.counsellingCommunityRank ?? "",
    "FirstGraduate Number": app.firstGraduateNumber ?? "",

    //sibling
    "Sibling Name ": app.siblingDetails.name ?? "",
    "Sibling RollNo": app.siblingDetails.rollNo ?? "",
    "Sibling deprecate": app.siblingDetails.department ?? "",
    "Sibling Year of Admission": app.siblingDetails.yearOfAdmission ?? "",

    // Documents (convert to URLs)
    "Student Photo": app.studentPhoto?.[0] ?? "",
    "Father Photo": app.fatherPhoto?.[0] ?? "",
    "Mother Photo": app.motherPhoto?.[0] ?? "",
    //B.E
    "10th Mark Sheet": app.tenthMarkSheet ?? "",
    "11th Mark Sheet": app.eleventhMarkSheet ?? "",
    "12th Mark Sheet": app.twelthMarkSheet ?? "",
    //Lateral
    "Diplomo Mark Sheet": app.polytechnicMarkSheet ?? "",
    "Diplomoth CourseCompletion": app.diplomaCourseCompletion ?? "",
    "Diplomo Degree": app.diplomaDegree ?? "",
    //ME
    "UG Mark Sheet": app.ugConsolidatedMarkSheet ?? "",
    "UG CourseCompletion": app.ugCourseCompletion ?? "",
    "UG Degree": app.ugDegree ?? "",

    "Transfer Certificate": app.transferCertificate ?? "",
    "Community Certificate": app.communityCertificate ?? "",
    "Income Certificate": app.incomeCertificate ?? "",
    "Migration Certificate": app.migrationCertificate ?? "",
    "Aadhar Copy": app.aadharCopy ?? "",
    "Allotment Order": app.allotmentOrder ?? "",
    "First Graduate Certificate": app.firstGraduateCertificate ?? "",
    "Declaration Form": app.declarationForm ?? "",

    "Father PhotoReason": app.fatherPhotoReason ?? "",
    "Mother PhotoReason": app.motherPhotoReason ?? "",

    // Status: app.status ?? "",
    "Created At": app.createdAt
      ? new Date(app.createdAt).toLocaleDateString("en-IN")
      : "",
  };
}

exports.exportApplications = async (req, res) => {
  try {
    const { ids } = req.body;

    let applications;
    if (ids && ids.length > 0) {
      applications = await Application.find({ _id: { $in: ids } }).lean();
    } else {
      applications = await Application.find().lean();
    }

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Applications");

    // Format all applications
    const formattedRows = applications.map((app) =>
      formatApplicationForExcel(app)
    );

    // Add header row
    sheet.addRow(Object.keys(formattedRows[0]));

    // Add values
    formattedRows.forEach((row) => {
      sheet.addRow(Object.values(row));
    });

    // Formatting
    sheet.columns.forEach((col) => (col.width = 25));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=applications.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export applications error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicationStats = async (req, res) => {
  try {
    const TYPES = {
      BE: "I Year B.E / B.Tech",
      LATERAL: "Lateral Entry",
      ME: "I Year M.E",
    };

    // Helper to count for a category
    const getStats = async (type) => {
      const total = await Application.countDocuments({
        courseEntryType: type,
      });

      const admitted = await Application.countDocuments({
        courseEntryType: type,
        status: "Admitted",
      });

      const pending = await Application.countDocuments({
        courseEntryType: type,
        status: "Pending",
      });

      const remark = await Application.countDocuments({
        courseEntryType: type,
        status: "Remark",
      });

      return { total, admitted, pending, remark };
    };

    // Get stats for all categories
    const beStats = await getStats(TYPES.BE);
    const lateralStats = await getStats(TYPES.LATERAL);
    const meStats = await getStats(TYPES.ME);

    res.json({
      BE: beStats,
      LATERAL: lateralStats,
      ME: meStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addRemark = async (req, res) => {
  try {
    const { remark } = req.body;
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Check remark count
    if (application.remarks.length >= 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum 3 remarks allowed for an application",
      });
    }

    // Push new remark
    application.remarks.push({ remark });
    application.status = "Remark";

    application.lastRemarkSnapshot = application.toObject();

    await application.save();

    const html = renderTemplate("remark", {
      studentName: application.studentName,
      remark: remark,
    });
    await sendMail(
      application.selfEmail,
      "Remark on Your Application - SECE Admission",
      html
    );

    res.json({
      success: true,
      message: "Remark added and email sent",
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resubmitApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const application = await Application.findById(id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    const oldData = application.lastRemarkSnapshot || {};

    // Parse nested JSON fields
    const jsonFields = [
      "father",
      "mother",
      "guardian",
      "permanentAddress",
      "temporaryAddress",
      "siblingDetails",
    ];

    jsonFields.forEach((field) => {
      if (updates[field] && typeof updates[field] === "string") {
        try {
          updates[field] = JSON.parse(updates[field]);
        } catch (err) {
          console.error(`Failed to parse ${field}:`, err);
        }
      }
    });

    // Prevent overwriting userId
    delete updates.userId;

    // Update regular fields from form-data
    Object.assign(application, updates);

    // Map Cloudinary file URLs
    const fileFields = [
      "studentPhoto",
      "fatherPhoto",
      "motherPhoto",
      "tenthMarkSheet",
      "eleventhMarkSheet",
      "twelthMarkSheet",

      "polytechnicMarkSheet",
      "diplomaCourseCompletion",
      "diplomaDegree",
      "diplomaProvisional",
      "diplomaMarkSheet1",
      "diplomaMarkSheet2",
      "diplomaMarkSheet3",
      "diplomaMarkSheet4",
      "diplomaMarkSheet5",
      "diplomaMarkSheet6",

      "ugMarkSheet1",
      "ugMarkSheet2",
      "ugMarkSheet3",
      "ugMarkSheet4",
      "ugMarkSheet5",
      "ugMarkSheet6",
      "ugMarkSheet7",
      "ugMarkSheet8",

      "ugConsolidatedMarkSheet",
      "ugCourseCompletion",
      "ugDegree",
      "ugProvisional",

      "transferCertificate",
      "communityCertificate",
      "incomeCertificate",
      "migrationCertificate",
      "aadharCopy",
      "allotmentOrder",
      "firstGraduateCertificate",
      "declarationForm",
      "physicalFitnessForm",
    ];

    if (req.files) {
      for (const field of fileFields) {
        if (req.files[field]) {
          const folder =
            field === "studentPhoto" ||
            field === "fatherPhoto" ||
            field === "motherPhoto"
              ? "application_photos"
              : "application_docs";

          // Upload to Cloudinary (handles both single/multiple)
          const uploaded = await uploadToCloudinary(req.files[field], folder);

          // If multiple, store array; if single, store first
          application[field] =
            Array.isArray(uploaded) && uploaded.length > 1
              ? uploaded
              : uploaded[0];
        }
      }
    }

    // Track changed fields
    const changedFields = diffFields(oldData, application.toObject());
    application.lastUpdatedFields = changedFields;

    // Update status and submission count
    application.status = "Pending";
    application.submissionCount = (application.submissionCount || 0) + 1;

    // ---- Cloudinary PDF Handling ----

    // Delete old PDF from Cloudinary if it exists
    if (application.applicationPdfPublicId) {
      await cloudinary.uploader.destroy(application.applicationPdfPublicId, {
        resource_type: "raw",
      });
    }

    // Generate new PDF locally (temporary file)
    const fileName = `application_${application.studentName}_${Date.now()}.pdf`;
    const tempFolder = path.join(__dirname, "../temp"); // Use temp folder
    if (!fs.existsSync(tempFolder))
      fs.mkdirSync(tempFolder, { recursive: true });
    const filePath = path.join(tempFolder, fileName);
    await applicationPdf(application, filePath);

    // Upload new PDF to Cloudinary
    const pdfResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "application_pdfs",
    });

    // Delete local temp PDF file
    fs.unlinkSync(filePath);

    // Set new Cloudinary PDF details
    application.applicationPdfUrl = pdfResult.secure_url;
    application.applicationPdfPublicId = pdfResult.public_id;
    await application.save();

    res.json({
      success: true,
      message: "Application resubmitted with form-data and PDF regenerated",
      data: { application, changedFields },
      pdfUrl: application.applicationPdfUrl,
    });
  } catch (error) {
    console.error("Resubmit Application Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get application by User ID
exports.getApplicationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const application = await Application.findOne({ userId }).populate(
      "userId"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching application",
      error: error.message,
    });
  }
};

exports.withdrawStatus = async (req, res) => {
  try {
    const { status, withdrawReason } = req.body;

    // Allowed status values
    const allowedStatus = ["Withdrawn", "Pending", "Admitted"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Build the update object dynamically
    const updateData = { status };

    // If status is Withdrawn, save the reason
    if (status === "Withdrawn") {
      updateData.withdrawReason = withdrawReason || "";
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      message: "Application updated successfully",
      application,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
