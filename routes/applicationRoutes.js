const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multerConfig");
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
  exportApplications,
  getApplicationStats,
  addRemark,
  resubmitApplication,
  getApplicationByUserId,
  updateApplication,
  withdrawStatus
} = require("../controllers/applicationController");
const routeLogger = require("../middlewares/routeLogger");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const Application = require("../models/Application");

// Define file fields for upload
const fileFields = [
  { name: "studentPhoto", maxCount: 3 },
  { name: "fatherPhoto", maxCount: 3 },
  { name: "motherPhoto", maxCount: 3 },
  { name: "tenthMarkSheet", maxCount: 1 },
  { name: "eleventhMarkSheet", maxCount: 1 },
  { name: "twelthMarkSheet", maxCount: 1 },
  { name: "transferCertificate", maxCount: 1 },
  { name: "communityCertificate", maxCount: 1 },
  { name: "incomeCertificate", maxCount: 1 },
  { name: "migrationCertificate", maxCount: 1 },
  { name: "aadharCopy", maxCount: 1 },
  { name: "allotmentOrder", maxCount: 1 },
  { name: "firstGraduateCertificate", maxCount: 1 },
  { name: "declarationForm", maxCount: 1 },
  { name: "physicalFitnessForm", maxCount: 1 },

  { name: "polytechnicMarkSheet", maxCount: 1 },
  { name: "diplomaCourseCompletion", maxCount: 1 },
  { name: "diplomaDegree", maxCount: 1 },
  { name: "diplomaProvisional", maxCount: 1 },

  { name: "ugConsolidatedMarkSheet", maxCount: 1 },
  { name: "ugCourseCompletion", maxCount: 1 },
  { name: "ugDegree", maxCount: 1 },
  { name: "ugProvisional", maxCount: 1 },

  { name: "diplomaMarkSheet1", maxCount: 1 },
  { name: "diplomaMarkSheet2", maxCount: 1 },
  { name: "diplomaMarkSheet3", maxCount: 1 },
  { name: "diplomaMarkSheet4", maxCount: 1 },
  { name: "diplomaMarkSheet5", maxCount: 1 },
  { name: "diplomaMarkSheet6", maxCount: 1 },

  { name: "ugMarkSheet1", maxCount: 1 },
  { name: "ugMarkSheet2", maxCount: 1 },
  { name: "ugMarkSheet3", maxCount: 1 },
  { name: "ugMarkSheet4", maxCount: 1 },
  { name: "ugMarkSheet5", maxCount: 1 },
  { name: "ugMarkSheet6", maxCount: 1 },
  { name: "ugMarkSheet7", maxCount: 1 },
  { name: "ugMarkSheet8", maxCount: 1 },
];

router.post(
  "/",
  protect,
  routeLogger(Application, "Application"),

  (req, res, next) => {
    upload.fields(fileFields)(req, res, function (err) {
      if (err) {
        console.error("Multer Error:", err);

        return res.status(400).json({
          success: false,
          message: "File upload failed",
          error: err.message,
        });
      }
      next();
    });
  },
  createApplication
);

router.get("/", getAllApplications);
router.get("/application-card", getApplicationStats);

router.get("/:id", getApplicationById);

router.patch(
  "/:id/status",
  protect,
  routeLogger(Application, "Application"),

  updateApplicationStatus
);

router.patch(
  "/:id/withdraw",
  protect,
  routeLogger(Application, "Application"),
  withdrawStatus
);

router.put("/bulk/status", bulkUpdateApplicationStatus);
router.post("/export", exportApplications);

router.post(
  "/:id/remark",
  protect, 
  routeLogger(Application, "Application"),
  addRemark
);
router.put(
  "/:id/resubmit",
  protect,
  routeLogger(Application, "Application"),

  upload.fields(fileFields),
  resubmitApplication
);
router.get("/user/:userId", getApplicationByUserId);
router.put(
  "/:id",
  protect,
  routeLogger(Application, "Application"),

  upload.fields(fileFields),
  updateApplication
);

module.exports = router;
