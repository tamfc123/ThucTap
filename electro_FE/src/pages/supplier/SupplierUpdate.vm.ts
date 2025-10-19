import { useState, useEffect, useRef } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import SupplierConfigs from 'pages/supplier/SupplierConfigs';
import { SupplierRequest, SupplierResponse } from 'models/Supplier';
import useUpdateApi from 'hooks/use-update-api';
import useGetByIdApi from 'hooks/use-get-by-id-api';
import MiscUtils from 'utils/MiscUtils';
import { SelectOption } from 'types';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProvinceResponse } from 'models/Province';
import ProvinceConfigs from 'pages/province/ProvinceConfigs';
import { DistrictResponse } from 'models/District';
import DistrictConfigs from 'pages/district/DistrictConfigs';
import { AddressRequest } from 'models/Address';
import { useQueryClient } from 'react-query';

function useSupplierUpdateViewModel(id: string) {
  const form = useForm({
    initialValues: SupplierConfigs.initialCreateUpdateFormValues,
    schema: zodResolver(SupplierConfigs.createUpdateFormSchema),
  });
  const queryClient = useQueryClient();

  // 1. GỌI API LẤY SUPPLIER, NHƯNG LẤY 'data' TRỰC TIẾP
  // (Chúng ta cần 'supplier' để kích hoạt API Huyện)
  const { data: supplier } = useGetByIdApi<SupplierResponse>(
    SupplierConfigs.resourceUrl,
    SupplierConfigs.resourceKey,
    id
  );

  // THÊM LẠI DÒNG NÀY (Đã bị thiếu)
  const updateApi = useUpdateApi<SupplierRequest, SupplierResponse>(
    SupplierConfigs.resourceUrl,
    SupplierConfigs.resourceKey,
    id
  );

  const [prevFormValues, setPrevFormValues] = useState<typeof form.values>();
  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);

  // 2. useEffect ĐỂ NẠP DATA VÀO FORM (Chỉ chạy 1 lần khi 'supplier' tải xong)
  useEffect(() => {
    if (supplier) {
      const formValues: typeof form.values = {
        displayName: supplier.displayName,
        code: supplier.code,
        contactFullname: supplier.contactFullname || '',
        contactEmail: supplier.contactEmail || '',
        contactPhone: supplier.contactPhone || '',
        companyName: supplier.companyName || '',
        taxCode: supplier.taxCode || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        fax: supplier.fax || '',
        website: supplier.website || '',
        'address.line': supplier.address?.line || '',
        'address.provinceId': supplier.address?.provinceId?._id || null, // Vẫn đúng
        'address.districtId': supplier.address?.districtId?._id || null, // Vẫn đúng
        description: supplier.description || '',
        note: supplier.note || '',
        status: String(supplier.status),
      };
      form.setValues(formValues);
      // setPrevFormValues(formValues); // (Bạn có thể set 'prev' ở đây)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier]); // <-- Chỉ chạy khi 'supplier' tải xong
  useGetAllApi<ProvinceResponse>(ProvinceConfigs.resourceUrl, ProvinceConfigs.resourceKey,
    { all: 1 },
    (provinceListResponse) => {
      const selectList: SelectOption[] = provinceListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));
      setProvinceSelectList(selectList);
    }
  );
  // 4. LẤY HUYỆN (Kích hoạt bằng 'supplier' hoặc 'form')
  const provinceIdFromSupplier = supplier?.address?.provinceId?._id;
  const provinceIdFromForm = form.values['address.provinceId'];
  const activeProvinceId = provinceIdFromForm || provinceIdFromSupplier; // Ưu tiên 'form' (nếu người dùng đổi)

  useGetAllApi<DistrictResponse>(DistrictConfigs.resourceUrl, DistrictConfigs.resourceKey,
    {
      provinceId: activeProvinceId || undefined, // <-- Dùng ID đã kích hoạt
      size: 999
    },
    (districtListResponse) => {
      const selectList: SelectOption[] = districtListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));
      setDistrictSelectList(selectList);
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!activeProvinceId // <-- Kích hoạt nếu 1 trong 2 có giá trị
    }
  );

  // 5. useEffect ĐỂ RESET (vẫn cần 'useRef' guard)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (form.values['address.provinceId'] !== supplier?.address?.provinceId?._id) {
      // Chỉ reset Huyện NẾU người dùng CHỌN TỈNH (khác với data gốc)
      form.setFieldValue('address.districtId', null);
      // (Bạn cũng có thể muốn reset data Huyện)
      queryClient.removeQueries([DistrictConfigs.resourceKey, 'getAll']);
      setDistrictSelectList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values['address.provinceId']]); // <-- Chỉ theo dõi Tỉnh

  const handleFormSubmit = form.onSubmit((formValues) => {
    setPrevFormValues(formValues);
    if (!MiscUtils.isEquals(formValues, prevFormValues)) {
      const addressRequest: AddressRequest = {
        line: formValues['address.line'] || null,
        provinceId: formValues['address.provinceId'] || null,
        districtId: formValues['address.districtId'] || null,
        wardId: null,
      };
      const requestBody: SupplierRequest = {
        displayName: formValues.displayName,
        code: formValues.code,
        contactFullname: formValues.contactFullname || null,
        contactEmail: formValues.contactEmail || null,
        contactPhone: formValues.contactPhone || null,
        companyName: formValues.companyName || null,
        taxCode: formValues.taxCode || null,
        email: formValues.email || null,
        phone: formValues.phone || null,
        fax: formValues.fax || null,
        website: formValues.website || null,
        address: (supplier?.address === null && Object.values(addressRequest).every(value => value === null)) ? null : addressRequest,
        description: formValues.description || null,
        note: formValues.note || null,
        status: Number(formValues.status),
      };
      updateApi.mutate(requestBody);
    }
  });

  const statusSelectList: SelectOption[] = [
    {
      value: '1',
      label: 'Có hiệu lực',
    },
    {
      value: '2',
      label: 'Vô hiệu lực',
    },
  ];

  return {
    supplier,
    form,
    handleFormSubmit,
    provinceSelectList,
    districtSelectList,
    statusSelectList,
  };
}

export default useSupplierUpdateViewModel;
