const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", CounterSchema);

async function getNextSequence(name) {
  const ret = await Counter.findOneAndUpdate(
    { id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return ret.seq;
}

const AddressSchema = new mongoose.Schema({
  doorNo: String,
  street: String,
  taluk: String,
  district: String,
  state: String,
  pincode: Number,
});

const EnquirySchema = new mongoose.Schema(
  {
    enquiryId: { type: String, unique: true },
    courseEntryType: {
      type: String,
      enum: ["I Year B.E / B.Tech", "Lateral Entry", "I Year M.E"],
      default: "I Year B.E / B.Tech",
    },
    studentName: String,
    dob: Date,
    fatherName: String,
    motherName: String,
    isFirstGraduate: { type: Boolean, default: false },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: AddressSchema,
    community: String,
    courseRequired: [String],

    twelfthSchoolName: String,
    twelfthSchoolAddress: String,
    twelfthSchoolBoard: String,

    schoolName: String,
    collegeName: String,
    polytechnicCollegeName: String,

    tenthSchoolBoard: String,
    tenthMarks: String,
    twelfthRegisterNo: String,
    twelfthMarks: {
      maths: Number,
      physics: Number,
      chemistry: Number,
      vocationalIfAny: Number,
      total: Number,
      cutOff: Number,
    },

    // For Lateral Entry
    polytechnicName: { type: String },
    diplomaCourse: { type: String },
    diplomaPercentage: { type: String },
    polySemUpto: { type: String },
    // For M.E
    ugCollegeName: { type: String },
    ugCourse: { type: String },
    ugGPA: { type: String },
    ugSemUpto: { type: String },

    studentEmail: String,
    studentMobile: String,
    fatherEmail: String,
    fatherMobile: String,
    fatherWorkType: {
      type: String,
    },
    fatherNatureOfWork: {
      type: String,
    },
    motherMobile: String,
    motherEmail: String,
    motherWorkType: {
      type: String,
    },
    motherNatureOfWork: {
      type: String,
    },
    dateOfVisit: Date,
    signature: String,
    allocatedStaff: { type: String },
    amount: { type: String },
    feesPaid: { type: Boolean },
    hasScholarship: { type: Boolean },
    scholarshipType: { type: String },
    transactionNo: { type: String },
    finalizedCourse: { type: String },
    rejectRemark: { type: String },
    allocatedQuota: {
      type: String,
      enum: ["Government Quota", "Management Quota", ""],
    },
    revisited: { type: Boolean, default: false },
    revisits: [
      {
        date: { type: Date },
        visitedBy: { type: String },
      },
    ],
    enquiryPdfUrl: { type: String },
    enquiryPdfPublicId: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Selected", "Rejected", "UserCreated"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

EnquirySchema.pre("save", async function () {
  if (this.isNew) {
    const yearString = "26"; // Your fixed year

    let prefix = "";
    let counterKey = "";

    switch (this.courseEntryType) {
      case "I Year B.E / B.Tech":
        prefix = "ENQ";      // → 26ENQ0001
        counterKey = "enquiry";
        break;

      case "I Year M.E":
        prefix = "ENQPG";    // → 26ENQPG0001
        counterKey = "ME_enquiry";
        break;

      case "Lateral Entry":
        prefix = "ENQL";     // → 26ENQL0001
        counterKey = "LE_enquiry";
        break;

      default:
        prefix = "ENQ";       // fallback
        counterKey = "GEN_enquiry";
    }

    // Get next independent sequence for each category
    const seqNumber = await getNextSequence(counterKey);
    const seqString = seqNumber.toString().padStart(4, "0");

    // Final ID
    this.enquiryId = `${yearString}${prefix}${seqString}`;
  }
});


module.exports = mongoose.model("Enquiry", EnquirySchema);
