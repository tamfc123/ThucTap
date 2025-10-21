import { useState, useEffect, useRef } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import DestinationConfigs from 'pages/destination/DestinationConfigs';
import { DestinationRequest, DestinationResponse } from 'models/Destination';
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

function useDestinationUpdateViewModel(id: string) {
  const form = useForm({
    initialValues: DestinationConfigs.initialCreateUpdateFormValues,
    schema: zodResolver(DestinationConfigs.createUpdateFormSchema),
  });
  const queryClient = useQueryClient();

  const { data: destination } = useGetByIdApi<DestinationResponse>(
    DestinationConfigs.resourceUrl,
    DestinationConfigs.resourceKey,
    id
  );

  const updateApi = useUpdateApi<DestinationRequest, DestinationResponse>(
    DestinationConfigs.resourceUrl,
    DestinationConfigs.resourceKey,
    id
  );

  const [prevFormValues, setPrevFormValues] = useState<typeof form.values>();
  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);

  // 🧩 1. Khi có dữ liệu destination -> set vào form
  useEffect(() => {
    if (destination) {
      const formValues: typeof form.values = {
        contactFullname: destination.contactFullname || '',
        contactEmail: destination.contactEmail || '',
        contactPhone: destination.contactPhone || '',
        'address.line': destination.address?.line || '',
        'address.provinceId': destination.address?.provinceId?._id || null,
        'address.districtId': destination.address?.districtId?._id || null,
        status: String(destination.status),
      };
      form.setValues(formValues);
      setPrevFormValues(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  // 🧩 2. Load danh sách tỉnh
  useGetAllApi<ProvinceResponse>(
    ProvinceConfigs.resourceUrl,
    ProvinceConfigs.resourceKey,
    { all: 1 },
    (provinceListResponse) => {
      const selectList: SelectOption[] = provinceListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));
      setProvinceSelectList(selectList);
    }
  );

  // 🧩 3. Load danh sách huyện (theo tỉnh đang chọn hoặc từ data ban đầu)
  const provinceIdFromDestination = destination?.address?.provinceId?._id;
  const provinceIdFromForm = form.values['address.provinceId'];
  const activeProvinceId = provinceIdFromForm || provinceIdFromDestination;

  useGetAllApi<DistrictResponse>(
    DistrictConfigs.resourceUrl,
    DistrictConfigs.resourceKey,
    {
      provinceId: activeProvinceId || undefined,
      size: 999,
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
      enabled: !!activeProvinceId,
    }
  );

  // 🧩 4. Reset huyện khi đổi tỉnh
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (form.values['address.provinceId'] !== destination?.address?.provinceId?._id) {
      form.setFieldValue('address.districtId', null);
      queryClient.removeQueries([DistrictConfigs.resourceKey, 'getAll']);
      setDistrictSelectList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values['address.provinceId']]);

  // 🧩 5. Xử lý submit
  const handleFormSubmit = form.onSubmit((formValues) => {
    setPrevFormValues(formValues);
    if (!MiscUtils.isEquals(formValues, prevFormValues)) {
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
        address:
          destination?.address === null &&
          Object.values(addressRequest).every((v) => v === null)
            ? null
            : addressRequest,
        status: Number(formValues.status),
      };

      updateApi.mutate(requestBody);
    }
  });

  // 🧩 6. Trạng thái hoạt động
  const statusSelectList: SelectOption[] = [
    { value: '1', label: 'Có hiệu lực' },
    { value: '2', label: 'Vô hiệu lực' },
  ];

  return {
    destination,
    form,
    handleFormSubmit,
    provinceSelectList,
    districtSelectList,
    statusSelectList,
  };
}

export default useDestinationUpdateViewModel;
