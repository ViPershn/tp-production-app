export type ProductListItem = {
  id: number;
  code: string | null;
  name: string;
  status: string | null;
  departmentName: string | null;
  outputQuantity: number | null;
  lastSyncAt: string | null;
};

export type Operation = {
  id: number;
  operationOrder: number;
  operationNumber: number | null;
  name: string;
  workCenter: string | null;
  setupVariant: string | null;
  pieceTimeMinutes: number | null;
  pressureValue: number | null;
  pressureUnit: string | null;
  temperatureValue: number | null;
  temperatureUnit: string | null;
  operationDescription: string | null;
  isManualEdited: boolean | null;
};

export type ProductDetails = {
  id: number;
  oneCId: string | null;
  code: string | null;
  name: string;
  status: string | null;
  departmentName: string | null;
  groupName: string | null;
  outputQuantity: number | null;
  productDescription: string | null;
  sourceType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastSyncAt: string | null;
  operations: Operation[];
};

export type UpdateOperationRequest = {
  pressureValue: number | null;
  pressureUnit: string | null;
  temperatureValue: number | null;
  temperatureUnit: string | null;
  operationDescription: string | null;
  changedBy: string | null;
  changeReason: string | null;
};