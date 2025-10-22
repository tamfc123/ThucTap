import React from 'react';
import { Box, createStyles, Grid, Group, Stack, Text, useMantineTheme } from '@mantine/core';
import { Car, HeartHandshake, Stars } from 'tabler-icons-react';
import { ClientCarousel } from 'components';

const useStyles = createStyles((theme) => ({
  rightBanner: {
    flexWrap: 'unset',
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
    borderRadius: theme.radius.md,
  },
}));

function ClientHomeBanner() {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  return (
    <Grid>
      <Grid.Col md={7} lg={8}>
        <ClientCarousel>
          <Box
            sx={{
              height: 'auto',
              minHeight: 315,
              backgroundImage: 'url("https://lh3.googleusercontent.com/fQe5S9rfCCTrBikICp0IiPRNOIq0GCp1omYLCS08haKO0tSE3rEioKhFnTgvcPIFqUMfdPpewATi_zEL1INFJU7IEa-wM0iM=w1920-rw")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
          </Box>
          <Box
            sx={{
              height: 'auto',
              minHeight: 315,
              backgroundImage: 'url("https://lh3.googleusercontent.com/O028963v5H1jPm1rv3xa5bwSzsncc86JNlXB5yNEskDGtrGN_RtCOlxciyzQFSS-Dhgm2lu7HrqQkxUAEttjqlwKw6_-5PakFw=w1920-rw")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
          </Box>
          <Box
            sx={{
              height: 'auto',
              minHeight: 315,
              backgroundImage: 'url("https://img.pikbest.com/templates/20240520/purple-sale-banner-decorates-a-shop-selling-electronics_10575062.jpg!w700wp")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
          </Box>
          <Box
            sx={{
              height: 'auto',
              minHeight: 315,
              backgroundImage: 'url("https://balotuixachsaigon.com/wp-content/uploads/2016/04/banner-19-2.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
          </Box>
        </ClientCarousel>
      </Grid.Col>
      <Grid.Col md={5} lg={4}>
        <Stack>
          <Group py="sm" px="md" className={classes.rightBanner}>
            <Car size={65} strokeWidth={1}/>
            <Stack spacing={theme.spacing.xs / 4}>
              <Text size="md" weight={500}>Miễn phí vận chuyển</Text>
              <Text size="sm">100% đơn hàng đều được miễn phí vận chuyển khi thanh toán trước.</Text>
            </Stack>
          </Group>
          <Group py="sm" px="md" className={classes.rightBanner}>
            <Stars size={65} strokeWidth={1}/>
            <Stack spacing={theme.spacing.xs / 4}>
              <Text size="md" weight={500}>Bảo hành tận tâm</Text>
              <Text size="sm">Bất kể giấy tờ thế nào, công ty luôn cam kết sẽ hỗ trợ khách hàng tới cùng.</Text>
            </Stack>
          </Group>
          <Group py="sm" px="md" className={classes.rightBanner}>
            <HeartHandshake size={65} strokeWidth={1}/>
            <Stack spacing={theme.spacing.xs / 4}>
              <Text size="md" weight={500}>Đổi trả 1-1 hoặc hoàn tiền</Text>
              <Text size="sm">Nếu phát sinh lỗi hoặc bạn cảm thấy sản phẩm chưa đáp ứng được nhu cầu.</Text>
            </Stack>
          </Group>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

export default ClientHomeBanner;
