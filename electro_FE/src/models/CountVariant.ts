import BaseResponse from 'models/BaseResponse';
import { CollectionWrapper } from 'types';
import { VariantPropertyItem } from 'models/Variant';

export interface CountVariantResponse {
  variant: VariantResponse;
  inventory: number;
  actualInventory: number;
}

interface VariantResponse extends BaseResponse {
  product: ProductResponse;
  sku: string;
  cost: number;
  price: number;
  properties: CollectionWrapper<VariantPropertyItem> | null;
  status: number;
}

interface ProductResponse extends BaseResponse {
  name: string;
  code: string;
  slug: string;
}

export interface CountVariantRequest {
  variantId: string;
  inventory: number;
  actualInventory: number;
}

export interface CountVariantKeyRequest {
  countId: string;
  variantId: string;
}
