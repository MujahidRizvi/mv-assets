export default {
  ASSET_NAME_REQUIRED: 'asset name is required.',
  ASSET_ID_REQUIRED: 'asset id is required.',
  ASSET_ID_NUMERIC: 'asset id should be numeric.',
  SEASON_NAME_REQUIRED: 'season name is required.',
  ASSET_TYPE_REQUIRED: 'asset type is required.',
  ASSET_STATUS_REQUIRED: 'asset status is required.',
  ASSET_LOCATION_REQUIRED: 'asset location is required.',
  ASSET_LAT_REQUIRED: 'latitude is required.',
  ASSET_LON_REQUIRED: 'longitude is required.',
  ASSET_RADIUS_REQUIRED: 'radius is required.',
  ASSET_LOCATION_NOT_VALID: 'asset location is not a valid json object.',
  ASSET_RADIUS_NOT_VALID: 'asset radius is not valid.',
  INVALID_ASSET_CREDENTIALS: 'invalid asset.',
  ASSET_NOT_EXIST: 'asset does not exist.',
  ASSET_DESCRIPTION_LENGTH: 'Description should be less than 512 characters.',
  ASSET_NOT_FOUND: (errorData?: any): string => `no asset found against id:${errorData.id}.`,
  ASSET_EXIST_WITH_NAME: (errorData?: any): string => `asset already exists with the same name: ${errorData.name}.`,
  ASSET_EXIST_WITH_LAT_LON: (errorData?: any): string => `asset already exists on lat lon: ${errorData.data}.`,
  OWNER_ID_REQUIRED: 'owner id is required.',
  OWNER_ID_NUMERIC: 'owner id should be numeric.',
  CONTRACT_ID_REQUIRED: 'contract id is required.',
  CONTRACT_ID_NUMERIC: 'contract id should be numeric.',
  CONTRACT_NOT_EXIST: 'contract does not exist.',
  CONTRACT_EXIST_WITH_ADRESS: (errorData?: any): string =>
    `contract already exists with the same address: ${errorData.address}.`,
  CATEGORY_EXIST_WITH_NAME: (errorData?: any): string =>
    `category already exists with the same name: ${errorData.name}.`,
  CATEGORY_DOES_NOT_EXIST: `category doesnot exist.`,
  CONTRACT_NOT_FOUND: (errorData?: any): string => `no contract found against id:${errorData.id}.`,
  CONTRACT_ADDRESS_REQUIRED: 'contract address is required.',
  NUMERIC_TYPE_ERROR: (field: any): string => `Numeric value required for:${field}.`,
  DECIMAL_TYPE_ERROR: (field: any): string => `Decimal value required for:${field}.`,
  REQUIRED_ERROR: (field: any): string => `${field} is required.`,
  FAILED_UPLOAD_ERROR: (field: any): string => `Failed uploading ${field}.`,
  LOCATION_CALCULATE_ERROR: `Failed calculating location coordinates.`,
  LENGTH_MAX_MIN_ERROR: (errorData?: any): string =>
    `Length of ${errorData.field} should be greater than ${errorData.min} and less than ${errorData.max}.`,
  REQUIRED_LENGTH_MAX_MIN_ERROR: (errorData?: any): string =>
    `${errorData.field} is required with length of greater than ${errorData.min} and less than ${errorData.max}.`,

  LOOKUP_ID_REQUIRED: 'lookup id is required.',
  LOOKUP_ID_NUMERIC: 'lookup id should be numeric.',
  LOOKUP_NOT_EXIST: 'lookup does not exist.',
  LOOKUP_EXIST_WITH_NAME: (errorData?: any): string => `lookup already exists with the same name: '${errorData.name}'.`,
  LOOKUP_NOT_FOUND: (errorData?: any): string => `no lookup found against id:${errorData.id}.`,
  LOOKUP_NAME_REQUIRED: 'lookup name is required.',
  LAND_BUILDING_ID_REQUIRED: ' id is required.',
  LAND_BUILDING_ID_NUMERIC: 'id should be numeric.',
  LAND_BUILDING_NOT_EXIST: 'land building association does not exist.',
  LAND_ID_REQUIRED: 'land id is required.',
  LAND_ID_NUMERIC: 'land id should be numeric.',
  BUILDING_ID_REQUIRED: 'building id is required.',
  BUILDING_ID_NUMERIC: 'building id should be numeric.',
  LAND_BUILDING_NOT_FOUND: (errorData?: any): string =>
    `no land building association found against id:${errorData.id}.`,
  ASSET_OWNER_HISTORY_NOT_EXIST: 'asset owner history does not exist.',
  ASSET_OWNER_HISTORY_ID_REQUIRED: 'asset owner history id is required.',
  ASSET_OWNER_HISTORY_ID_NUMERIC: 'asset owner history id should be numeric.',
  ASSET_OWNER_HISTORY_NOT_FOUND: (errorData?: any): string =>
    `no asset owner history found against id:${errorData.id}.`,
  INVENTORY_ID_REQUIRED: ' id is required.',
  INVENTORY_ID_NUMERIC: 'id should be numeric.',
  INVENTORY_NOT_EXIST: 'inventory does not exist.',
  INVENTORY_NOT_FOUND_AGAINST_ID: (errorData?: any): string => `no inventory found against id:${errorData.id}.`,
  GENERAL_TECHNICAL_ERROR: 'technical error occured.',
  PLAYER_HAS_NO_REWARD_AGAINST_REWARD_ID: (errorData?: any): string =>
    `player has no reward against id:${errorData.id}.`,
  IPFS_DATA_NOT_EXIST_AGIANT_HASH: (errorData?: any): string =>
    `data does not exist on IPFS against cid: ${errorData.hash}.`,
  CATEGORY_VALIDATED_SUCCESSFULLY: 'Category validated successfully.',
  UNAUTHORIZED_OPERATION_ERROR: 'Unauthorized operation.',
  UPLOAD_FILE_NOT_SELECTED: 'no file selected for upload.',
  UPLOAD_FILE_PROCESSING_ERROR: 'there was an error while processing the file.',
  WHITELIST_USER_MINT_LIMIT_REQUIRED: 'white list user minit limit is required.',
  MINT_PROOF_REQUIRED: 'proof is required.',
  INVALID_TYPE: 'invalid type.',
};
