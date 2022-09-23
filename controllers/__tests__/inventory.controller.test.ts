import { app, redisClient } from '../../app';
const supertest = require('supertest');
const fs = require('fs');
import sequelize from '../../config/database';
import httpStatusCodes from 'http-status-codes';
//import contractRepo from '../../repos/contract.repo';
import inventoryModel from '../../models/inventory.model';
import contractModel from '../../models/contract.model';
import { create } from 'ipfs-http-client';
import { Op } from 'sequelize';
const ethers = require('ethers');

jest.mock('ethers', () => {
  return {
    Contract: jest.fn().mockImplementation(() => {
      return {
        getPlayerInfo: jest.fn().mockImplementation(() => {
          return {
            ipfsHash: 'QmPVmwqepZtCdvmwx1eY4X9d6KGhk4LT7hNFcxxUP79Hvp',
            player_inventory: [{}, {}],
          };
        }),
        getRewardsByAddress: jest.fn().mockImplementation(() => {
          return [{ rewardId: 1, rewardCopies: 3 }];
        }),
        mintReward: jest.fn().mockImplementation(() => {
          return { hash: '13123' };
        }),
        mintRewardsOnAddress: jest.fn().mockImplementation(() => {
          return { hash: '13123' };
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
              yield* await [Buffer.from(JSON.stringify({ player_inventory: [{}, {}] }))];
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

beforeEach(() => {
  //etherInst.mockReset();
  // redisMock.restoreAllMocks()
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

    // Add in providerAccount table
    await inventoryModel.create({
      id: 1,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
    await inventoryModel.create({
      id: 2,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
    await inventoryModel.create({
      id: 3,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
    await inventoryModel.create({
      id: 4,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
    await inventoryModel.create({
      id: 5,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
    await inventoryModel.create({
      id: 6,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
    await inventoryModel.create({
      id: 7,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: true,
      createdBy: 'test',
      updatedBy: 'test',
    });
    await inventoryModel.create({
      id: 8,
      cid: 'test',
      metaData: 'test',
      type: 'drone',
      contractAbi: [],
      blockNumber: '2424234',
      isActive: false,
      createdBy: 'test',
      updatedBy: 'test',
    });

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
    await contractModel.create({
      id: 4,
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
    await contractModel.create({
      id: 5,
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
  });
  beforeEach(() => {});
  it('Get all Inventory', async () => {
    const response = await supertest(app).get('/inventory').expect(httpStatusCodes.OK);
    expect(response.body.data.length).toEqual(8);
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });
  it('Get Active Inventory', async () => {
    const response = await supertest(app).get('/inventory/getActive').expect(httpStatusCodes.OK);
    expect(response.body.data.length).toEqual(7);
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });

  it('Get Inventory By Id', async () => {
    const response = await supertest(app).get('/inventory/getById/1').expect(httpStatusCodes.OK);
    expect(response.body.data.id).toEqual(1);
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });

  it('Get Randow Reward', async () => {
    const response = await supertest(app).get('/inventory/getRandomReward').expect(httpStatusCodes.OK);
    expect(response.body.data).toEqual('test');
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });
  it('Get Reward by player', async () => {
    const response = await supertest(app).get('/inventory/getRewardsByPlayer/12345').expect(httpStatusCodes.OK);
    expect(response.body.data.unclaimed.length).toEqual(2);
    expect(response.body.data.claimed.length).toEqual(3);
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });
  it('Mint reward-Bulk', async () => {
    // redisMock.autoMockOff();
    const getMock = jest.spyOn(redisClient, 'get');
    const setMock = jest.spyOn(redisClient, 'set');
    getMock.mockResolvedValue(JSON.stringify({ player_inventory: [{ id: 1 }, { id: 2 }, { id: 3 }] }));
    setMock.mockResolvedValue('');
    const response = await supertest(app)
      .post('/inventory/mintRewards')
      .send({
        address: '12345',
        rewardIds: [1, 2, 3],
      })
      .expect(httpStatusCodes.OK);
    // expect(response.body.data.unclaimed.length).toEqual(2);
    expect(response.body.data.txnHash).toEqual('13123');
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });
  it('Mint reward-Single', async () => {
    // redisMock.autoMockOff();
    const getMock = jest.spyOn(redisClient, 'get');
    const setMock = jest.spyOn(redisClient, 'set');
    getMock.mockResolvedValue(JSON.stringify({ player_inventory: [{ id: 1 }, { id: 2 }, { id: 3 }] }));
    setMock.mockResolvedValue('');
    const response = await supertest(app)
      .post('/inventory/mintRewards')
      .send({
        address: '12345',
        rewardIds: [1],
      })
      .expect(httpStatusCodes.OK);
    // expect(response.body.data.unclaimed.length).toEqual(2);
    expect(response.body.data.txnHash).toEqual('13123');
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });

  it('Mint reward-Single -Item not in inventory', async () => {
    // redisMock.autoMockOff();
    const getMock = jest.spyOn(redisClient, 'get');
    const setMock = jest.spyOn(redisClient, 'set');
    getMock.mockResolvedValue(JSON.stringify({ player_inventory: [{ id: 1 }, { id: 2 }, { id: 3 }] }));
    setMock.mockResolvedValue('');
    const response = await supertest(app)
      .post('/inventory/mintRewards')
      .send({
        address: '12345',
        rewardIds: [6],
      })
      .expect(httpStatusCodes.BAD_REQUEST);
    // expect(response.body.data.unclaimed.length).toEqual(2);

    //expect(response.body.data.availableDrones.length).toEqual(1);
  });

  it('Mint reward- Bulk -Item not in inventory', async () => {
    // redisMock.autoMockOff();
    const getMock = jest.spyOn(redisClient, 'get');
    const setMock = jest.spyOn(redisClient, 'set');
    getMock.mockResolvedValue(JSON.stringify({ player_inventory: [{ id: 1 }, { id: 2 }, { id: 3 }] }));
    setMock.mockResolvedValue('');
    const response = await supertest(app)
      .post('/inventory/mintRewards')
      .send({
        address: '12345',
        rewardIds: [6, 4],
      })
      .expect(httpStatusCodes.BAD_REQUEST);
    // expect(response.body.data.unclaimed.length).toEqual(2);

    //expect(response.body.data.availableDrones.length).toEqual(1);
  });

  it('Mint reward- Bulk -Empty inventory', async () => {
    // redisMock.autoMockOff();
    const getMock = jest.spyOn(redisClient, 'get');
    const setMock = jest.spyOn(redisClient, 'set');
    getMock.mockResolvedValue(JSON.stringify({ player_inventory: [] }));
    setMock.mockResolvedValue('');
    const response = await supertest(app)
      .post('/inventory/mintRewards')
      .send({
        address: '12345',
        rewardIds: [6, 4],
      })
      .expect(httpStatusCodes.BAD_REQUEST);
    // expect(response.body.data.unclaimed.length).toEqual(2);

    //expect(response.body.data.availableDrones.length).toEqual(1);
  });

  it('Get Randow Reward-inventory not available', async () => {
    await inventoryModel.destroy({
      where: {
        id: { [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8] },
      },
    });
    const response = await supertest(app).get('/inventory/getRandomReward').expect(httpStatusCodes.BAD_REQUEST);
    //expect(response.body.data.availableDrones.length).toEqual(1);
  });

  afterAll(async () => {
    await thisDb.close();
    await redisClient.quit();
  });
});
