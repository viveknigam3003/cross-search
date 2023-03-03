import multer from "multer";

const storage = multer.memoryStorage();

const filefilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({ storage: storage, fileFilter: filefilter });
