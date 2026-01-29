const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multerConfig");
const enquiryController = require("../controllers/enquiryController");
const routeLogger = require("../middlewares/routeLogger");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const Enquiry = require("../models/Enquiry");

// Create new enquiry
router.post(
  "/",
  routeLogger(Enquiry, "Enquiry"),
  enquiryController.createEnquiry
);

// Get all enquiries
router.get("/", enquiryController.getAllEnquiries);
router.get("/enquiry-card", enquiryController.getEnquiryStats);

// Update enquiry status by ID
router.patch(
  "/:id/status",
  protect,
  routeLogger(Enquiry, "Enquiry"),
  enquiryController.updateEnquiryStatus
);

router.put("/bulk/status", enquiryController.bulkUpdateEnquiryStatus);

router.post("/export", enquiryController.exportEnquiries);
router.post(
  "/:id/revisit",
  protect,
  routeLogger(Enquiry, "Enquiry"),
  enquiryController.addRevisit
);
router.get("/revisited/count", enquiryController.getRevisitedCount);
router.get("/scholarship/count", enquiryController.getScholarshipCount);
router.post("/pdf", enquiryController.pdfGenerate);
router.post("/scholarpdf", enquiryController.ScholarPdfGenerate);

router.put(
  "/:id",
  protect,
  routeLogger(Enquiry, "Enquiry"),
  enquiryController.updateEnquiry
);

// Get enquiry by ID
router.get("/:id", enquiryController.getEnquiryById);

module.exports = router;
