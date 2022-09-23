import { app } from '../../app';
const supertest = require('supertest');
const fs = require('fs');
import sequelize from '../../config/database';
import httpStatusCodes from 'http-status-codes';
import Category from '../../models/category.model';

describe('test categories', () => {
  // Set the db object to a variable which can be accessed throughout the whole test file
  let thisDb: any = sequelize;

  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await thisDb.sync({ force: true });
    await Category.create({
      isActive: true,
      createdBy: 'System',
      updatedBy: 'System',
      name: 'test',
      description: 'test',
      logoImage: 'test',
    });
  });

  test('GET /categories should return []', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app).get('/categories').expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.length).toEqual(1);
  });

  test('POST /categories create categories-success', async () => {
    const response = await supertest(app)
      .post('/categories/create')
      .send({
        name: 'Test',
        description: 'desc',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.name).toEqual('Test');
  });
  test('POST /create categories-failed- already exist', async () => {
    const response = await supertest(app)
      .post('/categories/create')
      .send({
        name: 'test',
        description: 'desc',
      })
      .expect(httpStatusCodes.BAD_REQUEST);

    expect(response.body).toMatchObject({
      success: false,
    });
  });

  test('POST /categories create categories-failed- validation error', async () => {
    const response = await supertest(app)
      .post('/categories/create')
      .send({})
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(httpStatusCodes.UNPROCESSABLE_ENTITY);
  });

  test('POST /create create category - success - with logo ', async () => {
    // App is used with supertest to simulate server request
    var data = fs.readFileSync('uploads/image-0.0.0.png');
    const response = await supertest(app)
      .post(`/categories/create`)
      .attach('logo', data, 'test.png')
      .field('name', 'test5')
      .field('description', 'test5')
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.logoImage).toBeTruthy();
    expect(response.body.data.name).toEqual('test5');
  });

  test('PUT /update/:id - success', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/categories/update/1`)
      .send({
        name: 'test1',
      })
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });

    expect(response.body.data.name).toEqual('test1');
  });

  test('PUT /put update category - success - with logo ', async () => {
    // App is used with supertest to simulate server request
    var data = fs.readFileSync('uploads/image-0.0.0.png');
    const response = await supertest(app)
      .put(`/categories/update/1`)
      .attach('logo', data, 'test.png')
      .field('name', 'test9')
      .field('description', 'test9')
      .expect(httpStatusCodes.OK);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: true,
    });
    expect(response.body.data.logoImage).toBeTruthy();
    expect(response.body.data.name).toEqual('test9');
  });

  test('PUT /put update category - failed - validation error', async () => {
    // App is used with supertest to simulate server request
    var data = fs.readFileSync('uploads/image-0.0.0.png');
    const response = await supertest(app)
      .put(`/categories/update/1`)
      .field('name', '')
      .expect(httpStatusCodes.UNPROCESSABLE_ENTITY);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });
    expect(response.body.error.code).toEqual(httpStatusCodes.UNPROCESSABLE_ENTITY);
  });

  test('PUT /put update category - failed - with logo ', async () => {
    // App is used with supertest to simulate server request
    var data = fs.readFileSync('uploads/image-0.0.0.png');
    const response = await supertest(app)
      .put(`/categories/update/20`)
      .attach('logo', data, 'test.png')
      .field('name', 'test9')
      .field('description', 'test9')
      .expect(httpStatusCodes.NOT_FOUND);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });
    expect(response.body.error.code).toEqual(404);
  });

  test('PUT /update/:id - failed - invalid id', async () => {
    // App is used with supertest to simulate server request
    const response = await supertest(app)
      .put(`/categories/update/11`)
      .send({
        name: 'test1',
      })
      .expect(httpStatusCodes.NOT_FOUND);

    expect(response.body).toBeTruthy();
    expect(response.body).toMatchObject({
      success: false,
    });

    expect(response.body.error.code).toEqual(404);
    // expect(response.body.error.message).toEqual('no contract found against id:100.');
  });
  // After all tersts have finished, close the DB connection
  afterAll(async () => {
    await thisDb.close();
  });
});
