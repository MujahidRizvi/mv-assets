import express from 'express';
import controller from '../controllers/lookup.controller';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.get('/', asyncHandler(controller.getAllLookups));
router.get('/:id', asyncHandler(controller.getLookupById));
router.get('/getLookupByName/:name', asyncHandler(controller.getLookupByName));
router.get('/getLookupValueByKey/:name/:key', asyncHandler(controller.getLookupValueByKey));
router.post('/create', asyncHandler(controller.createLookup));
router.put('/update/:id', asyncHandler(controller.updateLookup));

export = router;
