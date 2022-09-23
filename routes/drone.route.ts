import express from 'express';
import controller from '../controllers/drone.controller';
import asyncHandler from '../utils/asyncHandler';


const router = express.Router();

router.get('/', asyncHandler(controller.getDrones));
//router.post('/buydrone', asyncHandler(controller.buyDrones));
router.post('/markforsale', asyncHandler(controller.markDroneForSale));


export = router;
