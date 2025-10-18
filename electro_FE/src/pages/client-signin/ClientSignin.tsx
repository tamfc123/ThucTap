import React, { useEffect, useState } from 'react';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Card,
  Container,
  createStyles,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Transition
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm, zodResolver } from '@mantine/form';
import { AlertCircle } from 'tabler-icons-react';

import FetchUtils from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import useAuthStore from 'stores/use-auth-store';
import NotifyUtils from 'utils/NotifyUtils';
import MessageUtils from 'utils/MessageUtils';
import { LoginRequest } from 'models/Authentication';
import { UserResponse } from 'models/User';

const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: 600,
    backgroundSize: 'cover',
    backgroundImage:
      'url(https://images.unsplash.com/photo-1487875961445-47a00398c267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80)',
    backgroundPosition: 'bottom',
    [theme.fn.smallerThan('sm')]: {
      backgroundImage: 'unset',
    },
  },
  form: {
    borderRight: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]}`,
    minHeight: 600,
    maxWidth: 450,
    paddingTop: 80,
    [theme.fn.smallerThan('sm')]: {
      maxWidth: '100%',
      borderRight: 'none',
    },
  },
}));

const initialFormValues = { username: '', password: '' };

const formSchema = z.object({
  username: z.string().min(2, MessageUtils.min('Tên tài khoản', 2)),
  password: z.string().min(1, MessageUtils.min('Mật khẩu', 1)),
});

function ClientSignin() {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const [counter, setCounter] = useState(3);
  const [openedAlert, setOpenedAlert] = useState(false);

  const { user, updateJwtToken, updateUser, resetAuthState } = useAuthStore();

  const form = useForm({
    initialValues: initialFormValues,
    schema: zodResolver(formSchema),
  });

  useEffect(() => {
    if (openedAlert && user && counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (counter === 0 && user) {
      navigate('/');
    }
  }, [counter, navigate, openedAlert, user]);

  const handleFormSubmit = form.onSubmit(async (values) => {
    try {
      // 1. Gọi login
      const loginRequest: LoginRequest = { username: values.username, password: values.password };
      const loginResponse = await FetchUtils.post<{ username: string; password: string }, { token: string }>(
        ResourceURL.LOGIN,
        loginRequest
      );

      // 2. Lưu token vào localStorage
      localStorage.setItem(
        'electro-auth-store',
        JSON.stringify({ state: { jwtToken: loginResponse.token } })
      );
      updateJwtToken(loginResponse.token);

      // 3. Lấy user info
      const userInfo: UserResponse = await FetchUtils.getWithToken(ResourceURL.CLIENT_USER_INFO);
      updateUser(userInfo);

      NotifyUtils.simpleSuccess('Đăng nhập thành công');
      setOpenedAlert(true);
    } catch (err) {
      resetAuthState();
      NotifyUtils.simpleFailed('Đăng nhập thất bại');
    }
  });

  return (
    <main>
      <Container size="xl">
        <Transition mounted={openedAlert} transition="fade" duration={500} timingFunction="ease">
          {(styles) => (
            <Alert
              style={styles}
              icon={<AlertCircle size={16} />}
              title="Bạn đã đăng nhập thành công!"
              color="teal"
              radius="md"
              mb="xl"
            >
              Trở về trang chủ trong {counter} giây...
            </Alert>
          )}
        </Transition>

        <Card className={classes.wrapper} radius="md" shadow="sm" p={0}>
          <Card className={classes.form} radius={0} p={30}>
            <Title order={2} align="center" mt="md" mb={50}>
              Đăng nhập
            </Title>

            <form onSubmit={handleFormSubmit}>
              <TextInput
                required
                radius="md"
                label="Tên tài khoản"
                placeholder="Nhập tên tài khoản"
                size="md"
                disabled={!!user}
                {...form.getInputProps('username')}
              />
              <PasswordInput
                required
                radius="md"
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                mt="md"
                size="md"
                disabled={!!user}
                {...form.getInputProps('password')}
              />
              <Box mt={5}>
                <Anchor component={Link} to="/forgot" size="sm">
                  Quên mật khẩu?
                </Anchor>
              </Box>
              <Button type="submit" fullWidth mt="xl" size="md" disabled={!!user} radius="md">
                Đăng nhập
              </Button>
            </form>

            <Text align="center" mt="md">
              Không có tài khoản?{' '}
              <Anchor component={Link} to="/signup" weight={700}>
                Đăng ký ngay
              </Anchor>
            </Text>
          </Card>
        </Card>
      </Container>
    </main>
  );
}

export default ClientSignin;
