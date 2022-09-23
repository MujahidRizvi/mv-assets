import FormData from 'form-data';
import fs from 'fs';
import httpClient from '../utils/httpclient';
import Logger from '../config/logger';

// uploadFile
const uploadFileToIPFS = async (file) => {
  let data = new FormData();
  data.append('file', fs.createReadStream(file.path));

  const pinataFileOptions = {
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
      'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
    },
  };

  const pinToPinata = await httpClient.post(process.env.PINATA_PIN_FILE_URL, data, pinataFileOptions);

  return pinToPinata.IpfsHash;
};

// uploadJsonFileToIPFS
const uploadJsonFileToIPFS = async (jsonData: string) => {
  const pinataJsonOptions = {
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
      'Content-Type': 'application/json',
    },
    maxContentLength: 10000000000,
    maxBodyLength: 100000000000,
  };

  const pinToPinata = await httpClient.post(process.env.PINATA_PIN_JSON_URL, jsonData, pinataJsonOptions);

  return pinToPinata.IpfsHash;
};

// getDataByHash
const getDataByHash = async (hash: string) => {
  Logger.info('PinataService:getDataByHash(): - start');

  const data = await httpClient.get(process.env.PINATA_GET_URL.concat(hash));

  Logger.info('PinataService:getDataByHash(): - end');

  return data;
};

export default {
  uploadFileToIPFS,
  uploadJsonFileToIPFS,
  getDataByHash,
};
