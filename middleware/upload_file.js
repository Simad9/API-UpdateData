const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // // kalau error lakukan sesuatau
    // if (error) {
    //   cb("error saat mengupload file");
    // } else {
    // kondisi ketika sukses
    cb(null, "files");
    //  
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
