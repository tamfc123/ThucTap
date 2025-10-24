// src/pages/ClientPaymentCancel.tsx
import React from 'react';
import useTitle from 'hooks/use-title';
import { Button, Stack, Text, useMantineTheme, Group } from '@mantine/core';
import { ElectroLogo } from 'components';
import { X } from 'tabler-icons-react';
import { Link } from 'react-router-dom';

// Định nghĩa kiểu cho props
interface ClientPaymentCancelProps {
  message?: string;
}

const ClientPaymentCancel: React.FC<ClientPaymentCancelProps> = ({ message }) => {
  useTitle('Thanh toán bị hủy');
  const theme = useMantineTheme();

  return (
    <Stack align="center" my="xl">
      <ElectroLogo />
      <Stack align="center" sx={{ alignItems: 'center', color: theme.colors.pink[6] }}>
        <X size={100} strokeWidth={1} />
        <Text weight={500}>Thanh toán bị hủy</Text>
        {message && <Text color="dimmed" size="sm">(Nội dung: {message})</Text>}
      </Stack>

      <Group mt="xl">
        <Button component={Link} to="/cart" variant="default" size="md">
          Quay về Giỏ hàng
        </Button>
        <Button component={Link} to="/" size="md">
          Về Trang chủ
        </Button>
      </Group>
    </Stack>
  );
};

export default ClientPaymentCancel;