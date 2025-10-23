import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
  Box,
  Container,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  NumberInput,
  NumberInputHandlers,
  Radio,
  RadioGroup,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Home, InfoCircle, Marquee, ShoppingCart, Trash, X } from 'tabler-icons-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  ClientCartRequest,
  ClientCartResponse,
  ClientCartVariantKeyRequest,
  ClientCartVariantResponse,
  ClientConfirmedOrderResponse,
  ClientPaymentMethodResponse,
  ClientSimpleOrderRequest,
  CollectionWrapper,
  Empty,
  UpdateQuantityType
} from 'types';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';
import useTitle from 'hooks/use-title';
import { Link } from 'react-router-dom';
import MiscUtils from 'utils/MiscUtils';
import useAuthStore from 'stores/use-auth-store';
import { useModals } from '@mantine/modals';
import ApplicationConstants from 'constants/ApplicationConstants';
import useSaveCartApi from 'hooks/use-save-cart-api';
import PageConfigs from 'pages/PageConfigs';
import { PaymentMethodType } from 'models/PaymentMethod';
import useClientSiteStore from 'stores/use-client-site-store';
import { NotificationType } from 'models/Notification';

function ClientCart() {
  useTitle();

  const theme = useMantineTheme();
  const modals = useModals();

  const { user, currentPaymentMethod, updateCurrentPaymentMethod } = useAuthStore();

  const { cartResponse, isLoadingCartResponse, isErrorCartResponse } = useGetCartApi();
  const {
    paymentMethodResponses,
    isLoadingPaymentMethodResponses,
    isErrorPaymentMethodResponses,
  } = useGetAllPaymentMethodsApi();

  const isLoading = isLoadingCartResponse || isLoadingPaymentMethodResponses;
  const isError = isErrorCartResponse || isErrorPaymentMethodResponses;

  let cartContentFragment;

  if (isLoading) {
    cartContentFragment = (
      <Stack>
        {Array(5).fill(0).map((_, index) => (
          <Skeleton key={index} height={50} radius="md" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    cartContentFragment = (
      <Stack my={theme.spacing.xl} sx={{ alignItems: 'center', color: theme.colors.pink[6] }}>
        <AlertTriangle size={125} strokeWidth={1} />
        <Text size="xl" weight={500}>Đã có lỗi xảy ra</Text>
      </Stack>
    );
  }

  if (cartResponse && paymentMethodResponses) {
    let cart: ClientCartResponse;

    if (Object.hasOwn(cartResponse, 'cartId')) {
      cart = cartResponse as ClientCartResponse;
      //console.log('Using cart from cartResponse:', cart);
    } else {
      cart = { cartId: '', cartItems: [] };
    }

    const handleOrderButton = () => {
      const PaymentMethodIcon = PageConfigs.paymentMethodIconMap[currentPaymentMethod];

      modals.openConfirmModal({
        size: 'md',
        overlayColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
        overlayOpacity: 0.55,
        overlayBlur: 0.5,
        closeOnConfirm: false,
        withCloseButton: false,
        title: <strong>Thông báo xác nhận đặt mua</strong>,
        children: (
          <Stack>
            <Text>Bạn có muốn đặt mua những sản phẩm đã chọn với hình thức thanh toán sau?</Text>
            <Group spacing="xs">
              <PaymentMethodIcon color={theme.colors.gray[5]} />
              <Text size="sm">{PageConfigs.paymentMethodNameMap[currentPaymentMethod]}</Text>
            </Group>
          </Stack>
        ),
        labels: {
          cancel: 'Hủy',
          confirm: 'Xác nhận đặt mua',
        },
        confirmProps: { color: 'blue' },
        onConfirm: () =>
          modals.openModal({
            size: 'md',
            overlayColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
            overlayOpacity: 0.55,
            overlayBlur: 0.5,
            closeOnClickOutside: false,
            withCloseButton: false,
            title: <strong>Thông báo xác nhận đặt mua</strong>,
            children: <ConfirmedOrder cartId={cart.cartId} />,
          }),
      });
    };
    const totalAmount = cart.cartItems
      .map(cartItem => cartItem.cartItemQuantity * MiscUtils.calculateDiscountedPrice(
        cartItem.cartItemVariant.variantPrice,
        cartItem.cartItemVariant.variantProduct.productPromotion
          ? cartItem.cartItemVariant.variantProduct.productPromotion.promotionPercent
          : 0
      ))
      .reduce((partialSum, a) => partialSum + a, 0);

    const taxCost = Number((totalAmount * ApplicationConstants.DEFAULT_TAX).toFixed(0));

    const shippingCost = ApplicationConstants.DEFAULT_SHIPPING_COST;

    const totalPay = totalAmount + taxCost + shippingCost;

    cartContentFragment = (
      <Grid>
        <Grid.Col md={9}>
          <Card radius="md" shadow="sm" p={0}>
            <ScrollArea>
              <Table verticalSpacing="md" horizontalSpacing="lg">
                <thead>
                  <tr>
                    <th style={{ minWidth: 325 }}><Text weight="initial" size="sm" color="dimmed">Mặt hàng</Text></th>
                    <th style={{ minWidth: 125 }}><Text weight="initial" size="sm" color="dimmed">Đơn giá</Text></th>
                    <th style={{ minWidth: 150 }}><Text weight="initial" size="sm" color="dimmed">Số lượng</Text></th>
                    <th style={{ minWidth: 125 }}><Text weight="initial" size="sm" color="dimmed">Thành tiền</Text></th>
                    <th style={{ textAlign: 'center', minWidth: 80 }}>
                      <Text weight="initial" size="sm" color="dimmed">Thao tác</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.cartItems
                    .map(cartItem => <CartItemTableRow key={cartItem.cartItemVariant.variantId} cartItem={cartItem} />)}
                  {cart.cartItems.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <Stack my={theme.spacing.xl} sx={{ alignItems: 'center', color: theme.colors.blue[6] }}>
                          <Marquee size={125} strokeWidth={1} />
                          <Text size="xl" weight={500}>Chưa thêm mặt hàng nào</Text>
                        </Stack>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Grid.Col>

        <Grid.Col md={3}>
          <Stack>
            <Card radius="md" shadow="sm" px="lg" pt="md" pb="lg">
              <Stack spacing="xs">
                <Group position="apart">
                  <Text weight={500} color="dimmed">Giao tới</Text>
                  <Button size="xs" variant="light" compact component={Link} to="/user/setting/personal">
                    Thay đổi
                  </Button>
                </Group>
                <Stack spacing={3.5}>
                  <Text weight={500} size="sm">
                    {user?.fullname}
                    <ThemeIcon size="xs" ml="xs" color="teal" title="Địa chỉ của người dùng đặt mua">
                      <Home size={12} />
                    </ThemeIcon>
                  </Text>
                  <Text weight={500} size="sm">{user?.phone}</Text>
                  <Text size="sm" color="dimmed">
                    {[user?.address.line, user?.address.ward?.name, user?.address.districtId?.name, user?.address.provinceId?.name]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </Stack>
              </Stack>
            </Card>

            <Card radius="md" shadow="sm" px="lg" pt="md" pb="lg">
              <Stack spacing="xs">
                <Text weight={500} color="dimmed">Hình thức giao hàng</Text>
                <RadioGroup value="ghn" orientation="vertical" size="sm">
                  <Radio
                    value="ghn"
                    label={<Image src={MiscUtils.ghnLogoPath} styles={{ image: { maxWidth: 170 } }} />}
                  />
                </RadioGroup>
              </Stack>
            </Card>

            <Card radius="md" shadow="sm" px="lg" pt="md" pb="lg">
              <Stack spacing="xs">
                <Text weight={500} color="dimmed">Hình thức thanh toán</Text>
                <RadioGroup
                  value={currentPaymentMethod}
                  onChange={updateCurrentPaymentMethod}
                  orientation="vertical"
                  size="sm"
                >
                  {(paymentMethodResponses?.content || paymentMethodResponses || [])
                    .map(paymentMethod => {

                      {/* SỬA LỖI 1: Dùng `paymentMethod.code` */ }
                      const PaymentMethodIcon = PageConfigs.paymentMethodIconMap[paymentMethod.code];

                      return (
                        <Radio
                          key={paymentMethod._id}
                          value={paymentMethod.code}
                          label={(
                            <Group spacing="xs">
                              {PaymentMethodIcon ? <PaymentMethodIcon size={24} /> : <Box sx={{ width: 24 }} />}
                              {/* SỬA LỖI 4: Dùng `paymentMethod.name` */}
                              <Text size="sm">{paymentMethod.name}</Text>
                            </Group>
                          )}
                        />
                      );
                    })}
                </RadioGroup>

              </Stack>
            </Card>

            <Card radius="md" shadow="sm" p="lg">
              <Stack spacing="xs">
                <Stack spacing="sm">
                  <Group position="apart">
                    <Text size="sm" color="dimmed">Tạm tính</Text>
                    <Text size="sm" sx={{ textAlign: 'right' }}>{MiscUtils.formatPrice(totalAmount) + '\u00A0₫'}</Text>
                  </Group>
                  <Group position="apart">
                    <Text size="sm" color="dimmed">Thuế (10%)</Text>
                    <Text size="sm" sx={{ textAlign: 'right' }}>{MiscUtils.formatPrice(taxCost) + '\u00A0₫'}</Text>
                  </Group>
                  <Group position="apart">
                    <Group spacing="xs">
                      <Text size="sm" weight={500}>Tổng tiền</Text>
                      <Tooltip label="Chưa tính phí vận chuyển" withArrow sx={{ height: 20 }}>
                        <ThemeIcon variant="light" color="blue" size="sm">
                          <InfoCircle size={14} />
                        </ThemeIcon>
                      </Tooltip>
                    </Group>
                    <Text size="lg" weight={700} color="blue" sx={{ textAlign: 'right' }}>
                      {MiscUtils.formatPrice(totalPay) + '\u00A0₫'}
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>

            <Button
              size="lg"
              leftIcon={<ShoppingCart />}
              onClick={handleOrderButton}
              disabled={cart.cartItems.length === 0}
            >
              Đặt mua
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <main>
      <Container size="xl">
        <Stack spacing="lg">
          <Group spacing="xs">
            <ShoppingCart />
            <Title order={2}>Giỏ hàng</Title>
          </Group>

          {cartContentFragment}
        </Stack>
      </Container>
    </main>
  );
}

function CartItemTableRow({ cartItem }: { cartItem: ClientCartVariantResponse }) {
  const theme = useMantineTheme();
  const modals = useModals();

  const cartItemQuantityInputHandlers = useRef<NumberInputHandlers>();

  const { currentCartId, user } = useAuthStore();

  const saveCartApi = useSaveCartApi();
  const deleteCartItemsApi = useDeleteCartItemsApi();

  const handleCartItemQuantityInput = (cartItemQuantity: number) => {
    if (user
      && cartItemQuantity !== cartItem.cartItemQuantity
      && cartItemQuantity <= cartItem.cartItemVariant.variantInventory) {
      const cartRequest: ClientCartRequest = {
        cartId: currentCartId || '',
        userId: user._id,
        cartItems: [
          {
            variantId: cartItem.cartItemVariant.variantId,
            quantity: cartItemQuantity,
          },
        ],
        status: 1,
        updateQuantityType: UpdateQuantityType.OVERRIDE,
      };
      saveCartApi.mutate(cartRequest);
    }
  };

  const handleDeleteCartItemButton = () => {
    modals.openConfirmModal({
      size: 'xs',
      overlayColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
      overlayOpacity: 0.55,
      overlayBlur: 3,
      closeOnClickOutside: false,
      title: <strong>Xóa mặt hàng</strong>,
      children: (
        <Text size="sm">
          Bạn có muốn xóa mặt hàng này?
        </Text>
      ),
      labels: {
        cancel: 'Không xóa',
        confirm: 'Xóa',
      },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteCartItemsApi
        .mutate([{ cartId: currentCartId || '', variantId: cartItem.cartItemVariant.variantId }]),
    });
  };

  return (
    <tr key={cartItem.cartItemVariant.variantId}>
      <td>
        <Group spacing="xs">
          <Image
            radius="md"
            width={65}
            height={65}
            src={cartItem.cartItemVariant.variantProduct.productThumbnail || undefined}
            alt={cartItem.cartItemVariant.variantProduct.productName}
          />
          <Stack spacing={3.5}>
            <Anchor
              component={Link}
              to={'/product/' + cartItem.cartItemVariant.variantProduct.productSlug}
              size="sm"
            >
              {cartItem.cartItemVariant.variantProduct.productName}
            </Anchor>
            {cartItem.cartItemVariant.variantProperties && (
              <Stack spacing={1.5}>
                {cartItem.cartItemVariant.variantProperties.content.map(variantProperty => (
                  <Text key={variantProperty.id} size="xs" color="dimmed">
                    {variantProperty.name}: {typeof variantProperty.value === 'object'
                      ? JSON.stringify(variantProperty.value)
                      : variantProperty.value}
                  </Text>
                ))}
              </Stack>
            )}
          </Stack>
        </Group>
      </td>
      <td>
        <Stack spacing={2.5}>
          <Text weight={500} size="sm">
            {MiscUtils.formatPrice(
              MiscUtils.calculateDiscountedPrice(
                cartItem.cartItemVariant.variantPrice,
                cartItem.cartItemVariant.variantProduct.productPromotion
                  ? cartItem.cartItemVariant.variantProduct.productPromotion.promotionPercent
                  : 0
              )
            )} ₫
          </Text>
          {cartItem.cartItemVariant.variantProduct.productPromotion && (
            <Group spacing="xs">
              <Text size="xs" color="dimmed" sx={{ textDecoration: 'line-through' }}>
                {MiscUtils.formatPrice(cartItem.cartItemVariant.variantPrice)} ₫
              </Text>
              <Badge color="pink" variant="filled" size="sm">
                -{cartItem.cartItemVariant.variantProduct.productPromotion.promotionPercent}%
              </Badge>
            </Group>
          )}
        </Stack>
      </td>
      <td>
        <Stack spacing={3.5}>
          <Group spacing={5}>
            <ActionIcon size={30} variant="default" onClick={() => cartItemQuantityInputHandlers.current?.decrement()}>
              –
            </ActionIcon>

            <NumberInput
              hideControls
              value={cartItem.cartItemQuantity}
              onChange={(value) => handleCartItemQuantityInput(value || 1)}
              handlersRef={cartItemQuantityInputHandlers}
              max={cartItem.cartItemVariant.variantInventory}
              min={1}
              size="xs"
              styles={{ input: { width: 45, textAlign: 'center' } }}
            />

            <ActionIcon size={30} variant="default" onClick={() => cartItemQuantityInputHandlers.current?.increment()}>
              +
            </ActionIcon>
          </Group>
          <Text size="xs" color="dimmed">Tồn kho: {cartItem.cartItemVariant.variantInventory}</Text>
        </Stack>
      </td>
      <td>
        <Text weight={500} size="sm" color="blue">
          {MiscUtils.formatPrice(cartItem.cartItemQuantity *
            MiscUtils.calculateDiscountedPrice(
              cartItem.cartItemVariant.variantPrice,
              cartItem.cartItemVariant.variantProduct.productPromotion
                ? cartItem.cartItemVariant.variantProduct.productPromotion.promotionPercent
                : 0
            )) + ' ₫'}
        </Text>
      </td>
      <td>
        <ActionIcon
          color="red"
          variant="outline"
          size={24}
          title="Xóa"
          onClick={handleDeleteCartItemButton}
          sx={{ margin: 'auto' }}
        >
          <Trash size={16} />
        </ActionIcon>
      </td>
    </tr>
  );
}

function ConfirmedOrder({ cartId }: { cartId: string }) {
  const theme = useMantineTheme();
  const modals = useModals();

  const {
    mutate: createClientOrder,
    data: clientConfirmedOrderResponse,
    isLoading,
    isError,
  } = useCreateClientOrderApi();

  // ĐÃ XÓA: checkoutPaypalStatus
  const [checkoutMomoStatus, setCheckoutMomoStatus] = useState<'none' | 'success' | 'cancel'>('none');

  const { currentPaymentMethod, user } = useAuthStore();
  // 🔽 THÊM DÒNG NÀY ĐỂ XEM TOÀN BỘ USER STATE 🔽
  console.log("USER OBJECT TỪ STORE:", JSON.stringify(user, null, 2));

  let contentFragment;

  useEffect(() => {
    if (checkoutMomoStatus === 'none' && cartId && user && user.address) {
      const request: ClientSimpleOrderRequest = {
        paymentMethodType: currentPaymentMethod,
        cartId: cartId, // Dùng 'cartId' từ props
        shippingAddress: {
          line: user.address.line,
          wardCode: (user.address as any).wardId?.code,
          districtId: user.address.districtId?._id,
          provinceId: user.address.provinceId?._id,
          phone: user.phone,
          fullname: user.fullname,
        }
      };

      // 🔽 THÊM DÒNG NÀY ĐỂ DEBUG 🔽
      console.log("Payload chuẩn bị gửi lên server:", JSON.stringify(request, null, 2));
      createClientOrder(request);
    }

    // SỬA DÒNG NÀY: Thêm 'cartId' vào dependency array
  }, [createClientOrder, currentPaymentMethod, cartId, user, checkoutMomoStatus]);

  const { newNotifications } = useClientSiteStore();

  useEffect(() => {
    if (newNotifications.length > 0 && clientConfirmedOrderResponse) {
      const lastNotification = newNotifications[newNotifications.length - 1];
      if (lastNotification.message.includes(clientConfirmedOrderResponse.orderCode)) {
        // ĐÃ XÓA: Logic cho PayPal

        // Logic cho Momo
        if (lastNotification.type === NotificationType.CHECKOUT_MOMO_SUCCESS) {
          setCheckoutMomoStatus('success');
        }
        if (lastNotification.type === NotificationType.CHECKOUT_MOMO_CANCEL) {
          setCheckoutMomoStatus('cancel');
        }
      }
    }
    // Thêm các state mới vào dependency array
    // ĐÃ XÓA: checkoutPaypalStatus
  }, [clientConfirmedOrderResponse, newNotifications, newNotifications.length, checkoutMomoStatus]);

  // ĐÃ XÓA: handlePaypalCheckoutButton

  // Giữ lại handler cho Momo
  const handleMomoCheckoutButton = (checkoutLink: string) => {
    window.open(checkoutLink, 'mywin', 'width=500,height=800');
  };

  if (isError) {
    contentFragment = (
      <Stack justify="space-between" sx={{ height: '100%' }}>
        <Stack align="center" sx={{ alignItems: 'center', color: theme.colors.pink[6] }}>
          <AlertTriangle size={100} strokeWidth={1} />
          <Text weight={500}>Đã có lỗi xảy ra</Text>
        </Stack>
        <Button fullWidth variant="default" onClick={modals.closeAll} mt="md">
          Đóng
        </Button>
      </Stack>
    );
  }

  if (clientConfirmedOrderResponse && clientConfirmedOrderResponse.orderPaymentMethodType === PaymentMethodType.CASH) {
    contentFragment = (
      <Stack justify="space-between" sx={{ height: '100%' }}>
        <Stack align="center" sx={{ alignItems: 'center', color: theme.colors.teal[6] }}>
          <Check size={100} strokeWidth={1} />
          <Text>
            <span>Đơn hàng </span>
            <Anchor
              component={Link}
              to={'/order/detail/' + clientConfirmedOrderResponse.orderCode}
              onClick={modals.closeAll}
              weight={500}
            >
              {clientConfirmedOrderResponse.orderCode}
            </Anchor>
            <span> đã được tạo!</span>
          </Text>
        </Stack>
        <Button fullWidth variant="default" onClick={modals.closeAll} mt="md">
          Đóng
        </Button>
      </Stack>
    );
  }

  // ĐÃ XÓA: Khối if ( ... PaymentMethodType.PAYPAL)

  // Giữ lại khối logic cho MOMO
  if (clientConfirmedOrderResponse && clientConfirmedOrderResponse.orderPaymentMethodType === PaymentMethodType.MOMO) {
    contentFragment = (
      <Stack justify="space-between" sx={{ height: '100%' }}>
        <Stack align="center" sx={{ alignItems: 'center', color: theme.colors.teal[6] }}>
          <Check size={100} strokeWidth={1} />
          <Text sx={{ textAlign: 'center' }}>
            <span>Đơn hàng </span>
            <Text weight={500} component="span">
              {clientConfirmedOrderResponse.orderCode}
            </Text>
            <span> đã được tạo!</span>
          </Text>
          <Text color="dimmed" size="sm">Hoàn tất thanh toán Momo bằng cách bấm nút dưới</Text>
        </Stack>
        {checkoutMomoStatus === 'none'
          ? (
            <Button
              fullWidth
              mt="md"
              onClick={() => handleMomoCheckoutButton(clientConfirmedOrderResponse.orderMomoCheckoutLink || '')}
              // Giả sử response trả về một 'orderMomoCheckoutLink'
              color="pink" // Momo thường dùng màu hồng
            >
              Thanh toán Momo
            </Button>
          )
          : (checkoutMomoStatus === 'success')
            ? (
              <Button
                fullWidth
                mt="md"
                color="teal"
                leftIcon={<Check />}
                onClick={modals.closeAll}
              >
                Đã thanh toán thành công
              </Button>
            )
            : (
              <Stack spacing="sm">
                <Button
                  fullWidth
                  mt="md"
                  variant="outline"
                  color="pink"
                  leftIcon={<X size={16} />}
                  onClick={modals.closeAll}
                >
                  Đã hủy thanh toán. Đóng hộp thoại này.
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleMomoCheckoutButton(clientConfirmedOrderResponse.orderMomoCheckoutLink || '')}
                  color="pink"
                >
                  Thanh toán Momo lần nữa
                </Button>
              </Stack>
            )}
      </Stack>
    );
  }

  return (
    <Stack sx={{ minHeight: isLoading ? 200 : 'unset' }}>
      <LoadingOverlay visible={isLoading} />
      {contentFragment}
    </Stack>
  );
}


function useGetCartApi() {
  const { updateCurrentCartId } = useAuthStore();

  const {
    data: cartResponse,
    isLoading: isLoadingCartResponse,
    isError: isErrorCartResponse,
  } = useQuery<ClientCartResponse | Empty, ErrorMessage>(
    ['client-api', 'carts', 'getCart'],
    () => FetchUtils.getWithToken(ResourceURL.CLIENT_CART),
    {
      onError: () => NotifyUtils.simpleFailed('Lấy dữ liệu không thành công'),
      keepPreviousData: true,
      // 2. Thêm callback onSuccess
      onSuccess: (data) => {
        if (data && 'cartId' in data) {
          //console.log('Fetched cart data:', data);
          // 3. Cập nhật cartId vào store
          updateCurrentCartId(data.cartId);
        } else {
          console.log('Fetched cart data is empty or has no cartId:', data);
          // Nếu giỏ hàng rỗng hoặc không có cartId, set store về null
          updateCurrentCartId(null);
        }
      },
    }
  );

  return { cartResponse, isLoadingCartResponse, isErrorCartResponse };
}

function useGetAllPaymentMethodsApi() {
  const {
    data: paymentMethodResponses,
    isLoading: isLoadingPaymentMethodResponses,
    isError: isErrorPaymentMethodResponses,
  } = useQuery<CollectionWrapper<ClientPaymentMethodResponse>, ErrorMessage>(
    ['client-api', 'payment-methods', 'getAllPaymentMethods'],
    () => FetchUtils.get(ResourceURL.CLIENT_PAYMENT_METHOD),
    {
      onError: () => NotifyUtils.simpleFailed('Lấy dữ liệu không thành công'),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  return { paymentMethodResponses, isLoadingPaymentMethodResponses, isErrorPaymentMethodResponses };
}

function useDeleteCartItemsApi() {
  const queryClient = useQueryClient();

  const { currentTotalCartItems, updateCurrentTotalCartItems } = useAuthStore();

  return useMutation<void, ErrorMessage, ClientCartVariantKeyRequest[]>(
    (requestBody) => FetchUtils.deleteWithToken(ResourceURL.CLIENT_CART, requestBody),
    {
      onSuccess: (_, requestBody) => {
        void queryClient.invalidateQueries(['client-api', 'carts', 'getCart']);
        updateCurrentTotalCartItems(currentTotalCartItems - requestBody.length);
      },
      onError: () => NotifyUtils.simpleFailed('Không xóa được mặt hàng khỏi giỏ hàng'),
    }
  );
}

function useCreateClientOrderApi() {
  const queryClient = useQueryClient();

  const { updateCurrentCartId, updateCurrentTotalCartItems } = useAuthStore();

  return useMutation<ClientConfirmedOrderResponse, ErrorMessage, ClientSimpleOrderRequest>(
    (requestBody) => FetchUtils.postWithToken(ResourceURL.CLIENT_ORDER, requestBody),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['client-api', 'carts', 'getCart']);
        updateCurrentCartId(null);
        updateCurrentTotalCartItems(0);
      },
    }
  );
}

export default ClientCart;
