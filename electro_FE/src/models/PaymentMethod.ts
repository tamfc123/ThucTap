import BaseResponse from 'models/BaseResponse';

export interface PaymentMethodResponse extends BaseResponse {
  name: string;
  code: string;
  status: string;
}

export interface PaymentMethodRequest {
  status: string;
}

export enum PaymentMethodType {
  CASH = 'CASH',
  PAYPAL = 'PAYPAL',
  MOMO = 'MOMO',
}
