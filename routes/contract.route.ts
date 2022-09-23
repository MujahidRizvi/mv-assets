import express from 'express';
import controller from '../controllers/contract.controller';
import smartContractorController from '../controllers/smart-contract.controller';
import asyncHandler from '../utils/asyncHandler';
import {
  contractListValidator,
  contractUpdateValidator,
  contractValidator,
  whiteListUsersValidator,
  statusValidator,
  baseURIValidator,
  addressLimitValidator,
  mintLandValidator,
  mintObjectValidator,
  addWhiteListAdminValidator,
  removeWhiteListAdminValidator,
} from '../validators/contract.validator';
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
  { name: 'logo', maxCount: 1 },
  { name: 'featured', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);
const uploadFile = upload.fields([{ name: 'file', maxCount: 1 }]);
const router = express.Router();

router.get('/', asyncHandler(controller.getAllContracts));
router.get('/getAllActiveContracts', asyncHandler(controller.getAllActiveContracts));
router.get('/filter', contractListValidator(), asyncHandler(controller.getAllContractsFilter));
router.get('/getContractById/:id', asyncHandler(controller.getContractById));
router.get('/getSearchFilterPanel/:id', asyncHandler(controller.getSearchFilterPanel));
router.get('/getContractsByCategoryId/:id', asyncHandler(controller.getContractsByCategoryId));
router.get('/getContractsByAssetType/:assetType', asyncHandler(controller.getContractsByAssetType));
router.get('/getContractsBySeason/:seasonName', asyncHandler(controller.getContractsBySeasonName));
router.post('/create', uploadFiles, contractValidator(), asyncHandler(controller.createContract));
router.put('/update/:id', uploadFiles, contractUpdateValidator(), asyncHandler(controller.updateContract));
router.post('/buildCollectionPanel/:id', asyncHandler(controller.buildCollectionPanel));
router.post(
  '/buildWhiteListUsers/:contractId',
  uploadFile,
  whiteListUsersValidator(),
  asyncHandler(smartContractorController.buildWhiteListUsers),
);
router.get('/verifyWhiteListUser/:contractId', asyncHandler(smartContractorController.verifyWhiteListUser));
router.put(
  '/updatePauseStatus/:contractId',
  statusValidator(),
  asyncHandler(smartContractorController.updatePauseStatus),
);
router.get('/getPauseStatus/:contractId', asyncHandler(smartContractorController.getPauseStatus));
router.put(
  '/updateMintingStatus/:contractId',
  statusValidator(),
  asyncHandler(smartContractorController.updateMintingStatus),
);
router.get('/getMintingStatus/:contractId', asyncHandler(smartContractorController.getMintingStatus));
router.put('/updateBaseURI/:contractId', baseURIValidator(), asyncHandler(smartContractorController.updateBaseURI));
router.get('/getBaseURI/:contractId', asyncHandler(smartContractorController.getBaseURI));
router.put(
  '/updatePublicSaleStatus/:contractId',
  statusValidator(),
  asyncHandler(smartContractorController.updatePublicSaleStatus),
);
router.get('/getPublicSaleStatus/:contractId', asyncHandler(smartContractorController.getPublicSaleStatus));

router.put(
  '/updateLandMintingLimitPerAddress/:contractId',
  addressLimitValidator(),
  asyncHandler(smartContractorController.updateLandMintingLimitPerAddress),
);
router.get(
  '/getLandMintingLimitPerAddress/:contractId',
  asyncHandler(smartContractorController.getLandMintingLimitPerAddress),
);
router.put('/mintLand/:contractId', mintLandValidator(), asyncHandler(smartContractorController.mintLand));
router.put('/mintObject/:contractId', mintObjectValidator(), asyncHandler(smartContractorController.mintObject));
router.get('/getDataById/:contractId/:id', asyncHandler(smartContractorController.getDataById));
router.get('/getDataByAddress/:contractId/:address', asyncHandler(smartContractorController.getDataByAddress));
router.get('/getInventoryByAddress/:address', asyncHandler(smartContractorController.getInventoryByAddress));
router.get('/getTokenURI/:contractId/:tokenId', asyncHandler(smartContractorController.getTokenURI));

router.put(
  '/addWhitelistAdmin/:contractId',
  addWhiteListAdminValidator(),
  asyncHandler(smartContractorController.addWhitelistAdmin),
);
router.put(
  '/removeWhitelistAdmin/:contractId',
  removeWhiteListAdminValidator(),
  asyncHandler(smartContractorController.removeWhitelistAdmin),
);
export = router;
