import multer from 'multer';
import path from 'path';
// Memory storage keeps files in memory as Buffer
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error('Only CSV files are allowed'));
  }
  cb(null, true);
}

const csvFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default csvFile;