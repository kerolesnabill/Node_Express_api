const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb("Not an image file.");
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
});

exports.upload = multerUpload.single("photo");

exports.uploadPostImages = multerUpload.fields([
  { name: "images", maxCount: 10 },
]);

exports.resize = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/users/${req.file.filename}`);

  next();
};

exports.resizePostImages = async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `post-user-${req.user._id}-${Date.now()}-${i}.jpeg`;

      await sharp(req.files.images[i].buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/posts/${filename}`);

      i++;
      req.body.images.push(filename);
    })
  );

  next();
};
