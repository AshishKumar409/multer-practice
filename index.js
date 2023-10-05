let express = require("express");
const multer = require("multer");
const uuid = require("uuid").v4;

let app = express();

// let upload = multer({ dest: "uploads/" });

// app.post("/upload", upload.single("file"), (req, res) => {
//   res.json({ status: "success" });
// });

let upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ upload: "single", status: "success" });
});

app.post("/multiple", upload.array("file", 2), (req, res) => {
  res.json({ upload: "multiple", status: "success" });
});

let multiupload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

app.post("/multipleFiles", multiupload, (req, res) => {
  console.log(req.files);
  res.json({ upload: "multipleFiles", status: "success" });
});

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    let { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});

let namedUploads = multer({ storage });

let namedMultipleUploads = namedUploads.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
  {
    name: "resume",
    maxCount: 1,
  },
]);

app.post("/namedUploads", namedMultipleUploads, (req, res) => {
  res.json({ upload: "namedUploads", status: "success" });
});

let fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(
      new Error(
        `You uploaded ${file.mimetype} type of file!, you can only upload image type`
      )
    );
  }
};

let imageUploads = multer({
  storage,
  fileFilter,
  limits: { fileSize: 160_000, files: 2 },
});

app.post("/imageTypeOnly", imageUploads.array("file"), (req, res) => {
  res.json({ upload: "imageTypeOnly", status: "success" });
});

let pdfFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    console.log("working");
    cb(null, true);
  } else {
    console.log("working else");

    cb(
      new Error(
        `You uploaded ${file.mimetype} type of file!, you can only upload pdf type`
      )
    );
  }
};

let pdfUploads = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 500_000 },
});

app.post("/pdfTypeOnly", pdfUploads.array("file"), (req, res) => {
  console.log(req.files);
  res.json({ upload: "pdfUploads", status: "success" });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.json({ message: "file is too large" });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.json({ message: "added to many files" });
    }
  }
  return res.json({ error: error.message });
});

let PORT = 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
