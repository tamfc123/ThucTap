import ApplicationConstants from 'constants/ApplicationConstants';

const apiPath = ApplicationConstants.API_PATH;
const clientApiPath = ApplicationConstants.CLIENT_API_PATH;

class ResourceURL {
  // ADMIN
  static ADDRESS = '/addresses';
  static PROVINCE = '/provinces';
  static DISTRICT = '/districts';
  static WARD = '/wards';

  static USER = '/users';
  static ROLE = '/roles';

  static EMPLOYEE = '/employees';
  static OFFICE ='/offices';
  static DEPARTMENT ='/departments';
  static JOB_TYPE ='/job-types';
  static JOB_LEVEL ='/job-levels';
  static JOB_TITLE ='/job-titles';

  static CUSTOMER ='/customers';
  static CUSTOMER_GROUP ='/customer-groups';
  static CUSTOMER_STATUS ='/customer-status';
  static CUSTOMER_RESOURCE ='/customer-resources';

  static PRODUCT ='/products';
  static CATEGORY ='/categories';
  static BRAND ='/brands';
  static SUPPLIER ='/suppliers';
  static UNIT ='/units';
  static TAG ='/tags';
  static GUARANTEE ='/guarantees';
  static PROPERTY ='/properties';
  static SPECIFICATION ='/specifications';
  static VARIANT ='/variants';

  static PRODUCT_INVENTORY ='/product-inventories';
  static VARIANT_INVENTORY ='/variant-inventories';
  static WAREHOUSE ='/warehouses';
  static PURCHASE_ORDER ='/purchase-orders';
  static PURCHASE_ORDER_VARIANT ='/purchase-order-variants';
  static DESTINATION ='/destinations';
  static DOCKET ='/dockets';
  static DOCKET_VARIANT ='/docket-variants';
  static DOCKET_REASON ='/docket-reasons';
  static COUNT ='/counts';
  static COUNT_VARIANT ='/count-variants';
  static TRANSFER ='/transfers';
  static TRANSFER_VARIANT ='/transfer-variants';

  static ORDER ='/orders';
  static ORDER_VARIANT ='/order-variants';
  static ORDER_RESOURCE ='/order-resources';
  static ORDER_CANCELLATION_REASON ='/order-cancellation-reasons';

  static WAYBILL ='/waybills';

  static REVIEW ='/reviews';

  static REWARD_STRATEGY ='/reward-strategies';

  static VOUCHER ='/vouchers';
  static PAYMENT_METHOD ='/payment-methods';
  static PROMOTION ='/promotions';

  static ROOM ='/rooms';
  static MESSAGE ='/messages';

  static STATISTIC ='/stats';

  // CLIENT
  static CLIENT_CATEGORY =  '/categories';
  static CLIENT_PRODUCT = '/products';
  static CLIENT_FILTER_CATEGORY = clientApiPath + '/filters/category';
  static CLIENT_FILTER_SEARCH = clientApiPath + '/filters/search';
  static CLIENT_USER_INFO = '/auth/info';
  static CLIENT_USER_PERSONAL_SETTING = clientApiPath + '/users/personal';
  static CLIENT_USER_PHONE_SETTING = clientApiPath + '/users/phone';
  static CLIENT_USER_EMAIL_SETTING = clientApiPath + '/users/email';
  static CLIENT_USER_PASSWORD_SETTING = clientApiPath + '/users/password';
  static CLIENT_WISH = clientApiPath + '/wishes';
  static CLIENT_PREORDER = clientApiPath + '/preorders';
  static CLIENT_REVIEW = clientApiPath + '/reviews';
  static CLIENT_REVIEW_PRODUCT = ResourceURL.CLIENT_REVIEW + '/products';
  static CLIENT_NOTIFICATION = clientApiPath + '/notifications';
  static CLIENT_NOTIFICATION_INIT_EVENTS = ResourceURL.CLIENT_NOTIFICATION + '/init-events';
  static CLIENT_NOTIFICATION_EVENTS = ResourceURL.CLIENT_NOTIFICATION + '/events';
  static CLIENT_CART = clientApiPath + '/carts';
  static CLIENT_PAYMENT_METHOD = clientApiPath + '/payment-methods';
  static CLIENT_ORDER = clientApiPath + '/orders';
  static CLIENT_ORDER_CANCEL = ResourceURL.CLIENT_ORDER + '/cancel';
  static CLIENT_CHAT = clientApiPath + '/chat';
  static CLIENT_CHAT_GET_ROOM = ResourceURL.CLIENT_CHAT + '/get-room';
  static CLIENT_CHAT_CREATE_ROOM = ResourceURL.CLIENT_CHAT + '/create-room';
  static CLIENT_REWARD = clientApiPath + '/rewards';

  // AUTHENTICATION
  static LOGIN ='/auth/login';
  static ADMIN_USER_INFO ='/auth/info';
  static CLIENT_REGISTRATION = '/auth/registration';
  static CLIENT_REGISTRATION_RESEND_TOKEN = (userId: number) =>`/auth/registration/${userId}/resend-token`;
  static CLIENT_REGISTRATION_CONFIRM ='/auth/registration/confirm';
  static CLIENT_REGISTRATION_CHANGE_EMAIL = (userId: number) =>`/auth/registration/${userId}/change-email`;
  static CLIENT_FORGOT_PASSWORD ='/auth/forgot-password';
  static CLIENT_RESET_PASSWORD ='/auth/reset-password';
}

export default ResourceURL;
