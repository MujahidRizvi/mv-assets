import express from 'express';
import controller from '../controllers/land-building.controller';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.get('/', asyncHandler(controller.getAllLandBuildings));
router.get('/:id', asyncHandler(controller.getLandBuildingById));
router.get('/getByLand/:landId', asyncHandler(controller.getLandBuildingsByLandId));
router.get('/getByBuilding/:buildingId', asyncHandler(controller.getLandBuildingsByBuildingId));
router.post('/create', asyncHandler(controller.createLandBuilding));
router.put('/update/:id', asyncHandler(controller.updateLandBuilding));

export = router;
