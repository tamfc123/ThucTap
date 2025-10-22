import { useForm, zodResolver } from '@mantine/form';
import SupplierConfigs from 'pages/supplier/SupplierConfigs';
import { SupplierRequest, SupplierResponse } from 'models/Supplier';
import useCreateApi from 'hooks/use-create-api';
import { useState, useEffect } from 'react';
import { SelectOption } from 'types';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProvinceResponse } from 'models/Province';
import ProvinceConfigs from 'pages/province/ProvinceConfigs';
import { DistrictResponse } from 'models/District';
import DistrictConfigs from 'pages/district/DistrictConfigs';
import { AddressRequest } from 'models/Address';
import useSelectAddress from 'hooks/use-select-address';

function useSupplierCreateViewModel() {
  const form = useForm({
    initialValues: SupplierConfigs.initialCreateUpdateFormValues,
    schema: zodResolver(SupplierConfigs.createUpdateFormSchema),
  });

  useEffect(() => {
    // Khi Tỉnh ('address.provinceId') thay đổi,
    // tự động reset Huyện ('address.districtId') về 'null'.
    form.setFieldValue('address.districtId', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values['address.provinceId']]); // <-- Chỉ theo dõi Tỉnh

  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);

  const createApi = useCreateApi<SupplierRequest, SupplierResponse>(SupplierConfigs.resourceUrl);
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
  useGetAllApi<DistrictResponse>(DistrictConfigs.resourceUrl, DistrictConfigs.resourceKey,
    {
      provinceId: form.values['address.provinceId'] || undefined,
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
      enabled: !!form.values['address.provinceId'] 
    }
  );

  const handleFormSubmit = form.onSubmit((formValues) => {
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
      address: Object.values(addressRequest).every(value => value === null) ? null : addressRequest,
      description: formValues.description || null,
      note: formValues.note || null,
      status: Number(formValues.status),
    };
    createApi.mutate(requestBody);
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
    form,
    handleFormSubmit,
    provinceSelectList,
    districtSelectList,
    statusSelectList,
  };
}

export default useSupplierCreateViewModel;
