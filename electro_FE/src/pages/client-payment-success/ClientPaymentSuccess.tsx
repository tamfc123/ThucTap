// src/pages/ClientPaymentSuccess.tsx
import React from 'react';
import { Button, Stack, Text, useMantineTheme, Group } from '@mantine/core';
import { Check } from 'tabler-icons-react'; // Đảm bảo tabler-icons-react đã được cài
import { ElectroLogo } from 'components'; // Đảm bảo bạn có component này
import useTitle from 'hooks/use-title'; // Đảm bảo bạn có hook này
import { Link } from 'react-router-dom';

// Định nghĩa kiểu cho props
interface ClientPaymentSuccessProps {
  message?: string;
}

const ClientPaymentSuccess: React.FC<ClientPaymentSuccessProps> = ({ message }) => {
  useTitle('Thanh toán thành công');
  const theme = useMantineTheme();

  return (
    <Stack align="center" my="xl">
      <ElectroLogo />
      <Stack align="center" sx={{ alignItems: 'center', color: theme.colors.teal[6] }}>
        <Check size={100} strokeWidth={1} />
        <Text weight={500}>Thanh toán thành công!</Text>
        {message && <Text color="dimmed" size="sm">(Nội dung: {message})</Text>}
      </Stack>

      <Group mt="xl">
        <Button component={Link} to="/" variant="default" size="md">
          Về Trang chủ
        </Button>
        <Button component={Link} to="/my-orders" size="md">
          Xem Lịch sử Đơn hàng
        </Button>
      </Group>
    </Stack>
  );
};

export default ClientPaymentSuccess;