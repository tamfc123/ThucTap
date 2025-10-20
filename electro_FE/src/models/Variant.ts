import BaseResponse from 'models/BaseResponse';
import { CollectionWrapper } from 'types';

export interface VariantResponse extends BaseResponse {
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

export interface VariantPropertyItem {
  id: string;
  name: string;
  code: string;
  value: string;
}

export interface VariantRequest {
  id?: string;
  sku: string;
  cost: number;
  price: number;
  properties: CollectionWrapper<VariantPropertyItem> | null;
  status: number;
}
