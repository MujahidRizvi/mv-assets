import express from 'express';
import controller from '../controllers/inventory.controller';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.get('/', asyncHandler(controller.getAllInventory));
router.get('/getActive', asyncHandler(controller.getActiveInventory));
router.get('/getById/:id', asyncHandler(controller.getInventoryById));
router.get('/getRandomReward/', asyncHandler(controller.getRandomReward));
router.get('/getRewardsByPlayer/:address', asyncHandler(controller.getRewardsByPlayerAddress));
router.post('/mintRewards', asyncHandler(controller.mintRewards));

export = router;
