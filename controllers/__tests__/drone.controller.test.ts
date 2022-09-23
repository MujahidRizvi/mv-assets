import { app, redisClient } from '../../app';
const supertest = require('supertest');
const fs = require('fs');
import sequelize from '../../config/database';
import httpStatusCodes from 'http-status-codes';
//import contractRepo from '../../repos/contract.repo';
import droneModel from '../../models/drone.model';
import contractModel from '../../models/contract.model';
import { create } from 'ipfs-http-client';
const ethers = require('ethers');
import httpClient from '../../utils/httpclient';
import { exceptions } from 'config/logger';

jest.mock('ethers', () => {
  return {
    Contract: jest.fn().mockImplementation(() => {
      return {
        getDronesByAddress: jest.fn().mockImplementation(() => {
          return [
            {
              metadataHash: 'QmPVmwqepZtCdvmwx1eY4X9d6KGhk4LT7hNFcxxUP79Hvp',
              droneID: { _hex: '0x01' },
            },
          ];
        }),
        getDroneInfo: jest.fn().mockImplementation(() => {
          return {
            droneId: '123',
          };
        }),
        updateDroneToSale: jest.fn().mockImplementation(() => {
          return {};
        }),
      };
    }),
    Wallet: jest.fn().mockImplementation(() => {
      return {};
    }),
    providers: { JsonRpcProvider: jest.fn().mockImplementation() },
    utils: { parseEther: jest.fn().mockImplementation() },
  };
});

jest.mock('ipfs-http-client', () => {
  return {
    create: jest.fn().mockImplementation(() => {
      return {
        cat: jest.fn().mockImplementation(() => {
          return {
            async *[Symbol.asyncIterator]() {
              yield* await [
                Buffer.from(
                  JSON.stringify({
                    name: 'NFT-Drone-7',
                    description: 'NFT Drone 7',
                    image: 'https://ipfs.io/ipfs/QmNadZKKHNnc5sS1N261pMV4fb5D1ym2f7fxAUcPo1sDVF',
                    animation_url: '',
                    attributes: [
                      {
                        trait_type: 'drone_type',
                        value: 'Flying Drone',
                      },
                      {
                        trait_type: 'drone_category',
                        value: 'Airel',
                      },
                      {
                        trait_type: 'length',
                        value: '200',
                      },
                      {
                        trait_type: 'max_speed',
                        value: '90 km',
                      },
                      {
                        trait_type: 'speed_controller',
                        value: 'no',
                      },
                      {
                        trait_type: 'flight_time',
                        value: '2h',
                      },
                      {
                        trait_type: 'flight_battery',
                        value: 'no',
                      },
                      {
                        trait_type: 'gps',
                        value: 'yes',
                      },
                      {
                        trait_type: 'parking_capability',
                        value: 'yes',
                      },
                    ],
                  }),
                ),
              ];
            },
          };
        }),
      };
    }),
  };
});

jest.mock('redis', () => {
  return {
    createClient: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn().mockImplementation(() => {
          return null;
        }),
        set: jest.fn().mockImplementation(() => {
          return null;
        }),
        del: jest.fn().mockImplementation(() => {
          return null;
        }),
        connect: jest.fn().mockImplementation(),
      };
    }),
  };
});

//jest.mock('../../repos/drone.repo');
//const etherInst = ethers as jest.Mock<typeof ethers>;
//const getContractById = contractRepo.getContractById as jest.Mock;
//const getAllDroneCount = droneRepo.getAllDroneCount as jest.Mock;
//const getDrones = droneRepo.getDrones as jest.Mock;
//const redisGet = redisClient.get as jest.Mock;
//const redisDel = redisClient.del as jest.Mock;
//const redisSet = redisClient.set as jest.Mock;

beforeEach(() => {
  //etherInst.mockReset();
  //redisGet.mockReset();
  //redisSet.mockReset()
});

describe('test contract get service', () => {
  let thisDb: any = sequelize;
  let contractId: any;
  // Set the db object to a variable which can be accessed throughout the whole test file
  const userData = {
    val: 'Hey',
  };
  beforeAll(async () => {
    await thisDb.sync({ force: true });
    // await redisClient.

    // Add in providerAccount table
    await contractModel.create({
      id: 3,
      seasonName: 'test',
      assetType: 'drone',
      contractAddress: '12313213',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
      name: 'test',
      description: 'test',
      logoImage: '',
      featuredImage: '',
      bannerImage: '',
      category: 'drone',
      payoutAddress: '1332',
      sellerFee: 10.0,
    });
    droneModel.create({
      id: 3,
      name: 'test',
      droneCID: 'drone',
      contractId: '12313213',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
  });

  it('Get all available and free drones', async () => {
    /* getContractById.mockResolvedValue({
      contractAddress: '123',
      contractAbi: [],
    });*/
    //  getAllDroneCount.mockResolvedValue(1);
    /*getDrones.mockResolvedValue([
      {
        dataValues: { droneCID: 'QmPVmwqepZtCdvmwx1eY4X9d6KGhk4LT7hNFcxxUP79Hvp' },
      },
    ]);*/
    // redisGet.mockResolvedValue(null);
    const response = await supertest(app).get('/drones').expect(httpStatusCodes.OK);
    expect(response.body.data.freeDrones.length).toEqual(1);
    expect(response.body.data.availableDrones.length).toEqual(1);
  });
  it('Get all available ,free and player drones', async () => {
    const postMock = jest.spyOn(httpClient, 'post');
    postMock.mockResolvedValue({});
    const response = await supertest(app).get('/drones?playerAddress=13123131').expect(httpStatusCodes.OK);
    expect(response.body.data.freeDrones.length).toEqual(1);
    expect(response.body.data.availableDrones.length).toEqual(1);
    expect(response.body.data.playerDrones.length).toEqual(1);
  });

  it('Get all available ,free and player drones - Cache miss', async () => {
    const postMock = jest.spyOn(redisClient, 'get');
    postMock.mockResolvedValue(
      JSON.stringify([
        {
          metadataHash: 'QmPVmwqepZtCdvmwx1eY4X9d6KGhk4LT7hNFcxxUP79Hvp',
          droneID: { _hex: '0x01' },
        },
      ]),
    );

    const response = await supertest(app).get('/drones?playerAddress=13123131').expect(httpStatusCodes.OK);
    expect(response.body.data.freeDrones.length).toEqual(1);
    expect(response.body.data.availableDrones.length).toEqual(1);
    expect(response.body.data.playerDrones.length).toEqual(1);
  });


  it('Mark drone for sale', async () => {
    const response = await supertest(app)
      .post('/drones/markforsale')
      .send({ droneId: '0x01', price: '0x012345' })
      .expect(httpStatusCodes.OK);
    expect(response.body.data.droneId).toEqual('123');
  });
  afterAll(async () => {
    await thisDb.close();
    await redisClient.quit();
  });
});
