import { useForm, zodResolver } from '@mantine/form';
import DestinationConfigs from 'pages/destination/DestinationConfigs';
import { DestinationRequest, DestinationResponse } from 'models/Destination';
import useCreateApi from 'hooks/use-create-api';
import { useState, useEffect } from 'react';
import { SelectOption } from 'types';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProvinceResponse } from 'models/Province';
import ProvinceConfigs from 'pages/province/ProvinceConfigs';
import { DistrictResponse } from 'models/District';
import DistrictConfigs from 'pages/district/DistrictConfigs';
import { AddressRequest } from 'models/Address';

function useDestinationCreateViewModel() {
  const form = useForm({
    initialValues: DestinationConfigs.initialCreateUpdateFormValues,
    schema: zodResolver(DestinationConfigs.createUpdateFormSchema),
  });

  useEffect(() => {
      form.setFieldValue('address.districtId', null);
    }, [form.values['address.provinceId']]); // <-- Chỉ theo dõi Tỉnh

  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);

  const createApi = useCreateApi<DestinationRequest, DestinationResponse>(DestinationConfigs.resourceUrl);
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
    const requestBody: DestinationRequest = {
      contactFullname: formValues.contactFullname || null,
      contactEmail: formValues.contactEmail || null,
      contactPhone: formValues.contactPhone || null,
      address: Object.values(addressRequest).every(value => value === null) ? null : addressRequest,
      status: Number(formValues.status),
    };
    console.table(requestBody);
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

export default useDestinationCreateViewModel;
