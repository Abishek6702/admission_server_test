const jwt = require("jsonwebtoken");
const ActivityLog = require("../models/ActivityLog");

const routeLogger = (model, moduleName) => {
  return async (req, res, next) => {
    // 1️⃣ Get user from token (protect middleware already set req.user)
    const userId = req.user?._id; // or req.user.id

    // 2️⃣ Prepare before-data (if PUT/PATCH/DELETE and has ID)
    let beforeData = null;
    const isChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    const hasId = !!req.params.id;

    if (isChanging && hasId) {
      beforeData = await model.findById(req.params.id).lean();
    }

    // 3️⃣ After response is finished, log activity
    res.on("finish", async () => {
      try {
        let afterData = null;

        if (["POST", "PUT", "PATCH"].includes(req.method)) {
          const id = req.params.id || res.locals.createdId;
          if (id) afterData = await model.findById(id).lean();
        }

        await ActivityLog.create({
          user: userId,
          module: moduleName,
          endpoint: req.originalUrl,
          method: req.method,
          description: `${req.method} → ${req.originalUrl}`,
          before: beforeData,
          after: afterData,
        });
      } catch (err) {
        console.error("Activity log error:", err);
      }
    });

    next();
  };
};

module.exports = routeLogger;
