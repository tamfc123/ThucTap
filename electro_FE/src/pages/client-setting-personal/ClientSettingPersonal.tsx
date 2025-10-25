import React, { useState, useMemo, useEffect, useRef } from 'react';
import useTitle from 'hooks/use-title';
import { Button, Card, Container, Grid, Select, Stack, TextInput, Title } from '@mantine/core';
import { ClientUserNavbar } from 'components';
import { ClientPersonalSettingUserRequest, SelectOption } from 'types';
import { z } from 'zod';
import MessageUtils from 'utils/MessageUtils';
import useAuthStore from 'stores/use-auth-store';
import { useForm, zodResolver } from '@mantine/form';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProvinceResponse } from 'models/Province';
import ProvinceConfigs from 'pages/province/ProvinceConfigs';
import { DistrictResponse } from 'models/District';
import DistrictConfigs from 'pages/district/DistrictConfigs';
import MiscUtils from 'utils/MiscUtils';
import { useMutation } from 'react-query';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';
import { UserResponse } from 'models/User';
import { WardResponse } from 'models/Ward';
import WardConfigs from 'pages/ward/WardConfigs';
// import useSelectAddress from 'hooks/use-select-address'; // <- BƯỚC 1: KHÔNG CẦN DÙNG NỮA

const formSchema = z.object({
  username: z.string({ invalid_type_error: 'Vui lòng không bỏ trống' })
    .min(2, MessageUtils.min('Tên tài khoản', 2)),
  fullname: z.string({ invalid_type_error: 'Vui lòng không bỏ trống' }),
  gender: z.string({ invalid_type_error: 'Vui lòng không bỏ trống' }),
  'address.line': z.string({ invalid_type_error: 'Vui lòng không bỏ trống' }),
  'address.provinceId': z.string({ invalid_type_error: 'Vui lòng không bỏ trống' }),
  'address.districtId': z.string({ invalid_type_error: 'Vui lòng không bỏ trống' }),
  'address.wardId': z.string({ invalid_type_error: 'Vui lòng không bỏ trống' }),
});

const genderSelectList: SelectOption[] = [
  {
    value: 'M',
    label: 'Nam',
  },
  {
    value: 'F',
    label: 'Nữ',
  },
];

function ClientSettingPersonal() {
  useTitle();

  const { user, updateUser } = useAuthStore();
  console.log('User from Auth Store:', JSON.stringify(user));

  const initialFormValues = {
    username: user?.username as string,
    fullname: user?.fullname as string,
    gender: user?.gender as 'M' | 'F',
    'address.line': user?.address.line as string,
    'address.provinceId': String(user?.address.provinceId?._id) as string | null,
    'address.districtId': String(user?.address.districtId?._id) as string | null,
    'address.wardId': String(user?.address.wardId?._id) as string | null,
  };
  console.log('Initial Form Values:', initialFormValues);

  const form = useForm({
    initialValues: initialFormValues,
    schema: zodResolver(formSchema),
  });

  // BƯỚC 2: XÓA DÒNG NÀY
  // useSelectAddress(form, 'address.provinceId', 'address.districtId', 'address.wardId');

  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);
  const [wardSelectList, setWardSelectList] = useState<SelectOption[]>([]);

  // Chỉ tạo 1 lần duy nhất
  const provinceParams = useMemo(() => ({ all: 1 }), []);

  useGetAllApi<ProvinceResponse>(ProvinceConfigs.resourceUrl, ProvinceConfigs.resourceKey,
    provinceParams, // <-- Sử dụng params đã memoize
    (provinceListResponse) => {
      const selectList: SelectOption[] = provinceListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));
      setProvinceSelectList(selectList);
    }
  );

  // 2. Memoize params cho District
  // Chỉ tạo lại khi 'address.provinceId' thay đổi
 // 2. Memoize params cho District (GIỐNG HỆT CODE ADMIN)
const districtParams = useMemo(() => ({
  provinceId: form.values['address.provinceId'] || undefined,
  size: 999, // Dùng size 999 (giống admin) thay vì all: 1
}), [form.values['address.provinceId']]);

  useGetAllApi<DistrictResponse>(DistrictConfigs.resourceUrl, DistrictConfigs.resourceKey,
    districtParams, // <-- Sử dụng params đã memoize
    (districtListResponse) => {
      // SỬA LẠI LOGIC BÊN TRONG
      const selectList: SelectOption[] = districtListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));
      setDistrictSelectList(selectList);
    },
    { // BƯỚC 3: THÊM CỜ ENABLED
      enabled: !!form.values['address.provinceId'],
    }
  );

  // 3. Memoize params cho Ward
  // Chỉ tạo lại khi 'address.districtId' thay đổi
// 3. Memoize params cho Ward (GIỐNG HỆT CODE ADMIN)
const wardParams = useMemo(() => ({
  districtId: form.values['address.districtId'] || undefined,
  size: 999, // Dùng size 999 (giống admin)
}), [form.values['address.districtId']]);

  useGetAllApi<WardResponse>(WardConfigs.resourceUrl, WardConfigs.resourceKey,
    wardParams, // <-- Sử dụng params đã memoize
    (wardListResponse) => {
      // SỬA LẠI LOGIC BÊN TRONG
      const selectList: SelectOption[] = wardListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));
      setWardSelectList(selectList);
    },
    { // BƯỚC 3: THÊM CỜ ENABLED
      enabled: !!form.values['address.districtId'],
    }
  );

  // BƯỚC 4: THÊM LOGIC TỪ CODE ADMIN
  const isInitialMount = useRef(true);

  // 1. Reset District và Ward khi Province thay đổi
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    form.setFieldValue('address.districtId', null);
    form.setFieldValue('address.wardId', null);
    setDistrictSelectList([]);
    setWardSelectList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values['address.provinceId']]);

  // 2. Reset Ward khi District thay đổi
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    form.setFieldValue('address.wardId', null);
    setWardSelectList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values['address.districtId']]);

  // 3. Đánh dấu là đã qua lần render đầu tiên
  useEffect(() => {
    isInitialMount.current = false;
  }, []);
  // KẾT THÚC BƯỚC 4

  const updatePersonalSettingApi = useMutation<UserResponse, ErrorMessage, ClientPersonalSettingUserRequest>(
    (requestBody) => FetchUtils.postWithToken(ResourceURL.CLIENT_USER_PERSONAL_SETTING, requestBody),
    {
      onSuccess: (userResponse) => {
        updateUser(userResponse);
        NotifyUtils.simpleSuccess('Cập nhật thành công');
      },
      onError: () => NotifyUtils.simpleFailed('Cập nhật không thành công'),
    }
  );

  const handleFormSubmit = form.onSubmit((formValues) => {
    const requestBody: ClientPersonalSettingUserRequest = {
      username: formValues.username,
      fullname: formValues.fullname,
      gender: formValues.gender,
      address: {
        line: formValues['address.line'],
        provinceId: formValues['address.provinceId'],
        districtId: formValues['address.districtId'],
        wardId: formValues['address.wardId'],
      },
    };

    updatePersonalSettingApi.mutate(requestBody);
  });

  return (
    <main>
      <Container size="xl">
        <Grid gutter="lg">
          <Grid.Col md={3}>
            <ClientUserNavbar />
          </Grid.Col>

          <Grid.Col md={9}>
            <Card radius="md" shadow="sm" p="lg">
              <Stack>
                <Title order={2}>
                  Cập nhật thông tin cá nhân
                </Title>
                <Grid>
                  <Grid.Col lg={6}>
                    <form onSubmit={handleFormSubmit}>
                      <Stack>
                        <TextInput
                          required
                          radius="md"
                          label="Tên tài khoản"
                          placeholder="Nhập tên tài khoản của bạn"
                          {...form.getInputProps('username')}
                          disabled
                        // TODO: Hiện tại chưa cho phép sửa username
                        />
                        <TextInput
                          required
                          radius="md"
                          label="Họ và tên"
                          placeholder="Nhập họ và tên của bạn"
                          {...form.getInputProps('fullname')}
                        />
                        <Select
                          required
                          radius="md"
                          label="Giới tính"
                          placeholder="Chọn giới tính"
                          data={genderSelectList}
                          {...form.getInputProps('gender')}
                        />
                        <Select
                          required
                          radius="md"
                          label="Tỉnh thành"
                          placeholder="Chọn tỉnh thành"
                          data={provinceSelectList}
                          {...form.getInputProps('address.provinceId')}
                        />
                        <Select
                          required
                          radius="md"
                          label="Quận huyện"
                          placeholder="Chọn quận huyện"
                          data={districtSelectList}
                          disabled={form.values['address.provinceId'] === null}
                          {...form.getInputProps('address.districtId')}
                        />
                        <Select
                          required
                          radius="md"
                          label="Phường xã"
                          placeholder="Chọn phường xã"
                          data={wardSelectList}
                          disabled={form.values['address.districtId'] === null}
                          {...form.getInputProps('address.wardId')}
                        />
                        <TextInput
                          required
                          radius="md"
                          label="Địa chỉ"
                          placeholder="Nhập địa chỉ của bạn"
                          {...form.getInputProps('address.line')}
                        />
                        <Button
                          radius="md"
                          type="submit"
                          disabled={MiscUtils.isEquals(initialFormValues, form.values)}
                        >
                          Cập nhật
                        </Button>
                      </Stack>
                    </form>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </main>
  );
}

export default ClientSettingPersonal;