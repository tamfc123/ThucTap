import { CollectionWrapper } from 'types/CollectionWrapper';
import { VariantPropertyItem } from 'models/Variant';
import { AddressRequest } from 'models/Address';
import { ImageResponse } from 'models/Image';
import { SpecificationItem } from 'models/Product';
import { PaymentMethodType } from 'models/PaymentMethod';
import { RoomResponse } from 'models/Room';
import { MessageResponse } from 'models/Message';
import { RewardType } from 'models/RewardStrategy';

// CATEGORY

export interface ClientCategoryResponse {
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  categoryChildren: ClientCategoryResponse[];
  categoryParent?: ClientCategoryResponse;
}


export interface ClientListedProductResponse {
  _id: string;
  name: string;
  slug: string;
  images?: any;
  productPriceRange: number[];
  variants: ClientListedVariantResponse[];
  productSaleable: boolean;
  productPromotion: ClientPromotionResponse | null;
}

interface ClientListedVariantResponse {
  variantId: string;
  price: number;
  variantProperties: CollectionWrapper<VariantPropertyItem> | null;
}

export interface ClientFilterResponse {
  filterPriceQuartiles: [number, number];
  filterBrands: ClientBrandResponse[];
}

interface ClientBrandResponse {
  brandId: string;
  brandName: string;
}

// USER & SETTING

export interface ClientPersonalSettingUserRequest {
  username: string;
  fullname: string;
  gender: string;
  address: AddressRequest;
}

export interface ClientPhoneSettingUserRequest {
  phone: string;
}

export interface ClientEmailSettingUserRequest {
  email: string;
}

export interface ClientPasswordSettingUserRequest {
  oldPassword: string;
  newPassword: string;
}

// PRODUCT

export interface ClientProductResponse {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  images: ImageResponse[];
  categoryId: ClientCategoryResponse | null;
  brandId: ClientProductResponse_ClientBrandResponse | null;
  specifications: CollectionWrapper<SpecificationItem> | null;
  variants: ClientProductResponse_ClientVariantResponse[];
  productSaleable: boolean;
  productAverageRatingScore: number;
  productCountReviews: number;
  productRelatedProducts: ClientListedProductResponse[];
  productPromotion: ClientPromotionResponse | null;
}

interface ClientProductResponse_ClientBrandResponse {
  brandId: string;
  brandName: string;
}

interface ClientProductResponse_ClientVariantResponse {
  variantId: string;
  price: number;
  properties: CollectionWrapper<VariantPropertyItem> | null;
  inventory: number;
}

// WISH

export interface ClientWishResponse {
  wishId: number;
  wishCreatedAt: string;
  wishProduct: ClientListedProductResponse;
}

export interface ClientWishRequest {
  userId: string;
  productId: string;
}

// PREORDER

export interface ClientPreorderResponse {
  preorderId: number;
  preorderCreatedAt: string;
  preorderUpdatedAt: string;
  preorderProduct: ClientListedProductResponse;
  preorderStatus: number;
}

export interface ClientPreorderRequest {
  userId: string;
  productId: string;
  status: number;
}

// REVIEW

export interface ClientSimpleReviewResponse {
  reviewId: number;
  reviewCreatedAt: string;
  reviewUpdatedAt: string;
  reviewUser: ClientSimpleReviewResponse_UserResponse;
  reviewRatingScore: number;
  reviewContent: string;
  reviewReply: string | null;
  reviewStatus: number;
}

interface ClientSimpleReviewResponse_UserResponse {
  userId: string;
  userUsername: string;
  userFullname: string;
}

export interface ClientReviewResponse {
  reviewId: number;
  reviewCreatedAt: string;
  reviewUpdatedAt: string;
  reviewProduct: ClientListedProductResponse;
  reviewRatingScore: number;
  reviewContent: string;
  reviewReply: string | null;
  reviewStatus: number;
}

export interface ClientReviewRequest {
  userId: string;
  productId: string;
  ratingScore: number;
  content: string;
  status: number;
}

// CART

export interface ClientCartResponse {
  cartId: string;
  cartItems: ClientCartVariantResponse[];
}

export interface ClientCartVariantResponse {
  cartItemVariant: ClientCartVariantResponse_ClientVariantResponse;
  cartItemQuantity: number;
}

interface ClientCartVariantResponse_ClientVariantResponse {
  variantId: string;
  variantProduct: ClientCartVariantResponse_ClientVariantResponse_ClientProductResponse;
  variantPrice: number;
  variantProperties: CollectionWrapper<VariantPropertyItem> | null;
  variantInventory: number;
}

interface ClientCartVariantResponse_ClientVariantResponse_ClientProductResponse {
  productId: string;
  productName: string;
  productSlug: string;
  productThumbnail: string | null;
  productPromotion: ClientPromotionResponse | null;
}

export interface ClientCartRequest {
  cartId: string;
  userId: string;
  cartItems: ClientCartVariantRequest[];
  status: number;
  updateQuantityType: UpdateQuantityType;
}

interface ClientCartVariantRequest {
  variantId: string;
  quantity: number;
}

export interface ClientCartVariantKeyRequest {
  cartId: string;
  variantId: string;
}

export enum UpdateQuantityType {
  OVERRIDE = 'OVERRIDE',
  INCREMENTAL = 'INCREMENTAL'
}

// PAYMENT_METHOD

export interface ClientPaymentMethodResponse {
  _id: string;
  name: string;
  code: PaymentMethodType;
}

// ORDER

export interface ClientSimpleOrderResponse {
  _id: string; // Giữ nguyên
  id?: string; // Mongoose có thể tự thêm 'id', nên thêm vào cho an toàn
  
  createdAt: string;       // Sửa từ 'orderCreatedAt'
  code: string;            // Sửa từ 'orderCode'
  status: number;          // Sửa từ 'orderStatus'
  totalPay: number;        // Sửa từ 'orderTotalPay'
  paymentStatus: number;   // Sửa từ 'orderPaymentStatus'
  
  // Sửa tên mảng VÀ kiểu dữ liệu của mảng
  orderVariants: ClientOrderVariantItem[]; 
}
// Định nghĩa kiểu cho sản phẩm đã được populate (bên trong 'variant')
export interface PopulatedVariant {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  // Thêm bất kỳ trường nào khác của variant mà bạn cần
}

// Đây là kiểu dữ liệu CHÍNH XÁC cho một item trong mảng 'orderVariants'
export interface ClientOrderVariantItem {
  _id: string;
  price: number;
  quantity: number;
  variant: PopulatedVariant; // Đây là object sản phẩm đã populate
  // Backend không có 'amount' ở cấp này
}

export interface ClientOrderVariantResponse {
  orderItemVariant: ClientOrderVariantResponse_ClientVariantResponse;
  orderItemPrice: number;
  orderItemQuantity: number;
  orderItemAmount: number;
}

interface ClientOrderVariantResponse_ClientVariantResponse {
  variantId: number;
  variantProduct: ClientOrderVariantResponse_ClientVariantResponse_ClientProductResponse;
  variantProperties: CollectionWrapper<VariantPropertyItem> | null;
}

interface ClientOrderVariantResponse_ClientVariantResponse_ClientProductResponse {
  productId: number;
  productName: string;
  productSlug: string;
  productThumbnail: string;
  productIsReviewed: boolean;
}

export interface ClientOrderDetailResponse {
  _id: string;    // Sửa từ 'orderId: number'
  id?: string;   // Thêm (Phòng trường hợp Mongoose tự thêm)

  // Bỏ hết tiền tố 'order'
  createdAt: string;
  code: string;
  status: number;
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardName: string;
  toDistrictName: string;
  toProvinceName: string;
  totalAmount: number;
  tax: number;
  shippingCost: number;
  totalPay: number;
  paymentMethodType: PaymentMethodType;
  paymentStatus: number;

  // Sửa tên mảng (quan trọng nhất) và kiểu của mảng
  orderVariants: ClientOrderVariantItem[]; // Sửa từ 'orderItems: ClientOrderVariantResponse[]'

  // Sửa tên trường waybill
  waybill: ClientWaybillResponse | null; // Sửa từ 'orderWaybill'
}

// WAYBILL

export interface ClientWaybillResponse {
  waybillCode: string;
  waybillExpectedDeliveryTime: string;
  waybillLogs: ClientWaybillLogResponse[];
}

export interface ClientWaybillLogResponse {
  waybillLogId: number;
  waybillLogCreatedAt: string;
  waybillLogPreviousStatus: number | null;
  waybillLogCurrentStatus: number | null;
}


// PROMOTION

export interface ClientPromotionResponse {
  promotionId: number;
  promotionPercent: number;
}

// CHAT

export interface ClientRoomExistenceResponse {
  roomExistence: boolean;
  roomResponse: RoomResponse;
  roomRecentMessages: MessageResponse[];
}

// ORDER 2

export interface ClientSimpleOrderRequest {
  paymentMethodType: PaymentMethodType;
  cartId: string;
  shippingAddress: any;
}

export interface ClientConfirmedOrderResponse {
  orderCode: string;
  orderPaymentMethodType: PaymentMethodType;
  orderPaypalCheckoutLink: string | null;
  orderMomoCheckoutLink: string | null;
}

// REWARD

export interface ClientRewardLogResponse {
  rewardLogId: number;
  rewardLogCreatedAt: string;
  rewardLogScore: number;
  rewardLogType: RewardType;
  rewardLogNote: string;
}

export interface ClientRewardResponse {
  rewardTotalScore: number;
  rewardLogs: ClientRewardLogResponse[];
}

// REGISTRATION

export interface RegistrationResponse {
  id: string;
}

export interface RegistrationRequest {
  userId: string;
  token: string;
  code?: number;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
}
