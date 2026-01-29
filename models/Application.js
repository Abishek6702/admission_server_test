const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  doorNo: String,
  street: String,
  taluk: String,
  district: String,
  state: String,
  pincode: String,
});

const ParentsSchema = new mongoose.Schema({
  name: String,
  qualification: String,
  workType: {
    type: String,
    // enum: ["Government", "Private", "Business", "Other", "Farmer","HouseWife"],
  },
  organizationName: String,
  designation: String,
  annualIncome: Number,
  mobile: String,
  whatsapp: String,
  email: String,
});

const RemarkSchema = new mongoose.Schema({
  remark: String,
  date: { type: Date, default: Date.now },
});

const ApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseEntryType: {
      type: String,
      enum: ["I Year B.E / B.Tech", "Lateral Entry", "I Year M.E"],
      default: "I Year B.E / B.Tech",
    },
    studentName: String,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    preferredCourse: String,
    Quota: {
      type: String,
      enum: ["Government Quota", "Management Quota"],
      default: "Management Quota",
    },
    permanentAddress: AddressSchema,
    temporaryAddress: AddressSchema,
    dob: Date,
    community: String,
    casteName: String,
    communityCertificateNo: String,
    motherTongue: String,
    religion: String,
    nationality: String,
    bloodGroup: String,
    aadharNo: String,
    selfMobileNo: String,
    selfWhatsapp: String,
    selfEmail: String,
    insuranceNominee: String,
    fatherPhotoReason: {
      type: String,
      default: "",
    },
    motherPhotoReason: {
      type: String,
      default: "",
    },
    hostelDayScholar: { type: String, enum: ["Hostel", "DayScholar"] },
    emisNo: String,
    siblingsStudyingHere: { type: Boolean, default: false },
    siblingDetails: {
      name: String,
      rollNo: String,
      department: String,
      yearOfAdmission: String,
    },
    careerOption: {
      type: String,
      enum: [
        "Placement",
        "Government Job",
        "Higher Studies",
        "Entrepreneurship",
        "Other",
      ],
      default: "Placement",
    },
    father: ParentsSchema,
    mother: ParentsSchema,
    guardian: { name: String, mobile: String },

    familyIncomeAsPerCertificate: Number,
    incomeCertificateNo: String,

    counsellingApplicationNo: String,
    counsellingOverallRank: String,
    counsellingCommunityRank: String,
    isFirstGraduate: { type: Boolean, default: false },
    firstGraduateNumber: String,

    status: {
      type: String,
      enum: ["Pending", "Remark", "Admitted","Withdraw"],
      default: "Pending",
    },
    withdrawReason:String,
    remarks: [RemarkSchema],
    submissionCount: { type: Number, default: 0 },

    studentPhoto: [String],
    fatherPhoto: [String],
    motherPhoto: [String],

    tenthMarkSheet: String,
    eleventhMarkSheet: String,
    twelthMarkSheet: String,

    polytechnicMarkSheet: String,
    diplomaCourseCompletion: String,
    diplomaDegree: String,
    diplomaProvisional: String,

    diplomaMarkSheet1: String,
    diplomaMarkSheet2: String,
    diplomaMarkSheet3: String,
    diplomaMarkSheet4: String,
    diplomaMarkSheet5: String,
    diplomaMarkSheet6: String,

    ugConsolidatedMarkSheet: String,
    ugCourseCompletion: String,
    ugDegree: String,
    ugProvisional: String,

    ugMarkSheet1: String,
    ugMarkSheet2: String,
    ugMarkSheet3: String,
    ugMarkSheet4: String,
    ugMarkSheet5: String,
    ugMarkSheet6: String,
    ugMarkSheet7: String,
    ugMarkSheet8: String,

    transferCertificate: String,

    communityCertificate: String,
    incomeCertificate: String,
    migrationCertificate: String,
    aadharCopy: String,

    allotmentOrder: String,
    firstGraduateCertificate: String,

    declarationForm: String,

    physicalFitnessForm: String,

    applicationPdfUrl: { type: String },
    applicationPdfPublicId: { type: String },

    lastRemarkSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastUpdatedFields: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
