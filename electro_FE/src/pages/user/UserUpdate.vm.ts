import { useState, useEffect, useRef } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import UserConfigs from 'pages/user/UserConfigs';
import { UserRequest, UserResponse } from 'models/User';
import useUpdateApi from 'hooks/use-update-api';
import useGetByIdApi from 'hooks/use-get-by-id-api';
import MiscUtils from 'utils/MiscUtils';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProvinceResponse } from 'models/Province';
import ProvinceConfigs from 'pages/province/ProvinceConfigs';
import { DistrictResponse } from 'models/District';
import DistrictConfigs from 'pages/district/DistrictConfigs';
import { RoleResponse } from 'models/Role';
import { SelectOption } from 'types';
import RoleConfigs from 'pages/role/RoleConfigs';
import { useAdminAuthStore } from 'stores/use-admin-auth-store';
import { useQueryClient } from 'react-query';

function useUserUpdateViewModel(id: string) {
  const form = useForm({
    initialValues: UserConfigs.initialCreateUpdateFormValues,
    schema: zodResolver(UserConfigs.createUpdateFormSchema),
  });
  const queryClient = useQueryClient();

  const { data: destination } = useGetByIdApi<UserResponse>(
    UserConfigs.resourceUrl,
    UserConfigs.resourceKey,
    id
  );


  const { user: adminUser, updateUser: updateAdminUser } = useAdminAuthStore();

  const [user, setUser] = useState<UserResponse>();
  const [prevFormValues, setPrevFormValues] = useState<typeof form.values>();
  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);
  const [roleSelectList, setRoleSelectList] = useState<SelectOption[]>([]);

  const updateApi = useUpdateApi<UserRequest, UserResponse>(UserConfigs.resourceUrl, UserConfigs.resourceKey, id);
  useGetByIdApi<UserResponse>(UserConfigs.resourceUrl, UserConfigs.resourceKey, id,
    (userResponse) => {
      setUser(userResponse);
      const formValues: typeof form.values = {
        username: userResponse.username,
        password: '',
        fullname: userResponse.fullname,
        email: userResponse.email,
        phone: userResponse.phone,
        gender: userResponse.gender,
        'address.line': userResponse.address.line || '',
        'address.provinceId': userResponse.address.provinceId ? String(userResponse.address.provinceId._id) : null,
        'address.districtId': userResponse.address.districtId ? String(userResponse.address.districtId._id) : null,
        avatar: userResponse.avatar || '',
        status: String(userResponse.status),
        roles: userResponse.roles.map((role) => String((role as any).id)),
      };
      //console.log('Loaded user for update:', userResponse, formValues);
      form.setValues(formValues);
      setPrevFormValues(formValues);
    }
  );
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


  useGetAllApi<RoleResponse>(RoleConfigs.resourceUrl, RoleConfigs.resourceKey,
    { sort: 'id,asc', all: 1 },
    (roleListResponse) => {
      const selectList: SelectOption[] = roleListResponse.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));
      setRoleSelectList(selectList);
    }
  );

  const handleFormSubmit = form.onSubmit((formValues) => {
    setPrevFormValues(formValues);

    // TODO: Bad code for check admin
    const checkAdmin = adminUser && adminUser.roles.map(r => r.code).includes('ADMIN')
      && formValues.username === adminUser.username
      && !formValues.roles.includes('1');

    if (!MiscUtils.isEquals(formValues, prevFormValues) && user) {
      if (checkAdmin) {
        form.setFieldError('roles', 'Người quản trị không được xóa quyền Người quản trị');
      } else {
        const requestBody: UserRequest = {
          fullname: formValues.fullname,
          email: formValues.email,
          phone: formValues.phone,
          gender: formValues.gender,
          address: {
            line: formValues['address.line'],
            provinceId: formValues['address.provinceId'],
            districtId: formValues['address.districtId'],
            wardId: null,
          },
          avatar: formValues.avatar.trim() || null,
          status: Number(formValues.status),
          roles: formValues.roles.map((roleId) => ({ id: roleId })),
        };
        updateApi.mutate(requestBody, {
          onSuccess: (userResponse) => {
            if (adminUser && formValues.username === adminUser.username) {
              updateAdminUser(userResponse);
            }
          },
        });
      }
    }
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

  const statusSelectList: SelectOption[] = [
    {
      value: '1',
      label: 'Đã kích hoạt',
    },
    {
      value: '2',
      label: 'Chưa kích hoạt',
    },
  ];

  const isDisabledUpdateButton = MiscUtils.isEquals(form.values, prevFormValues);

  return {
    user,
    form,
    handleFormSubmit,
    genderSelectList,
    provinceSelectList,
    districtSelectList,
    statusSelectList,
    roleSelectList,
    isDisabledUpdateButton,
  };
}

export default useUserUpdateViewModel;
