import React from 'react';
import { Button, Card, Grid, Group, Stack, Text, Title, useMantineTheme, Loader } from '@mantine/core';
import { List } from 'tabler-icons-react';
import PageConfigs from 'pages/PageConfigs';
import { Link } from 'react-router-dom';
//import MockUtils from 'utils/MockUtils';
import useGetAllApi from 'hooks/use-get-all-api';
import { ClientCategoryResponse } from 'types';
import ResourceURL from 'constants/ResourceURL';

function ClientHomeFeaturedCategories() {
  const theme = useMantineTheme();
  const requestParams = {
    page: 1,
    size: 8, // Chỉ lấy 8 danh mục nổi bật
    sort: 'priority,asc', // Sắp xếp theo độ ưu tiên (ví dụ)
    filter: 'status==1', // Lấy các danh mục đang hoạt động
    search: '',
  };
  const { data: categoryResponse, isLoading } = useGetAllApi<ClientCategoryResponse>(
    ResourceURL.CLIENT_CATEGORY, // <-- Sửa lại URL API của bạn
    'client-featured-categories',         // <-- Sửa lại Resource Key của bạn
    requestParams                // <-- Dùng params ta vừa định nghĩa
  );
  //console.log('Featured Categories API Response:', categoryResponse);
  const categories = categoryResponse as unknown as ClientCategoryResponse[];
  if (isLoading) {
    return <Loader />;
  }

  return (
    <Stack>
      <Group position="apart">
        <Title order={2}>
          <Text
            color="orange"
            inherit
          >
            Danh mục nổi bật
          </Text>
        </Title>
        <Button component={Link} to="/all-categories" variant="light" leftIcon={<List size={16} />} radius="md">
          Xem tất cả
        </Button>
      </Group>
      <Grid>

        {(categories || []).map(category => {
          const CategoryIcon = PageConfigs.categorySlugIconMap[category.slug];

          // Nếu không tìm thấy icon, dùng 1 icon mặc định
          const IconComponent = CategoryIcon || List; // Dùng List làm icon mặc định

          return (
            <Grid.Col key={category.slug} span={6} sm={4} md={3}>
              <Card
                radius="md"
                shadow="sm"
                p="lg"
                component={Link}
                to={'/category/' + category.slug}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
                  },
                }}
              >
                <Group>
                  <IconComponent size={50} strokeWidth={1} />
                  {/* Sửa lại: Dùng 'categoryName' để hiển thị tên */}
                  <Text>{category.name}</Text>
                </Group>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </Stack>
  );
}

export default ClientHomeFeaturedCategories;
