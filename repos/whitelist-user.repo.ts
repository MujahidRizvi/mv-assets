import Logger from '../config/logger';
import WhiteListUser from '../models/whitelist-user.model';

/*
 *get all whitelist users
 */
const getAllWhiteListUser = async () => {
  Logger.info('WhiteListUserRepo:getAllWhiteListUser(): - start');

  const result = await WhiteListUser.findAll();

  Logger.info('WhiteListUserRepo:getAllWhiteListUser(): - end');

  return result;
};

/*
 *get whiteListUsers by contractId
 */
const getwhiteListUsersByContractId = async (contractId: number) => {
  Logger.info('WhiteListUserRepo:getwhiteListUsersByContractId(): - start');

  const result = await WhiteListUser.findAll({ where: { contractId } });

  Logger.info('WhiteListUserRepo:getwhiteListUsersByContractId(): - end');

  return result;
};

/*
 *get whiteListUsers by contractId
 */
const getwhiteListUsersByContractIdAndUser = async (contractId: number, user: string) => {
  Logger.info('WhiteListUserRepo:getwhiteListUsersByContractIdAndUser(): - start');

  const result = await WhiteListUser.findOne({ where: { contractId, user } });

  Logger.info('WhiteListUserRepo:getwhiteListUsersByContractIdAndUser(): - end');

  return result;
};

/*
 *create whiteListUser method , it will create a new whiteListUser entry
 */
const createWhiteListUser = async (whiteListUser: any) => {
  try {
    Logger.info('WhiteListUserRepo:createWhiteListUser(): - start');
    //call the save method to save the user account
    const result = await whiteListUser.save();

    Logger.info('WhiteListUserRepo:createWhiteListUser(): - end');

    return result;
  } catch (e) {
    Logger.error(`WhiteListUserRepo:createWhiteListUser(): ${e} `);
    return e;
  }
};

const createUpdateWhiteListUserBulk = async (whiteListUsers: any) => {
  try {
    Logger.info('WhiteListUserRepo:createUpdateWhiteListUserBulk(): - start');

    const result = await WhiteListUser.bulkCreate(whiteListUsers, {
      updateOnDuplicate: ['contractId', 'user'],
    });
    Logger.info('WhiteListUserRepo:createUpdateWhiteListUserBulk(): - end');

    return result;
  } catch (e) {
    Logger.error(`WhiteListUserRepo:createUpdateWhiteListUserBulk(): ${e} `);
    return e;
  }
};

/*
 *deleteAll
 */
const deleteAll = async (contractId: number) => {
  Logger.info('WhiteListUserRepo:deleteAll(): - start');

  const result = await WhiteListUser.destroy({ where: { contractId }, truncate: true, restartIdentity: true });

  Logger.info('WhiteListUserRepo:deleteAll(): - end');

  return result;
};
export default {
  getAllWhiteListUser,
  getwhiteListUsersByContractId,
  createUpdateWhiteListUserBulk,
  getwhiteListUsersByContractIdAndUser,
  createWhiteListUser,
  deleteAll,
};
