import express from 'express';
import controller from '../controllers/asset.controller';
import inventoryController from '../controllers/inventory.controller';
import asyncHandler from '../utils/asyncHandler';
import {
  assetValidator,
  assetUpdateValidator,
  assetStatusValidator,
  assetOwnerValidator,
  assetLandValidator,
  assetByTypeLatLonRadiusValidator,
  assetLandExportValidator,
  assetByFilterValidator,
  assetObjectValidator,
} from '../validators/asset.validator';
import multer from 'multer';
import path from 'path';
import helperFunctions from '../utils/helper';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, helperFunctions.generateString(20) + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const uploadFiles = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'animation', maxCount: 1 },
  { name: 'sticker', maxCount: 1 },
  { name: 'attachmentZip', maxCount: 1 },
]);

const router = express.Router();

router.get('/', asyncHandler(controller.getAllAssets));
router.get('/types', asyncHandler(controller.getAllAssetTypes));
router.get('/getById/:id', asyncHandler(controller.getAssetById));
router.get('/getByContract/:id', asyncHandler(controller.getAssetsByContractId));
router.get('/getMetadataById/:assetType/:id', asyncHandler(controller.getMetadataById));
router.get('/getLandMetadataById/:id', asyncHandler(controller.getLandMetadataById));
router.get('/getAssetsByOwner/:id', asyncHandler(controller.getAssetsByOwnerId));
router.get('/getAssetsByType/:assetType', asyncHandler(controller.getAssetsByAssetType));
router.get('/getAssetsBySeason/:seasonName', asyncHandler(controller.getAssetsBySeasonName));
router.get(
  '/getAssetsByTypeAndLatLonRadius',
  assetByTypeLatLonRadiusValidator(),
  asyncHandler(controller.getAssetsByTypeAndLatLonRadius),
);
router.get('/export', assetLandExportValidator(), asyncHandler(controller.exportAssetType));
router.post('/create', uploadFiles, assetValidator(), asyncHandler(controller.createAsset));

router.put('/update/:id', uploadFiles, assetUpdateValidator(), asyncHandler(controller.updateAsset));
router.put('/updateAssetOwner/:id', assetOwnerValidator(), asyncHandler(controller.updateAssetOwner));
router.put('/updateAssetStatus/:id', assetStatusValidator(), asyncHandler(controller.updateAssetStatus));
router.post('/uploadFiles', uploadFiles, asyncHandler(controller.uploadFiles));

router.post('/import', uploadFiles, asyncHandler(controller.importBulkAsset));

router.get('/getRewardMetaDataById/:id', asyncHandler(inventoryController.getRewardMetaDataById));
router.post('/filter', assetByFilterValidator(), asyncHandler(controller.getAssetsByFilter));

export = router;
