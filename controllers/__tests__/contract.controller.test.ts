import { app } from '../../app';
const supertest = require('supertest');
const fs = require('fs');
import sequelize from '../../config/database';
import httpStatusCodes from 'http-status-codes';

describe('test contract get service', () => {
  // Set the db object to a variable which can be accessed throughout the whole test file
  let thisDb: any = sequelize;
  let contractId;

  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await thisDb.sync({ force: true });
  });

  test('GET /contracts/invalidServiceCall should return status 404', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).put('/contracts/invalidServiceCall/').expect(httpStatusCodes.NOT_FOUND);

    expect(response.body).toMatchObject({
      success: false,
    });
  });

  test('GET /getContractById/1 should return status 400', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/contracts/getContractById/1').expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.message).toEqual('contract does not exist.');
  });

  test('GET /contracts should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/contracts').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data).toEqual([]);
  });

  test('POST /contracts/create create asset-passed long length seasonName to generate validator error', async () => {
    const response = await supertest(app)
      .post('/contracts/create')
      .send({
        seasonName:
          'season-1season-1season-1season-1season-1season-1season-1season-1season-1season-1season-1season-1season-1season-1season-1',
        assetType: 'land',
        contractAddress: 'contract Addresses',
        sellerFee: 2.0,
      })
      .expect(httpStatusCodes.INTERNAL_SERVER_ERROR);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('POST /contracts/create create contract -skip season name to generate validator error', async () => {
    const response = await supertest(app)
      .post('/contracts/create')
      .send({
        assetType: 'land',
        contractAddress: 'contract Addresses',
      })
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.UNPROCESSABLE_ENTITY);
  });

  test('POST /contracts/create-create contract', async () => {
    const response = await supertest(app)
      .post('/contracts/create')
      .send({
        seasonName: 'season-1',
        assetType: 'land',
        contractAddress: 'contract Addresses',
        sellerFee: 2.0,
        categoryId: 2,
      })
      .expect(httpStatusCodes.OK);

    contractId = response.body.data.id;
    expect(contractId).toBeTruthy();

    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data).toMatchObject({
      assetType: 'land',
    });
  });

  test('POST /contracts/create-create contract with logo', async () => {
    var data = fs.readFileSync('uploads/image-0.0.0.png');
    const response = await supertest(app)
      .post(`/contracts/create`)
      .attach('logo', data, 'test.png')
      .field('seasonName', 'season-1')
      .field('assetType', 'land')
      .field('sellerFee', 2.0)
      .field('contractAddress', 'contract Addresses1')
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.logoImage).toBeTruthy();
  });

  test('PUT /contracts/update - update contract with logo', async () => {
    var data = fs.readFileSync('uploads/image-0.0.0.png');
    const response = await supertest(app)
      .put(`/contracts/update/1`)
      .attach('logo', data, 'test.png')
      .field('seasonName', 'season-1')
      .field('assetType', 'land')
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.logoImage).toBeTruthy();
  });

  test('run test for contract create-Contract with asset', async () => {
    const response = await supertest(app)
      .post('/contracts/create')
      .send({
        seasonName: 'season-1',
        assetType: 'land',
        contractAddress: 'contract Addresses10',
        sellerFee: 2.0,
        categoryId: 2,
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });
    const response1 = await supertest(app)
      .post('/assets/create')
      .send({
        contractId: response.body.data.id,
        price: 10,
        seasonName: 'season-2',
        assetType: 'land',
        assetStatus: 'available',
        lat: -75.2135205,
        lon: 86.73623535,
        nftIpfsPath: 'ipfs-path',
        nftLocalPath: 'ipfs-local-path',
        assetName: 'Land-1',
      })
      .expect(httpStatusCodes.OK);

    expect(response1.body).toMatchObject({
      success: true,
    });
  });

  test('GET /contracts should retrun data now ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/contracts').expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
  });

  test('GET /contracts/getContractById/:id should retrun data against generated id ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/contracts/getContractById/${contractId}`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.assetType).toEqual('land');
  });

  test('PUT /update/:id should update data against generated id ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/contracts/update/${contractId}`)
      .send({
        contractAddress: 'contract Addresses-updated',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.contractAddress).toEqual('contract Addresses-updated');
  });

  test('PUT /update/:id passing invalid id should generate error ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/contracts/update/100`)
      .send({
        contractAddress: 'contract Addresses-updated',
      })
      .expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.BAD_REQUEST);
    expect(response.body.error.message).toEqual('no contract found against id:100.');
  });

  test('GET /contracts/getcontractsByType/${assetType} should return contracts against assetType ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/contracts/getContractsByAssetType/land`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data[0].assetType).toEqual('land');
  });

  test('GET /contracts/getContractsBySeason/${seasonName} should return contracts against season name ', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get(`/contracts/getContractsBySeason/season-1`).expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data[0].assetType).toEqual('land');
  });



  test('GET /contracts/filter should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/contracts/filter').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.results.length).toEqual(1);
  });

  test('GET /contracts/filter with parameter should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/contracts/filter?assetTypt=land').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.results.length).toEqual(1);
  });

  test('GET /contracts/filter with parameter should return data', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/contracts/filter?categoryId=2').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.results.length).toEqual(1);
  });

  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await thisDb.close();
  });
});
