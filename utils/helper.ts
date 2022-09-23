import * as crypto from 'crypto';
import util from 'util';
import fs from 'fs';

const unlinkFile = util.promisify(fs.unlink);
const algorithm = 'aes-256-ctr';
const secretKey = process.env.CRYPT_KEY;
const iv = Buffer.alloc(16, 0);

const encrypt = (text) => {
  // the cipher function
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  // encrypt the message
  // input encoding
  // output encoding
  let encryptedData = cipher.update(text, 'utf-8', 'hex');

  encryptedData += cipher.final('hex');

  return encryptedData;
};

const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  let decryptedData = decipher.update(hash, 'hex', 'utf-8');

  decryptedData += decipher.final('utf8');

  return decryptedData;
};

const filterString = (data: string) => {
  data = data
    .replace(/\\n/g, '\\n')
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, '\\&')
    .replace(/\\r/g, '\\r')
    .replace(/\\t/g, '\\t')
    .replace(/\\b/g, '\\b')
    .replace(/\\f/g, '\\f');
  // remove non-printable and other non-valid JSON chars
  data = data.replace(/[\u0000-\u0019]+/g, '');

  return data;
};

const replaceAll = (str: string, find: any, replace: any) => {
  const escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  return str.replace(new RegExp(escapedFind, 'g'), replace);
};
/**
 * If you don't care about primitives and only objects then this function
 * is for you, otherwise look elsewhere.
 * This function will return `false` for any valid json primitive.
 * EG, 'true' -> false
 *     '123' -> false
 *     'null' -> false
 *     '"I'm a string"' -> false
 */

const isValidJSONObject = (jsonString) => {
  try {
    const o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === 'object') {
      return o;
    }
  } catch (e) {}

  return false;
};

const generateString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */

const removeFromJsonArrayById = (arr, id) => {
  const requiredIndex = arr.findIndex((el) => {
    return el.id === id;
  });
  if (requiredIndex === -1) {
    return false;
  }
  return !!arr.splice(requiredIndex, 1);
};

const removeAllTempAttachmentFile = async (files) => {
  if (files?.logo) {
    files.logo.forEach(async (val) => {
      await unlinkFile(val.path);
    });
  }

  if (files?.featured) {
    files.featured.forEach(async (val) => {
      await unlinkFile(val.path);
    });
  }
  if (files?.banner) {
    files.banner.forEach(async (val) => {
      await unlinkFile(val.path);
    });
  }

  if (files?.image) {
    files.image.forEach(async (val) => {
      await unlinkFile(val.path);
    });
  }

  if (files?.animation) {
    files.animation.forEach(async (val) => {
      await unlinkFile(val.path);
    });
  }
  if (files?.sticker) {
    files.sticker.forEach(async (val) => {
      await unlinkFile(val.path);
    });
  }
};

export default {
  encrypt,
  decrypt,
  filterString,
  replaceAll,
  isValidJSONObject,
  generateString,
  getRandomNumber,
  removeAllTempAttachmentFile,
  removeFromJsonArrayById,
};
