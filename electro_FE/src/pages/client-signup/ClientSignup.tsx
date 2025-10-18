import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import MessageUtils from 'utils/MessageUtils';
import { useForm, zodResolver } from '@mantine/form';
import { Empty, RegistrationRequest, RegistrationResponse, SelectOption } from 'types';
import useTitle from 'hooks/use-title';
import useSelectAddress from 'hooks/use-select-address';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProvinceResponse } from 'models/Province';
import ProvinceConfigs from 'pages/province/ProvinceConfigs';
import { DistrictResponse } from 'models/District';
import DistrictConfigs from 'pages/district/DistrictConfigs';
import { WardResponse } from 'models/Ward';
import WardConfigs from 'pages/ward/WardConfigs';
import { useMutation } from 'react-query';
import { UserRequest } from 'models/User';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';
import {
  Button,
  Card,
  Container,
  Divider,
  PasswordInput,
  Select,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
  useMantineTheme
} from '@mantine/core';
import useAuthStore from 'stores/use-auth-store';
import { Check, MailOpened, ShieldCheck, UserCheck } from 'tabler-icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MiscUtils from 'utils/MiscUtils';
import { useModals } from '@mantine/modals';

const genderSelectList: SelectOption[] = [
  { value: 'M', label: 'Nam' },
  { value: 'F', label: 'Nữ' },
];

function ClientSignup() {
  useTitle();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const [step2UserId, setStep2UserId] = useState<string | null>(null);

  const nextStep = (userId?: string) => {
    setActive((current) => current < 1 ? current + 1 : (current === 1 ? 3 : current));
    if (userId) setStep2UserId(userId); // lưu userId cho STEP 2
  };

  useEffect(() => {
    if (user) navigate('/');
  }, [navigate, user]);

  return (
    <main>
      <Container size="xl">
        <Stack align="center" spacing={50}>
          <Title order={2}>Đăng ký tài khoản</Title>

          <Stepper
            active={active}
            onStepClick={setActive}
            breakpoint="xs"
            styles={{ root: { width: '100%', maxWidth: 800 }, content: { paddingTop: 50 } }}
          >
            <Stepper.Step
              icon={<UserCheck size={18} />}
              label="Bước 1"
              description="Tạo tài khoản"
              allowStepSelect={false}
            >
              <ClientSignupStepOne nextStep={nextStep} />
            </Stepper.Step>

            <Stepper.Step
              icon={<MailOpened size={18} />}
              label="Bước 2"
              description="Xác nhận email"
              allowStepSelect={false}
            >
              <ClientSignupStepTwo nextStep={nextStep} userId={step2UserId} />
            </Stepper.Step>

            <Stepper.Step
              icon={<ShieldCheck size={18} />}
              label="Bước 3"
              description="Đăng ký thành công"
              allowStepSelect={false}
            />

            <Stepper.Completed>
              <ClientSignupStepThree />
            </Stepper.Completed>
          </Stepper>
        </Stack>
      </Container>
    </main>
  );
}

// ===================== STEP 1 =====================
function ClientSignupStepOne({ nextStep }: { nextStep: (userId?: string) => void }) {
  const { updateCurrentSignupUserId } = useAuthStore();

  const initialFormValues = {
    username: '', password: '', fullname: '', email: '', phone: '', gender: 'M' as 'M' | 'F',
    'address.line': '', 'address.provinceId': null as string | null,
    'address.districtId': null as string | null, 'address.wardId': null as string | null,
    avatar: null, status: '2', roles: [] as string[],
  };

  const formSchema = z.object({
    username: z.string().min(2, MessageUtils.min('Tên tài khoản', 2)),
    password: z.string().min(1, MessageUtils.min('Mật khẩu', 1)),
    fullname: z.string(),
    email: z.string().email({ message: 'Nhập email đúng định dạng' }),
    phone: z.string().regex(/(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Nhập số điện thoại đúng định dạng' }),
    gender: z.string(),
    'address.line': z.string(),
    'address.provinceId': z.string(),
    'address.districtId': z.string(),
    'address.wardId': z.string(),
    avatar: z.string().nullable(),
    status: z.string(),
    roles: z.array(z.string()),
  });

  const form = useForm({ initialValues: initialFormValues, schema: zodResolver(formSchema) });
  useSelectAddress(form, 'address.provinceId', 'address.districtId', 'address.wardId');

  const [provinceSelectList, setProvinceSelectList] = useState<SelectOption[]>([]);
  const [districtSelectList, setDistrictSelectList] = useState<SelectOption[]>([]);
  const [wardSelectList, setWardSelectList] = useState<SelectOption[]>([]);

  useGetAllApi<ProvinceResponse>(ProvinceConfigs.resourceUrl, ProvinceConfigs.resourceKey, { all: 1 }, (res) => {
    const mappedProvinces = res.content.map((item) => ({
      value: String(item._id), 
      label: item.name,
    }));
    setProvinceSelectList(mappedProvinces);
  }, { refetchOnWindowFocus: false });

  useGetAllApi<DistrictResponse>(DistrictConfigs.resourceUrl, DistrictConfigs.resourceKey,
    {
      provinceId: form.values['address.provinceId'] || undefined,
      size: 999
    },
    (res) => {
      const mappedDistricts = res.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));

      setDistrictSelectList(mappedDistricts);
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!form.values['address.provinceId']
    }
  );

  useGetAllApi<WardResponse>(WardConfigs.resourceUrl, WardConfigs.resourceKey,
    {
      districtId: form.values['address.districtId'] || undefined,
      size: 999
    },
    (res) => {
      const mappedWards = res.content.map((item) => ({
        value: String(item._id),
        label: item.name,
      }));

      setWardSelectList(mappedWards);
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!form.values['address.districtId']
    }
  );

  const registerUserApi = useMutation<RegistrationResponse, ErrorMessage, UserRequest>(
    (body) => FetchUtils.post(ResourceURL.CLIENT_REGISTRATION, body),
    {
      onSuccess: (res) => {
        // Backend trả về { id: user._id }
        const userId = res.id;
        console.log('Registered user ID:', userId);
        if (!userId) {
          return NotifyUtils.simpleFailed('Không nhận được thông tin user từ server');
        }

        NotifyUtils.simpleSuccess('Tạo tài khoản thành công');
        updateCurrentSignupUserId(userId);
        localStorage.setItem('currentSignupUserId', String(userId));
        nextStep(userId); // truyền userId cho STEP 2
      },
      onError: (err) => {
        NotifyUtils.simpleFailed(err.message || 'Tạo tài khoản không thành công');
      },
    }
  );

  const handleFormSubmit = form.onSubmit((values) => {
    const requestBody: UserRequest = {
      username: values.username,
      password: values.password,
      fullname: values.fullname,
      email: values.email,
      phone: values.phone,
      gender: values.gender,
      address: {
        line: values['address.line'],
        provinceId: values['address.provinceId'],
        districtId: values['address.districtId'],
        wardId: values['address.wardId'],
      },
      avatar: values.avatar,
      status: Number(values.status),
      roles: [],
    };
    registerUserApi.mutate(requestBody);
  });

  return (
    <Card withBorder shadow="md" p={30} radius="md" sx={{ maxWidth: 500, margin: 'auto' }}>
      <form onSubmit={handleFormSubmit}>
        <Stack>
          <TextInput required label="Tên tài khoản" {...form.getInputProps('username')} />
          <PasswordInput required label="Mật khẩu" {...form.getInputProps('password')} />
          <TextInput required label="Họ và tên" {...form.getInputProps('fullname')} />
          <TextInput required label="Email" {...form.getInputProps('email')} />
          <TextInput required label="Số điện thoại" {...form.getInputProps('phone')} />
          <Select required label="Giới tính" data={genderSelectList} {...form.getInputProps('gender')} />
          <Select required label="Tỉnh thành" data={provinceSelectList} {...form.getInputProps('address.provinceId')} />
          <Select required label="Quận huyện" data={districtSelectList} disabled={!form.values['address.provinceId']} {...form.getInputProps('address.districtId')} />
          <Select required label="Phường xã" data={wardSelectList} disabled={!form.values['address.districtId']} {...form.getInputProps('address.wardId')} />
          <TextInput required label="Địa chỉ" {...form.getInputProps('address.line')} />
          <Button type="submit" disabled={MiscUtils.isEquals(initialFormValues, form.values) || registerUserApi.isLoading}>Đăng ký</Button>
        </Stack>
      </form>
    </Card>
  );
}

// ===================== STEP 2 =====================
function ClientSignupStepTwo({ nextStep, userId }: { nextStep: () => void, userId: string | null }) {
  const { updateCurrentSignupUserId } = useAuthStore();
  const [finalUserId, setFinalUserId] = useState<string | null>(userId);

  useEffect(() => {
    if (userId) setFinalUserId(userId);
  }, [userId]);

  const form = useForm({
    initialValues: { code: '' },
    schema: zodResolver(z.object({
      code: z.string().min(6, 'Vui lòng nhập mã xác nhận 6 số'),
    })),
  });

  const confirmApi = useMutation<void, ErrorMessage, { userId: string, code: number }>(
    (body) => FetchUtils.post(ResourceURL.CLIENT_REGISTRATION_CONFIRM, body),
    {
      onSuccess: () => {
        NotifyUtils.simpleSuccess('Xác nhận tài khoản thành công');
        updateCurrentSignupUserId(null);
        localStorage.removeItem('currentSignupUserId');
        nextStep();
      },
      onError: (err) => NotifyUtils.simpleFailed(err.message || 'Xác nhận tài khoản không thành công'),
    }
  );

  const handleSubmit = form.onSubmit((values) => {
    if (!finalUserId) return NotifyUtils.simpleFailed('Không tìm thấy thông tin người dùng');
    confirmApi.mutate({
      userId: finalUserId,
      code: Number(values.code), // chỉ gửi code
    });
  });

  if (!finalUserId) return (
    <Card withBorder shadow="md" p={30} radius="md">
      <Stack align="center">
        <Text color="red">Không tìm thấy thông tin người dùng</Text>
        <Button component={Link} to="/signup">Quay lại đăng ký</Button>
      </Stack>
    </Card>
  );

  return (
    <Card withBorder shadow="md" p={30} radius="md" sx={{ width: 500, margin: 'auto' }}>
      <Stack>
        <Text size="sm" color="dimmed" align="center">
          Mã xác nhận đã được gửi đến email của bạn. Vui lòng nhập để hoàn tất đăng ký.
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput required label="Mã xác nhận" {...form.getInputProps('code')} />
            <Button type="submit" loading={confirmApi.isLoading}>Xác nhận</Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}


// ===================== STEP 3 =====================
function ClientSignupStepThree() {
  const theme = useMantineTheme();
  return (
    <Stack align="center" sx={{ alignItems: 'center', color: theme.colors.teal[6] }}>
      <Check size={100} strokeWidth={1} />
      <Text weight={500}>Đã tạo tài khoản và xác nhận thành công!</Text>
      <Button radius="md" size="lg" mt="xl" component={Link} to="/signin">Đăng nhập</Button>
    </Stack>
  );
}

export default ClientSignup;
