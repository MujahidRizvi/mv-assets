import Logger from '../config/logger';
import Category from '../models/category.model';

/*
 *get asset types
 */
const getAllCategories = async (page: number, size: number) => {
  Logger.info('Category Repo:getAllCategories(): - start');
  let pageSize: number = 0;
  
  if (size !== Number.MAX_SAFE_INTEGER) pageSize = (page - 1) * size;
  const result = await Category.findAll({
  //  where: { isActive: true },
    order: [['position', 'ASC']],
    offset: pageSize,
    limit: size,
    attributes: [
      'id',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'updatedAt',
      'createdAt',
      'dynamicContent',
      'name',
      [
        Category.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
    ],
  });

  Logger.info('Category Repo:getAllCategories(): - end');

  return result;
};

/*
 *get asset types
 */
 const getActiveCategories = async () => {
  Logger.info('Category Repo:getActiveCategories(): - start');

  const result = await Category.findAll({
    where: { isActive: true },
    order: [['id', 'ASC']],
    attributes: [
      'id',
      'createdBy',
      'updatedBy',
      'isActive',
      'description',
      'dynamicContent',
      'updatedAt',
      'createdAt',
      'name',
      [
        Category.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
    ],
  });

  Logger.info('Category Repo:getActiveCategories(): - end');

  return result;
};

const createCategory = async (category: any) => {
  try {
    Logger.info('CategoryRepo:createCategory(): - start');
    //call the save method to save the user account
    const result = await category.save();

    Logger.info('CategoryRepo:createCategory(): - end');

    return result;
  } catch (e) {
    Logger.error(`CategoryRepo:createCategory(): ${e} `);
    return e;
  }
};

const getAllCategoryCount = async () => {
  Logger.info('CategoryRepo:getAllCategoryCount(): - start');

  const result = await Category.findAndCountAll();

  Logger.info('CategoryRepo:getAllCategoryCount(): - end');

  return result.count;
};

const updateCategory = async (categoryId: any, category: any) => {
  try {
    Logger.info('CategoryRepo:updateCategory(): - start');
    //call the save method to save the user account
    const result = await Category.update(category, {
      where: {
        id: categoryId,
      },
      returning: true,
      plain: true,
    });

    Logger.info('CategoryRepo:updateCategory(): - end');

    return result;
  } catch (e) {
    Logger.error(`CategoryRepo:updateCategory(): ${e} `);
    return e;
  }
};

const getCategoryByName = async (name: string) => {
  Logger.info('CategoryRepo:getCategoryByName(): - start');

  const result = await Category.findOne({
    attributes: [
      'id',
      'name',
      'description',
      'isActive',
      'createdBy',
      'updatedBy',
      'updatedAt',
      'createdAt',
      [
        Category.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
    ],
    where: { name },
  });

  Logger.info('CategoryRepo:getCategoryByName(): - end');

  return result;
};

const getCategoryById = async (id: string) => {
  Logger.info('CategoryRepo:getCategoryById(): - start');

  const result = await Category.findOne({
    attributes: [
      'id',
      'name',
      'description',
      'isActive',
      'createdBy',
      'updatedBy',
      'updatedAt',
      'createdAt',
      [
        Category.sequelize.literal(
          `(CASE WHEN \"logoImage\" IS NULL THEN \"logoImage\" ELSE CONCAT('${process.env.PINATA_GET_URL}',\"logoImage"\) END)`,
        ),
        'logoImage',
      ],
    ],
    where: { id },
  });

  Logger.info('CategoryRepo:getCategoryById(): - end');

  return result;
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategoryByName,
  getCategoryById,
  getAllCategoryCount,
  getActiveCategories
};
