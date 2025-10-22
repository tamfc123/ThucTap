import { useForm, zodResolver } from '@mantine/form';
import PurchaseOrderConfigs from 'pages/purchase-order/PurchaseOrderConfigs';
import { PurchaseOrderRequest, PurchaseOrderResponse } from 'models/PurchaseOrder';
import useCreateApi from 'hooks/use-create-api';
import { useState } from 'react';
import { SelectOption } from 'types';
import useGetAllApi from 'hooks/use-get-all-api';
import { SupplierResponse } from 'models/Supplier';
import SupplierConfigs from 'pages/supplier/SupplierConfigs';
import { DestinationResponse } from 'models/Destination';
import DestinationConfigs from 'pages/destination/DestinationConfigs';
import { VariantResponse } from 'models/Variant';
import { PurchaseOrderVariantRequest } from 'models/PurchaseOrderVariant';
import produce from 'immer';
// (1) Import kiểu FormErrors từ @mantine/form (nếu cần dùng onInvalid)
// import { FormErrors } from '@mantine/form'; 
import NotifyUtils from 'utils/NotifyUtils'; // Import NotifyUtils nếu chưa có

function usePurchaseOrderCreateViewModel() {
  const form = useForm({
    initialValues: PurchaseOrderConfigs.initialCreateUpdateFormValues,
    schema: zodResolver(PurchaseOrderConfigs.createUpdateFormSchema),
    //validateInputOnChange: true, 
  });

  const [supplierSelectList, setSupplierSelectList] = useState<SelectOption[]>([]);
  const [destinationSelectList, setDestinationSelectList] = useState<SelectOption[]>([]);
  const [variants, setVariants] = useState<VariantResponse[]>([]);

  const createApi = useCreateApi<PurchaseOrderRequest, PurchaseOrderResponse>(PurchaseOrderConfigs.resourceUrl);

  // ... (code useGetAllApi cho supplier và destination giữ nguyên) ...
  useGetAllApi<SupplierResponse>(SupplierConfigs.resourceUrl, SupplierConfigs.resourceKey,
    { all: 1 },
    (supplierListResponse) => {
      const selectList: SelectOption[] = supplierListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.displayName,
      }));
      setSupplierSelectList(selectList);
    }
  );
  useGetAllApi<DestinationResponse>(DestinationConfigs.resourceUrl, DestinationConfigs.resourceKey,
    { all: 1 },
    (destinationListResponse) => {
      const selectList: SelectOption[] = destinationListResponse.content.map((item) => ({
        value: String(item._id),
        label: [item.address.line, item.address.districtId?.name, item.address.provinceId?.name].filter(Boolean).join(', '),
      }));
      setDestinationSelectList(selectList);
    }
  );

  // (2) Xóa hàm resetForm ở đây vì nó được định nghĩa lại ở dưới
  // const resetForm = () => { ... };

  // (3) SỬA LẠI handleFormSubmit: Chỉ truyền 1 đối số vào form.onSubmit
  // Trong usePurchaseOrderCreateViewModel.tsx

  const handleFormSubmit = form.onSubmit(
    (formValues) => {
      // LOG 1: Bắt đầu xử lý submit
      console.log('[handleFormSubmit] Bước 1: onSubmit triggered');
      console.log('[handleFormSubmit] Dữ liệu Form:', formValues);

      // LOG 2: Kiểm tra variants trước khi tạo body
      console.log('[handleFormSubmit] Bước 2: Kiểm tra purchaseOrderVariants:', formValues.purchaseOrderVariants);
      if (!formValues.purchaseOrderVariants || formValues.purchaseOrderVariants.length === 0) {
        NotifyUtils.simpleFailed('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.');
        console.error('[handleFormSubmit] LỖI: purchaseOrderVariants rỗng.');
        return;
      }

      try {
        const requestBody: PurchaseOrderRequest = {
          code: formValues.code!,
          supplierId: formValues.supplierId!,
          purchaseOrderVariants: formValues.purchaseOrderVariants, // <-- LOG NÀY QUAN TRỌNG
          destinationId: formValues.destinationId!,
          totalAmount: formValues.totalAmount,
          note: formValues.note || null,
          status: Number(formValues.status),
        };
        // LOG 3: Kiểm tra requestBody hoàn chỉnh
        console.log('[handleFormSubmit] Bước 3: Request Body đã tạo:', requestBody);

        // === SỬA LẠI LOG BƯỚC 4 ===
        console.log('[handleFormSubmit] Bước 4: Chuẩn bị gọi createApi.mutate...');
        // Log riêng phần purchaseOrderVariants để dễ xem
        console.log('--- Dữ liệu purchaseOrderVariants sắp gửi đi: ---');
        try {
          // Dùng JSON.stringify để xem cấu trúc đầy đủ, tránh bị console gộp lại
          console.log(JSON.stringify(requestBody.purchaseOrderVariants, null, 2));
        } catch (e) {
          console.error("Lỗi khi stringify purchaseOrderVariants:", e);
          console.log("Dữ liệu purchaseOrderVariants (dạng thô):", requestBody.purchaseOrderVariants);
        }
        console.log('--- Kết thúc dữ liệu purchaseOrderVariants ---');
        // === KẾT THÚC SỬA LOG ===

        createApi.mutate(requestBody, {
          onSuccess: (data) => {
            // LOG 5a: Thành công
            console.log('[handleFormSubmit] Bước 5a: API Create THÀNH CÔNG:', data);
            NotifyUtils.simpleSuccess('Tạo đơn đặt hàng thành công!');
            resetForm();
          },
          onError: (error: any) => {
            // LOG 5b: Thất bại
            console.error('[handleFormSubmit] Bước 5b: API Create LỖI:', error);
            const errorMsg = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            NotifyUtils.simpleFailed(`Lỗi tạo đơn hàng: ${errorMsg}`);
            // Log thêm lỗi validation nếu có từ backend
            if (error?.response?.data?.errors) {
              console.error('Lỗi validation chi tiết từ backend:', error.response.data.errors);
            }
          },
        });
        // LOG 6: Ngay sau khi gọi mutate (chỉ báo là đã gọi, chưa biết kết quả)
        console.log('[handleFormSubmit] Bước 6: createApi.mutate ĐÃ ĐƯỢC GỌI.');

      } catch (error) {
        // LOG 7: Lỗi JavaScript khi tạo requestBody
        console.error('[handleFormSubmit] LỖI JAVASCRIPT:', error);
        NotifyUtils.simpleFailed('Lỗi xử lý dữ liệu form.');
      }
    }
    // Bỏ hàm xử lý lỗi validation thứ 2 của onSubmit đi
  );

  // ... các hàm khác ...

  // ... (calculateTotalAmount, handleClickVariantResultItem, handleQuantityInput, handleDeleteVariantButton giữ nguyên) ...
  const calculateTotalAmount = (purchaseOrderVariantRequests: PurchaseOrderVariantRequest[]) =>
    purchaseOrderVariantRequests.map(item => item.amount).reduce((a, b) => a + b, 0);

  const handleClickVariantResultItem = (variant: VariantResponse) => {
    // Kiểm tra xem variant đã tồn tại trong danh sách chưa
    const isExisting = variants.some(v => v._id === variant._id);
    if (isExisting) {
      NotifyUtils.simpleFailed(`Sản phẩm "${variant.product?.name || variant.sku}" đã có trong đơn hàng.`);
      return; // Không thêm nếu đã tồn tại
    }

    setTimeout(() => {
      const purchaseOrderVariantRequest: PurchaseOrderVariantRequest = {
        variantId: variant._id, // Đảm bảo variant._id là string ObjectId
        // Sửa lại: Dùng price hay cost tùy thuộc vào thống nhất của bạn
        cost: variant.cost, // Giả sử dùng price
        quantity: 1,
        amount: variant.cost, // Amount = price * 1
        // cost: variant.cost, // Nếu bạn cần lưu cả cost gốc
      };
      const currentPurchaseOrderVariantRequests = [...form.values.purchaseOrderVariants, purchaseOrderVariantRequest];
      form.setFieldValue('purchaseOrderVariants', currentPurchaseOrderVariantRequests);
      form.setFieldValue('totalAmount', calculateTotalAmount(currentPurchaseOrderVariantRequests));
      setVariants(prevVariants => [...prevVariants, variant]); // Dùng callback để đảm bảo state đúng
    }, 100);
  };

  const handleQuantityInput = (quantity: number, index: number) => {
    const currentPurchaseOrderVariantRequests = produce(form.values.purchaseOrderVariants, draft => {
      const variantRequest = draft[index];
      if (variantRequest) { // Thêm kiểm tra
        variantRequest.quantity = quantity;
        // Sửa lại: Dùng price hay cost tùy thuộc vào thống nhất
        variantRequest.amount = (variantRequest.cost || 0) * quantity;
      }
    });
    form.setFieldValue('purchaseOrderVariants', currentPurchaseOrderVariantRequests);
    form.setFieldValue('totalAmount', calculateTotalAmount(currentPurchaseOrderVariantRequests));
  };

  const handleDeleteVariantButton = (index: number) => {
    const currentPurchaseOrderVariantRequests = form.values.purchaseOrderVariants.filter((_, i) => i !== index);
    form.setFieldValue('purchaseOrderVariants', currentPurchaseOrderVariantRequests);
    form.setFieldValue('totalAmount', calculateTotalAmount(currentPurchaseOrderVariantRequests));
    setVariants(prevVariants => prevVariants.filter((_, i) => i !== index)); // Dùng callback
  };

  // (5) Định nghĩa hàm resetForm chỉ MỘT LẦN ở đây
  const resetForm = () => {
    console.log('🔄 Resetting form...');
    setVariants([]);
    form.reset();
    
  };

  const statusSelectList: SelectOption[] = [
    { value: '1', label: 'Đơn hàng mới' },
    // { value: '2', label: 'Đang chờ duyệt' }, // Bỏ các trạng thái không phù hợp khi tạo mới
    // { value: '3', label: 'Đã duyệt' },
    // { value: '4', label: 'Đang xử lý' },
    // { value: '5', label: 'Hoàn thành' },
    // { value: '6', label: 'Không duyệt' },
    // { value: '7', label: 'Hủy bỏ' },
  ];

  return {
    form,
    handleFormSubmit,
    handleClickVariantResultItem,
    handleQuantityInput,
    handleDeleteVariantButton,
    resetForm,
    supplierSelectList,
    destinationSelectList,
    statusSelectList,
    variants,
  };
}

export default usePurchaseOrderCreateViewModel;