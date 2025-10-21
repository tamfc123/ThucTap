import React, { Dispatch, SetStateAction } from 'react';
import {
  Anchor,
  // Grid, // (1) Xóa import không dùng
  Group,
  // ScrollArea, // (2) Xóa import không dùng
  Skeleton,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  useMantineTheme
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import PageConfigs from 'pages/PageConfigs';
import { useQuery } from 'react-query';
// (3) Xóa CollectionWrapper (không dùng)
import { ClientCategoryResponse } from 'types';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';
// (4) Thêm 'List' vào import
import { AlertTriangle, List } from 'tabler-icons-react';

function CategoryMenu({ setOpenedCategoryMenu }: { setOpenedCategoryMenu: Dispatch<SetStateAction<boolean>> }) {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  // (5) Dòng useQuery này của bạn đã SỬA ĐÚNG
  const {
    data: categoryResponses,
    isLoading: isLoadingCategoryResponses,
    isError: isErrorCategoryResponses,
  } = useQuery<ClientCategoryResponse[], ErrorMessage>( // <-- Đã đúng (là Mảng)
    ['client-api', 'categories', 'getAllCategories'],
    () => FetchUtils.get(ResourceURL.CLIENT_CATEGORY),
    {
      onError: () => NotifyUtils.simpleFailed('Lấy dữ liệu không thành công'),
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  // (6) Hai khối if (isLoading, isError) này đã ĐÚNG
  if (isLoadingCategoryResponses) {
    return (
      <Stack>
        {Array(5).fill(0).map((_, index) => (
          <Skeleton key={index} height={50} radius="md" />
        ))}
      </Stack>
    );
  }

  if (isErrorCategoryResponses) {
    return (
      <Stack my={theme.spacing.xl} sx={{ alignItems: 'center', color: theme.colors.pink[6] }}>
        <AlertTriangle size={125} strokeWidth={1} />
        <Text size="xl" weight={500}>Đã có lỗi xảy ra</Text>
      </Stack>
    );
  }

  const handleAnchor = (path: string) => {
    setOpenedCategoryMenu(false);
    setTimeout(() => navigate(path), 200);
  };

  // (7) Sửa lại TOÀN BỘ khối return
  return (
    <Tabs
      variant="pills"
      tabPadding="md"
      styles={{
        // ... styles của bạn
        tabActive: {
          color: (theme.colorScheme === 'dark' ? theme.colors.blue[2] : theme.colors.blue[6]) + '!important',
          backgroundColor: (theme.colorScheme === 'dark'
            ? theme.fn.rgba(theme.colors.blue[8], 0.35) : theme.colors.blue[0]) + '!important',
        },
      }}
    >
      {/* - Chỉ dùng 1 vòng lặp
        - Dùng biến "categoryResponses" (đã có)
        - Dùng (categoryResponses || []) cho an toàn
      */}
      {(categoryResponses || []).map((firstCategory, index) => {
        const FirstCategoryIcon = PageConfigs.categorySlugIconMap[firstCategory.slug];

        // (8) Dùng biến 'List' đã import
        const IconComponent = FirstCategoryIcon || List; // Icon mặc định

        return (
          <Tabs.Tab
            key={index}
            label={firstCategory.name}
            icon={<IconComponent size={14} />}
          >
            {/* Đây là nội dung của Tab (Panel) */}
            <Stack>
              {/* === Bạn chỉ muốn giữ lại phần này === */}
              <Group>
                <ThemeIcon variant="light" size={42}>
                  <IconComponent />
                </ThemeIcon>
                <Anchor
                  sx={{ fontSize: theme.fontSizes.sm * 2 }}
                  weight={500}
                  onClick={() => handleAnchor('/category/' + firstCategory.slug)}
                >
                  {firstCategory.name}
                </Anchor>
              </Group>

              {/* === PHẦN <ScrollArea> ĐÃ BỊ XÓA (theo ý bạn) === */}

            </Stack>
          </Tabs.Tab>
        );
      })}
    </Tabs>
  );
}

export default CategoryMenu;