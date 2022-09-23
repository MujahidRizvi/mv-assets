import express from 'express';
import controller from '../controllers/category.controller';
import asyncHandler from '../utils/asyncHandler';
import multer from 'multer';
import path from 'path';
import helperFunctions from '../utils/helper';
import { categoryCreateValidator, categoryUpdateStautsValidator, categoryUpdateValidator } from '../validators/category.validator';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, helperFunctions.generateString(20) + path.extname(file.originalname));
  },
});

const dummyStorage = multer.diskStorage({
  destination: function (req, file, cb) {},
  filename: function (req, file, cb) {},
});

const upload = multer({ storage: storage });
//const dummyUpload = multer({ storage: dummyStorage });

const uploadFiles = upload.fields([{ name: 'logo', maxCount: 1 }]);
//const dummyUploadFiles = dummyUpload.fields([{ name: 'logo', maxCount: 1 }]);

const router = express.Router();

router.get('/', asyncHandler(controller.getCategories));
router.get('/getActiveCategories', asyncHandler(controller.getActiveCategories));
router.post('/create', uploadFiles, categoryCreateValidator(), asyncHandler(controller.createCategory));
router.put('/update/:id', uploadFiles, categoryUpdateValidator(), asyncHandler(controller.updateCategory));
router.put('/changeActiveStatus/:id', categoryUpdateStautsValidator(), asyncHandler(controller.updateCategoryActiveStatus));
router.post('/validate',categoryCreateValidator(), asyncHandler(controller.validateCategory));

export = router;
