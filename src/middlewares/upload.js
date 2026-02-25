const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, WEBP)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 4, 
    fields: 10, 
    fieldNameSize: 100, 
    fieldSize: 1024 * 1024, 
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File terlalu besar, maksimal 5MB" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Maksimal 4 file" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Field name tidak valid" });
    }
    return res.status(400).json({ message: "Upload error: " + err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, handleMulterError };
