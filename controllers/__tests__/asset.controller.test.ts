import { app } from '../../app';
const supertest = require('supertest');
const fs = require('fs');
import sequelize from '../../config/database';
import httpStatusCodes from 'http-status-codes';

describe('test asset get service', () => {
  // Set the db object to a variable which can be accessed throughout the whole test file
  let thisDb: any = sequelize;
  let assetId;

  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await thisDb.sync({ force: true });
  });

  test('GET /assets/invalidServiceCall should return status 404', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).put('/assets/invalidServiceCall/').expect(httpStatusCodes.NOT_FOUND);

    expect(response.body).toMatchObject({
      success: false,
    });
  });

  test('GET /assets/1 should return status 400', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/assets/getById/1').expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.message).toEqual('asset does not exist.');
  });

  test('GET /assets should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/assets').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.result).toEqual([]);
  });

  test('GET /assets/export/land should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/assets/export/land').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.features).toEqual([]);
  });

  test('POST /assets/create create asset-passed invalid contract id to generate validator error', async () => {
    const response = await supertest(app)
      .post('/assets/create')
      .send({
        contractId: '1e',
        seasonName: 'season-1',
        assetType: 'land',
        assetStatus: 'available',
        lat: -75.0089909,
        lon: 86.7367878,
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-1',
      })
      .expect(httpStatusCodes.INTERNAL_SERVER_ERROR);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('POST /assets/create create asset -skip season name to generate validator error', async () => {
    const response = await supertest(app)
      .post('/assets/create')
      .send({
        contractId: '1',
        assetType: 'land',
        assetStatus: 'available',
        lat: -75.0089909,
        lon: 86.7367878,
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-1',
      })
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.UNPROCESSABLE_ENTITY);
  });

  test('POST /assets/create-create asset', async () => {
    const response = await supertest(app)
      .post('/assets/create')
      .send({
        contractId: 1,
        // assetLocation:{type: "FeatureCollection",name: "Test",crs: { type: "name", properties: {name: "urn:ogc:def:crs:OGC:1.3:CRS84" }},features:[{ type: "Feature", properties: { Id: 0 }, geometry: { type: "MultiPolygon", coordinates: [[[[ -0.017876557712653, 0.000007947603294 ], [ -0.018774872908024, 0.000008346968358 ], [ -0.018774473542796, 0.00090666216377 ], [ -0.017876158347425, 0.000906262798554 ], [ -0.017876557712653, 0.000007947603294]]]]}}]},
        seasonName: 'season-1',
        assetType: 'land',
        assetStatus: 'available',
        lat: -75.0089909,
        lon: 86.7367878,
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-1',
      })
      .expect(httpStatusCodes.OK);

    assetId = response.body.data.id;
    expect(assetId).toBeTruthy();

    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data).toMatchObject({
      assetName: 'Land-1',
    });
  });

  test('run test for asset create-duplicate', async () => {
    const response = await supertest(app)
      .post('/assets/create')
      .send({
        contractId: 1,
        assetLocation: {
          type: 'FeatureCollection',
          name: 'Test',
          crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
          features: [
            {
              type: 'Feature',
              properties: { Id: 0 },
              geometry: {
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [-0.017876557712653, 0.000007947603294],
                      [-0.018774872908024, 0.000008346968358],
                      [-0.018774473542796, 0.00090666216377],
                      [-0.017876158347425, 0.000906262798554],
                      [-0.017876557712653, 0.000007947603294],
                    ],
                  ],
                ],
              },
            },
          ],
        },
        seasonName: 'season-1',
        assetType: 'land',
        assetStatus: 'available',
        lat: -75.0089909,
        lon: 86.7367878,
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-1',
      })
      .expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error).toMatchObject({
      message: 'asset already exists on lat lon: -75.0089909,86.7367878.',
    });
  });

  test('GET /assets should retrun data now ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/assets').expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
  });

  test('GET /assets/getById/:id should retrun data against generated id ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/assets/getById/${assetId}`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.assetName).toEqual('Land-1');
  });

  test('PUT /update/:id should update data against generated id ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/update/${assetId}`)
      .send({
        assetName: 'Land-2',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.assetName).toEqual('Land-2');
  });

  test('PUT /update/:id passing invalid id should generate error ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/update/100`)
      .send({
        assetName: 'Land-3',
      })
      .expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.BAD_REQUEST);
    expect(response.body.error.message).toEqual('Error: no asset found against id:100.');
  });

  test('PUT /update/:id passing sticker ', async () => {
    // App is used with supertest to simulate server request
    const data = fs.readFileSync('uploads/image-0.0.0.png');
    const response = await supertest(app)
      .put(`/assets/update/${assetId}`)
      .attach('sticker', data, 'test.png')
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.stickerName).toBeTruthy();
  });

  test('PUT /update/:id passing description ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/update/${assetId}`)
      .send({
        description: 'Details',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.description).toEqual('Details');
  });

  test('PUT /updateAssetStatus/:id should update status against generated id ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/updateAssetStatus/${assetId}`)
      .send({
        assetStatus: 'owned',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.assetStatus).toEqual('owned');
  });

  test('PUT /updateAssetStatus/:id  passing invalid id should generate error ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/updateAssetStatus/100`)
      .send({
        assetStatus: 'owned',
      })
      .expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.BAD_REQUEST);
    expect(response.body.error.message).toEqual('no asset found against id:100.');
  });

  test('PUT /updateAssetStatus/:id  not passing assetStatus should generate error ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/updateAssetStatus/${assetId}`)
      .send({
        assetStatus12: 'owned',
      })
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });
    expect(response.body.error.code).toEqual(httpStatusCodes.UNPROCESSABLE_ENTITY);
  });

  test('PUT /updateAssetOwner/:id should update owner against generated id ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/updateAssetOwner/${assetId}`)
      .send({
        ownerId: '12',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.ownerId).toEqual('12');
  });

  test('PUT /updateAssetOwner/:id  passing invalid id should generate error ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/updateAssetOwner/100`)
      .send({
        ownerId: '12',
      })
      .expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.BAD_REQUEST);
    expect(response.body.error.message).toEqual('no asset found against id:100.');
  });

  test('PUT /updateAssetOwner/:id  not passing ownerId should generate error ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/assets/updateAssetOwner/${assetId}`)
      .send({
        ownerId12: '12',
      })
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });
    expect(response.body.error.code).toEqual(httpStatusCodes.UNPROCESSABLE_ENTITY);
  });

  test('GET /assets/getByContract/${contractId} should return assets against contract ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/assets/getByContract/1`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data[0].assetName).toEqual('Land-2');
  });

  test('GET /assets/getAssetsByOwner/${id} should return assets against owner ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/assets/getAssetsByOwner/12`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.result[0].assetName).toEqual('Land-2');
  });

  test('GET /assets/getAssetsByType/${assetType} should return assets against assetType ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/assets/getAssetsByType/land`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data[0].assetName).toEqual('Land-2');
  });

  test('GET /assets/getAssetsBySeason/${seasonName} should return assets against season name ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/assets/getAssetsBySeason/season-1`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data[0].assetName).toEqual('Land-2');
  });

  test('GET /assets/getAssetsByType/${assetType} should return assets against assetType ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/assets/getAssetsByType/land`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data[0].assetName).toEqual('Land-2');
  });

  test('GET /assets/getAssetsBySeason/${seasonName} should return assets against season name ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/assets/getAssetsBySeason/season-1`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data[0].assetName).toEqual('Land-2');
  });

  test('POST /assets/import/land- Create', async () => {
    const response = await supertest(app)
      .post('/assets/import/land')
      .send({
        contractId: 1,
        features: [
          {
            type: 'Feature',
            properties: { plotId: 800 },
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [-0.017876557712653, 0.000007947603294],
                    [-0.018774872908024, 0.000008346968358],
                    [-0.018774473542796, 0.00090666216377],
                    [-0.017876158347425, 0.000906262798554],
                    [-0.017876557712653, 0.000007947603294],
                  ],
                ],
              ],
            },
          },
        ],
        seasonName: 'season-1',
        assetType: 'land',
        assetStatus: 'available',
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-100',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });
  });

  test('run test for asset import-duplicate', async () => {
    const response = await supertest(app)
      .post('/assets/import/land')
      .send({
        contractId: 1,
        features: [
          {
            type: 'Feature',
            properties: { plotId: 800 },
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [-0.017876557712653, 0.000007947603294],
                    [-0.018774872908024, 0.000008346968358],
                    [-0.018774473542796, 0.00090666216377],
                    [-0.017876158347425, 0.000906262798554],
                    [-0.017876557712653, 0.000007947603294],
                  ],
                ],
              ],
            },
          },
        ],
        seasonName: 'season-1',
        assetType: 'land',
        assetStatus: 'available',
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-100',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });
  });

  test('run test for asset import-Create Skip featuers', async () => {
    const response = await supertest(app)
      .post('/assets/import/land')
      .send({
        contractId: 1,
        seasonName: 'season-1',
        assetType: 'land',
        assetStatus: 'available',
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-100',
      })
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toMatchObject({
      success: false,
    });
  });

  test('run test for asset import-Create featuers to be an empty array', async () => {
    const response = await supertest(app)
      .post('/assets/import/land')
      .send({
        contractId: 1,
        features: [],
        seasonName: 'season-1',
        assetType: 'land',
        assetStatus: 'available',
        imageName: 'ipfs-path',
        animationName: 'ipfs-local-path',
        assetName: 'Land-100',
      })
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toMatchObject({
      success: false,
    });
  });

  test('GET /assets/export/land with minId and maxId same provided should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/assets/export/land?minId=1&maxId=1').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.features.length).toEqual(1);
  });

  test('GET /assets/export/land with minId and maxId  provided should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/assets/export/land?minId=1&maxId=10').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.features.length).toEqual(1);
  });

  test('GET /assets/export/land with minId and maxId and page provided size not provided provided should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/assets/export/land?minId=1&maxId=10&page=1').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.features.length).toEqual(1);
  });

  test('GET /assets/export/land with minId and maxId and size  provided should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .get('/assets/export/land?minId=1&maxId=10&pageSize=1')
      .expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.features.length).toEqual(1);
  });

  test('GET /assets/export/land with minId , maxId ,page and size  provided should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .get('/assets/export/land?minId=1&maxId=10&pageSize=10&page=2')
      .expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.features.length).toEqual(0);
  });

  test('GET /assets/export/land with all parameter as non numeric should return error', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .get('/assets/export/land?minId=abcd&maxId=ad&pageSize=asd&page=ada')
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toMatchObject({
      success: false,
    });
    expect(response.body.error.message).toEqual(
      '{"error":"Numeric value required for:minId."},{"error":"Numeric value required for:maxId."},{"error":"Numeric value required for:page."},{"error":"Numeric value required for:pageSize."}',
    );
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await thisDb.close();
  });
});
