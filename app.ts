import * as errorHandler from './middlewares/apiErrorHandler';
import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import assetRoutes from './routes/asset.route';
import droneRoutes from './routes/drone.route';
import contractRoutes from './routes/contract.route';
import inventoryRoutes from './routes/inventory.route';
import lookupRoutes from './routes/lookup.route';
import categoryRoutes from './routes/category.route';

import {
  ALLOW_ORIGIN_1,
  ALLOW_ORIGIN_2,
  ALLOW_ORIGIN_3,
  ALLOW_ORIGIN_4,
  ALLOW_ORIGIN_5,
  ALLOW_ORIGIN_6,
  ALLOW_ORIGIN_7,
} from './utils/constants';
import morganMiddleware from './middlewares/morganMiddleware';
import { createClient } from 'redis';

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 5000 }));

app.use(helmet());

app.use((req, res, next) => {
  const allowedOrigins = [
    ALLOW_ORIGIN_1,
    ALLOW_ORIGIN_2,
    ALLOW_ORIGIN_3,
    ALLOW_ORIGIN_4,
    ALLOW_ORIGIN_5,
    ALLOW_ORIGIN_6,
    ALLOW_ORIGIN_7,
  ];
  const origin = req.headers.origin; //origin attached with req headers

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin); //if request is coming outside of container i.e. web domain
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// use morgan to write out http calls in logs
app.use(morganMiddleware);

//Set routes
app.use('/assets/', assetRoutes);
app.use('/contracts/', contractRoutes);
app.use('/categories/', categoryRoutes);
app.use('/lookups/', lookupRoutes);
app.use('/landBuildings/', lookupRoutes);
app.use('/drones/', droneRoutes);
app.use('/inventory/', inventoryRoutes);

// Error Handler
app.use(errorHandler.notFoundErrorHandler);
app.use(errorHandler.errorHandler);

//create redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

export { app, redisClient };
