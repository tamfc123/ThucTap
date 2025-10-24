import { useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import OrderConfigs from 'pages/order/OrderConfigs';
import { OrderRequest, OrderResponse } from 'models/Order';
import useUpdateApi from 'hooks/use-update-api';
import useGetByIdApi from 'hooks/use-get-by-id-api';
import MiscUtils from 'utils/MiscUtils';
import { SelectOption } from 'types';
import { VariantResponse } from 'models/Variant';
// import useGetAllApi from 'hooks/use-get-all-api'; // Bị comment/xóa vì không còn dùng
// import { OrderResourceResponse } from 'models/OrderResource'; // XÓA
// import OrderResourceConfigs from 'pages/order-resource/OrderResourceConfigs'; // XÓA
// import { OrderCancellationReasonResponse } from 'models/OrderCancellationReason'; // XÓA
// import OrderCancellationReasonConfigs from 'pages/order-cancellation-reason/OrderCancellationReasonConfigs'; // XÓA
import { OrderVariantKeyRequest, OrderVariantRequest } from 'models/OrderVariant';
import produce from 'immer';
import useDeleteByIdsApi from 'hooks/use-delete-by-ids-api';
import ResourceURL from 'constants/ResourceURL';
// import { PaymentMethodResponse } from 'models/PaymentMethod'; // XÓA
// import PaymentMethodConfigs from 'pages/payment-method/PaymentMethodConfigs'; // XÓA

function useOrderUpdateViewModel(id: string | undefined) {
  const form = useForm({
    initialValues: OrderConfigs.initialCreateUpdateFormValues,
    schema: zodResolver(OrderConfigs.createUpdateFormSchema),
  });

  const [order, setOrder] = useState<OrderResponse>();
  const [prevFormValues, setPrevFormValues] = useState<typeof form.values>();

  // XÓA 2 STATE NÀY
  // const [orderResourceSelectList, setOrderResourceSelectList] = useState<SelectOption[]>([]);
  // const [orderCancellationReasonSelectList, setOrderCancellationReasonSelectList] = useState<SelectOption[]>([]);

  // SỬA LẠI PAYMENT METHOD: Dùng const, không gọi API
  const paymentMethodSelectList: SelectOption[] = [
    { value: 'MOMO', label: 'Ví Momo' },
    { value: 'CASH', label: 'Tiền mặt (COD)' },
    // Thêm các phương thức khác nếu có
  ];

  const [variants, setVariants] = useState<VariantResponse[]>([]);

  // SỬA: Thêm Guard Clause (if !id) để fix lỗi 'string | undefined'
  if (!id) {
    // Trả về một object rỗng (nhưng đúng shape) để component không bị crash
    return {
      order: undefined,
      form,
      handleFormSubmit: () => {
      },
      handleClickVariantResultItem: () => {
      },
      handleQuantityInput: () => {
      },
      handleDeleteVariantButton: () => {
      },
      handleShippingCostInput: () => {
      },
      resetForm: () => {
      },
      orderResourceSelectList: [], // Trả về mảng rỗng
      orderCancellationReasonSelectList: [], // Trả về mảng rỗng
      paymentMethodSelectList: [], // Trả về mảng rỗng
      statusSelectList: [],
      paymentStatusSelectList: [],
      variants: [],
    };
  }

  const updateApi = useUpdateApi<OrderRequest, OrderResponse>(OrderConfigs.resourceUrl, OrderConfigs.resourceKey, id);
  useGetByIdApi<OrderResponse>(OrderConfigs.resourceUrl, OrderConfigs.resourceKey, id,
    (orderResponse) => {
      setOrder(orderResponse);
      const formValues: typeof form.values = {
        code: orderResponse.code,
        status: String(orderResponse.status),
        toName: orderResponse.toName,
        toPhone: orderResponse.toPhone,
        toAddress: orderResponse.toAddress,
        toWardName: orderResponse.toWardName,
        toDistrictName: orderResponse.toDistrictName,
        toProvinceName: orderResponse.toProvinceName,
        // SỬA LỖI: Dùng _id và kiểm tra null
        orderResourceId: orderResponse.orderResource ? String(orderResponse.orderResource._id) : '1', // Sửa .id -> ._id và fallback
        orderCancellationReasonId: orderResponse.orderCancellationReason
          ? String(orderResponse.orderCancellationReason._id) : null, // Sửa .id -> ._id
        note: orderResponse.note || '',
        userId: String(orderResponse.user._id), // SỬA LỖI: .id -> ._id
        orderVariants: orderResponse.orderVariants
          .map(orderVariantResponse => ({
            variantId: orderVariantResponse.variant._id, // SỬA LỖI: .id -> ._id
            price: orderVariantResponse.price,
            quantity: orderVariantResponse.quantity,
            amount: orderVariantResponse.amount,
          })),
        totalAmount: orderResponse.totalAmount,
        tax: orderResponse.tax,
        shippingCost: orderResponse.shippingCost,
        totalPay: orderResponse.totalPay,
        paymentMethodType: orderResponse.paymentMethodType,
        paymentStatus: String(orderResponse.paymentStatus),
      };
      form.setValues(formValues);
      setPrevFormValues(formValues);
      setVariants(orderResponse.orderVariants.map(orderVariant => orderVariant.variant));
    }
  );

  // XÓA TOÀN BỘ 3 KHỐI useGetAllApi
  // useGetAllApi<OrderResourceResponse>(...) // XÓA
  // useGetAllApi<OrderCancellationReasonResponse>(...) // XÓA
  // useGetAllApi<PaymentMethodResponse>(...) // XÓA

  // SỬA LỖI 9: Đổi generic type từ OrderVariantKeyRequest thành kiểu dữ liệu đúng (dùng string)
  const deleteByIdsApi = useDeleteByIdsApi<{ orderId: string, variantId: string }>(
    ResourceURL.ORDER_VARIANT,
    'order-variants'
  );

  const handleFormSubmit = form.onSubmit((formValues) => {
    setPrevFormValues(formValues);
    if (prevFormValues && !MiscUtils.isEquals(formValues, prevFormValues)) {
      const requestBody: OrderRequest = {
        code: formValues.code,
        status: Number(formValues.status),
        toName: formValues.toName,
        toPhone: formValues.toPhone,
        toAddress: formValues.toAddress,
        toWardName: formValues.toWardName,
        toDistrictName: formValues.toDistrictName,
        toProvinceName: formValues.toProvinceName,
        // SỬA: Xóa 2 dòng ...Id này
        // orderResourceId: Number(formValues.orderResourceId), // XÓA
        // orderCancellationReasonId: Number(formValues.orderCancellationReasonId) || null, // XÓA
        note: formValues.note || null,
        userId: formValues.userId as string, // SỬA: Bỏ Number()
        orderVariants: formValues.orderVariants,
        totalAmount: formValues.totalAmount,
        tax: formValues.tax,
        shippingCost: formValues.shippingCost,
        totalPay: formValues.totalPay,
        paymentMethodType: formValues.paymentMethodType,
        paymentStatus: Number(formValues.paymentStatus),
      };
      updateApi.mutate(requestBody);

      // SỬA LỖI 9: (Code này giờ đã khớp với generic type ở trên)
      const deletedOrderVariantKeyRequests: { orderId: string, variantId: string }[] = prevFormValues.orderVariants
        .map(orderVariantRequest => orderVariantRequest.variantId)
        .filter(variantId => !formValues.orderVariants.map(item => item.variantId).includes(variantId))
        .map(variantId => ({ orderId: id, variantId: variantId })); // id giờ đã là string

      if (deletedOrderVariantKeyRequests.length > 0) {
        deleteByIdsApi.mutate(deletedOrderVariantKeyRequests);
      }
    }
  });

  const calculateTotalAmount = (orderVariantRequests: OrderVariantRequest[]) =>
    orderVariantRequests.map(item => item.amount).reduce((a, b) => a + b, 0);

  const calculateTotalPayByTotalAmount = (totalAmount: number) => {
    return Number((totalAmount + totalAmount * form.values.tax + form.values.shippingCost).toFixed(0));
  };

  const calculateTotalPayByShippingCost = (shippingCost: number) => {
    return Number((form.values.totalAmount + form.values.totalAmount * form.values.tax + shippingCost).toFixed(0));
  };

  const handleClickVariantResultItem = (variant: VariantResponse) => {
    setTimeout(() => {
      const orderVariantRequest: OrderVariantRequest = {
        variantId: variant._id, // SỬA LỖI 10: .id -> ._id
        price: variant.price,
        quantity: 1,
        amount: variant.price,
      };
      const currentOrderVariantRequests = [...form.values.orderVariants, orderVariantRequest];
      form.setFieldValue('orderVariants', currentOrderVariantRequests);
      const totalAmount = calculateTotalAmount(currentOrderVariantRequests);
      form.setFieldValue('totalAmount', totalAmount);
      form.setFieldValue('totalPay', calculateTotalPayByTotalAmount(totalAmount));
      setVariants(variants => [...variants, variant]);
    }, 100);
  };

  const handleQuantityInput = (quantity: number, index: number) => {
    const currentOrderVariantRequests = produce(form.values.orderVariants, draft => {
      const variant = draft[index];
      variant.quantity = quantity;
      variant.amount = variant.price * quantity;
    });
    form.setFieldValue('orderVariants', currentOrderVariantRequests);
    const totalAmount = calculateTotalAmount(currentOrderVariantRequests);
    form.setFieldValue('totalAmount', totalAmount);
    form.setFieldValue('totalPay', calculateTotalPayByTotalAmount(totalAmount));
  };

  const handleDeleteVariantButton = (index: number) => {
    const currentOrderVariantRequests = form.values.orderVariants.filter((_, i) => i !== index);
    form.setFieldValue('orderVariants', currentOrderVariantRequests);
    const totalAmount = calculateTotalAmount(currentOrderVariantRequests);
    form.setFieldValue('totalAmount', totalAmount);
    form.setFieldValue('totalPay', calculateTotalPayByTotalAmount(totalAmount));
    setVariants(variants => variants.filter((_, i) => i !== index));
  };

  const handleShippingCostInput = (value: number) => {
    form.setFieldValue('shippingCost', value);
    form.setFieldValue('totalPay', calculateTotalPayByShippingCost(value));
  };

  const resetForm = () => {
    form.reset();
    setVariants([]);
  };

  const statusSelectList: SelectOption[] = [
    {
      value: '1',
      label: 'Đơn hàng mới',
    },
    {
      value: '2',
      label: 'Đang xử lý',
    },
    {
      value: '3',
      label: 'Đang giao hàng',
    },
    {
      value: '4',
      label: 'Đã giao hàng',
    },
    {
      value: '5',
      label: 'Hủy bỏ',
    },
  ];

  const paymentStatusSelectList: SelectOption[] = [
    {
      value: '1',
      label: 'Chưa thanh toán',
    },
    {
      value: '2',
      label: 'Đã thanh toán',
    },
  ];

  return {
    order,
    form,
    handleFormSubmit,
    handleClickVariantResultItem,
    handleQuantityInput,
    handleDeleteVariantButton,
    handleShippingCostInput,
    resetForm,
    orderResourceSelectList: [], // SỬA: Trả về mảng rỗng
    orderCancellationReasonSelectList: [], // SỬA: Trả về mảng rỗng
    paymentMethodSelectList, // SỬA: Trả về const
    statusSelectList,
    paymentStatusSelectList,
    variants,
  };
}

export default useOrderUpdateViewModel;