import React from 'react';
import { ActionIcon, Center, Group, NumberInput, Stack, Table, Text } from '@mantine/core';
import { VariantResponse } from 'models/Variant';
import { PurchaseOrderVariantRequest } from 'models/PurchaseOrderVariant';
import MiscUtils from 'utils/MiscUtils';
import { Trash } from 'tabler-icons-react';
import { DocketVariantRequest } from 'models/DocketVariant';
import { OrderVariantRequest } from 'models/OrderVariant';
import { CountVariantRequest } from 'models/CountVariant';

export enum EntityType {
  PURCHASE_ORDER,
  DOCKET,
  TRANSFER,
  ORDER,
  COUNT,
}

interface VariantTableProps {
  type: EntityType;
  variants: VariantResponse[];
  variantRequests: Array<PurchaseOrderVariantRequest | DocketVariantRequest | OrderVariantRequest | CountVariantRequest>;
  handleDeleteVariantButton: (index: number) => void;
  handleQuantityInput?: (quantity: number, index: number) => void;
  handleActualInventoryInput?: (actualInventory: number, index: number) => void;
}

function VariantTable({
  type,
  variants,
  variantRequests,
  handleDeleteVariantButton,
  handleQuantityInput,
  handleActualInventoryInput,
}: VariantTableProps) {
  const deltaVariantInventoryFragment = (delta: number) => {
    const result = MiscUtils.formatterPrice(String(Math.abs(delta)));
    if (delta > 0) {
      return <Text color="green" inherit>+{result}</Text>;
    } else if (delta < 0) {
      return <Text color="red" inherit>-{result}</Text>;
    }
    return <Text color="blue" inherit>{result}</Text>;
  };

  return (
    <Table
      horizontalSpacing="xs"
      verticalSpacing="sm"
      striped
    >
      <thead>
        <tr>
          <th style={{ textAlign: 'center' }}>STT</th>
          <th>Mặt hàng</th>
          {type === EntityType.PURCHASE_ORDER && <th style={{ textAlign: 'right' }}>Giá vốn</th>}
          {type === EntityType.ORDER && <th style={{ textAlign: 'right' }}>Giá bán</th>}
          {type !== EntityType.COUNT && <th style={{ textAlign: 'center' }}>Số lượng</th>}
          {type === EntityType.COUNT && <th style={{ textAlign: 'center' }}>Tồn kho</th>}
          {type === EntityType.COUNT && <th style={{ textAlign: 'center' }}>Kiểm thực tế</th>}
          {type === EntityType.COUNT && <th style={{ textAlign: 'center' }}>Chênh lệch</th>}
          {[EntityType.PURCHASE_ORDER, EntityType.ORDER].includes(type) &&
            <th style={{ textAlign: 'right' }}>Thành tiền</th>}
          <th style={{ textAlign: 'center' }}>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((variant, index) => {
          // === SỬA LỖI: THÊM ĐIỀU KIỆN BẢO VỆ ===
          // Lấy request data tương ứng một cách an toàn
          const request = variantRequests[index];

          // NẾU KHÔNG TÌM THẤY REQUEST TƯƠNG ỨNG (do mảng bị lệch)
          // => Bỏ qua (return null) để không làm crash ứng dụng
          if (!request) {
            // Log lỗi ra console để bạn biết đang có vấn đề dữ liệu
            console.error(
              `Dữ liệu không đồng bộ: Không tìm thấy variantRequest tại index ${index} cho variant ${variant.sku}`
            );
            return null; // Quan trọng: Bỏ qua, không render hàng này
          }

          // === TỪ ĐÂY TRỞ ĐI ===
          // Mọi thứ đều an toàn, ta dùng biến `request`
          // thay vì `variantRequests[index]`

          return (
            <tr key={variant._id}>
              <td style={{ textAlign: 'center' }}>{index + 1}</td>
              <td>
                <Stack spacing={2}>
                  {/* ... (phần này không đổi) ... */}
                  <Text size="sm">{variant.product?.name}</Text>
                  <Group spacing={5}>
                    {variant.properties && variant.properties.content &&
                      variant.properties.content.map((property) => (
                        <React.Fragment key={property.code}>
                          <Text size="xs" color="blue" title={property.name}>
                            {property.value}
                          </Text>
                          <Text size="xs" color="dimmed">
                            ⋅
                          </Text>
                        </React.Fragment>
                      ))}
                    <Text size="xs" color="dimmed">
                      SKU: {variant.sku}
                    </Text>
                  </Group>
                </Stack>
              </td>
              {type === EntityType.PURCHASE_ORDER && (
                <td style={{ textAlign: 'right' }}>
                  {MiscUtils.formatPrice(variant.cost) + ' ₫'}
                </td>
              )}
              {type === EntityType.ORDER && (
                <td style={{ textAlign: 'right' }}>
                  {MiscUtils.formatPrice(variant.price) + ' ₫'}
                </td>
              )}
              {type !== EntityType.COUNT && handleQuantityInput && (
                <td>
                  <Center>
                    <NumberInput
                      size="xs"
                      placeholder="--"
                      // Sửa: Dùng `request`
                      value={
                        (
                          request as
                          | PurchaseOrderVariantRequest
                          | DocketVariantRequest
                          | OrderVariantRequest
                        ).quantity
                      }
                      onChange={(value) => handleQuantityInput(value || 1, index)}
                      min={1}
                      max={1_000_000}
                      parser={MiscUtils.parserPrice}
                      formatter={MiscUtils.formatterPrice}
                      sx={{ width: 100 }}
                    />
                  </Center>
                </td>
              )}
              {type === EntityType.COUNT && handleActualInventoryInput && (
                <>
                  <td style={{ textAlign: 'center' }}>
                    {/* Sửa: Dùng `request` */}
                    {(request as CountVariantRequest).inventory}
                  </td>
                  <td>
                    <Center>
                      <NumberInput
                        size="xs"
                        placeholder="--"
                        // Sửa: Dùng `request`
                        value={(request as CountVariantRequest).actualInventory}
                        onChange={(value) =>
                          handleActualInventoryInput(value || 0, index)
                        }
                        min={0}
                        max={1_000_000}
                        parser={MiscUtils.parserPrice}
                        formatter={MiscUtils.formatterPrice}
                        sx={{ width: 100 }}
                      />
                    </Center>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {/* Sửa: Dùng `request` */}
                    {deltaVariantInventoryFragment(
                      (request as CountVariantRequest).actualInventory -
                      (request as CountVariantRequest).inventory
                    )}
                  </td>
                </>
              )}
              {[EntityType.PURCHASE_ORDER, EntityType.ORDER].includes(type) && (
                <td style={{ textAlign: 'right' }}>
                  {MiscUtils.formatPrice(
                    // Sửa: Dùng `request`
                    (request as PurchaseOrderVariantRequest | OrderVariantRequest)
                      .amount
                  ) + ' ₫'}
                </td>
              )}
              <td>
                <Center>
                  <ActionIcon
                    color="red"
                    variant="outline"
                    size={24}
                    title="Xóa mặt hàng này"
                    onClick={() => handleDeleteVariantButton(index)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Center>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default VariantTable;
