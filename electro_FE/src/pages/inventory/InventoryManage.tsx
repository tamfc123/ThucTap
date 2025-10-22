import React from 'react';
import { ActionIcon, Stack, Table, useMantineTheme } from '@mantine/core'; // Xóa Anchor, Badge
import { ManageHeader, ManageHeaderTitle, ManageMain, ManagePagination } from 'components';
import InventoryConfigs from 'pages/inventory/InventoryConfigs';
import PageConfigs from 'pages/PageConfigs';
import { ListResponse } from 'utils/FetchUtils';
import useGetAllApi from 'hooks/use-get-all-api';
import { ProductInventoryResponse } from 'models/ProductInventory';
import useResetManagePageState from 'hooks/use-reset-manage-page-state';
import { Plus } from 'tabler-icons-react';
// ❌ XÓA import { DocketVariantExtendedResponse } from 'models/DocketVariantExtended';
// ❌ XÓA import { useModals } from '@mantine/modals';
// ❌ XÓA import DateUtils from 'utils/DateUtils';

function InventoryManage() {
  useResetManagePageState();

  // ❌ XÓA const theme = useMantineTheme();
  // ❌ XÓA const modals = useModals();

  const {
    isLoading,
    data: listResponse = PageConfigs.initialListResponse as ListResponse<ProductInventoryResponse>,
  } = useGetAllApi<ProductInventoryResponse>(
    InventoryConfigs.productInventoryResourceUrl,
    InventoryConfigs.productInventoryResourceKey
  );

  // ❌ XÓA hàm handleTransactionsAnchor

  const entitiesTableHeadsFragment = (
    <tr>
      <th>Mã sản phẩm</th>
      <th>Tên sản phẩm</th>
      <th>Nhãn hiệu</th>
      <th>Nhà cung cấp</th>
      <th>Tồn thực tế</th>
      <th>Theo dõi</th>
      {/* Cột Lịch sử (nếu có) đã bị xóa */}
    </tr>
  );

  const entitiesTableRowsFragment = listResponse.content.map((entity) => (
    <tr key={entity?.product?._id || "unknown"}>
      <td>{entity?.product?.code || "—"}</td>
      <td>{entity?.product?.name || "—"}</td>
      <td>{entity?.product?.brand?.name || "—"}</td>
      <td>{entity?.product?.supplier?.displayName || "—"}</td>
      <td>{entity?.inventory ?? 0}</td>
      <td>
        <ActionIcon
          color="blue"
          variant="hover"
          size={24}
          title="Thiết lập định mức tồn kho cho sản phẩm"
        >
          <Plus />
        </ActionIcon>
      </td>
      {/* Cột Giao dịch (nếu có) đã bị xóa */}
    </tr>
  ));


  return (
    <Stack>
      <ManageHeader>
        <ManageHeaderTitle
          titleLinks={InventoryConfigs.manageTitleLinks}
          title={InventoryConfigs.manageTitle}
        />
      </ManageHeader>

      <ManageMain
        listResponse={listResponse}
        isLoading={isLoading}
      >
        <Table
          horizontalSpacing="sm"
          verticalSpacing="sm"
          highlightOnHover
          striped
          sx={(theme) => ({
            borderRadius: theme.radius.sm,
            overflow: 'hidden',
          })}
        >
          <thead>{entitiesTableHeadsFragment}</thead>
          <tbody>{entitiesTableRowsFragment}</tbody>
        </Table>
      </ManageMain>

      <ManagePagination listResponse={listResponse} />
    </Stack>
  );
}

// ❌ XÓA component ProductInventoryTransactionsModal

export default InventoryManage;