import React from 'react';
import { Button, Grid, Group, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { AlertTriangle, List, Marquee } from 'tabler-icons-react';
import { ClientProductCard } from 'components';
import { useQuery } from 'react-query';
import FetchUtils, { ErrorMessage, ListResponse } from 'utils/FetchUtils';
import { ClientListedProductResponse } from 'types';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';

function ClientHomeLatestProducts() {
  const theme = useMantineTheme();
  const requestParams = { size: 12, newable: true, saleable: true };

  const {
    data: productResponses,
    isLoading: isLoadingProductResponses,
    isError: isErrorProductResponses,
  } = useQuery<any, ErrorMessage>(
    ['client-api', 'products', 'getAllProducts', requestParams],
    () => FetchUtils.get(ResourceURL.CLIENT_PRODUCT, requestParams),
    {
      onError: () => NotifyUtils.simpleFailed('Lấy dữ liệu không thành công'),
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      select: (data) => {
        console.log('RAW API DATA:', data);
        
        // Transform dữ liệu - THÊM TRƯỜNG images
        const transformedContent = (data.content || []).map((item: any) => {
          const transformedProduct = {
            productId: item._id || item.productId,
            productName: item.name || item.productName,
            productSlug: item.slug || item.productSlug,
            productThumbnail: item.thumbnail || item.productThumbnail || null,
            // THÊM DÒNG NÀY - lấy images từ API response
            images: item.images || item.productImages || [],
            productPriceRange: item.priceRange || item.productPriceRange || [0, 0],
            productVariants: item.variants || item.productVariants || [],
            productSaleable: item.saleable !== undefined ? item.saleable : true,
            productPromotion: item.promotion || item.productPromotion || null,
          };

          console.log('Transformed product:', transformedProduct);
          return transformedProduct;
        });

        return {
          ...data,
          content: transformedContent,
        };
      },
    }
  );

  const products = productResponses as ListResponse<ClientListedProductResponse>;

  let resultFragment;

  if (isLoadingProductResponses) {
    resultFragment = (
      <Stack>
        {Array(5).fill(0).map((_, index) => (
          <Skeleton key={index} height={50} radius="md"/>
        ))}
      </Stack>
    );
  }

  if (isErrorProductResponses) {
    resultFragment = (
      <Stack my={theme.spacing.xl} sx={{ alignItems: 'center', color: theme.colors.pink[6] }}>
        <AlertTriangle size={125} strokeWidth={1}/>
        <Text size="xl" weight={500}>Đã có lỗi xảy ra</Text>
      </Stack>
    );
  }

  if (products && products.totalElements === 0) {
    resultFragment = (
<Stack my={theme.spacing.xl} sx={{ alignItems: 'center', color: theme.colors.blue[6] }}>
        <Marquee size={125} strokeWidth={1}/>
        <Text size="xl" weight={500}>Không có sản phẩm</Text>
      </Stack>
    );
  }

  if (products && products.totalElements > 0) {
    resultFragment = (
      <Grid>
        {products.content.map((product, index) => (
          <Grid.Col key={product._id || index} span={6} sm={4} md={3}>
            <ClientProductCard product={product}/>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Stack>
      <Group position="apart">
        <Title order={2}>
          <Text color="orange" inherit>
            Sản phẩm mới nhất
          </Text>
        </Title>
        <Button variant="light" leftIcon={<List size={16}/>} radius="md">
          Xem tất cả
        </Button>
      </Group>

      {resultFragment}
    </Stack>
  );
}

export default ClientHomeLatestProducts;
