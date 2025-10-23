// hooks/use-save-cart-api.tsx
import { useMutation, useQueryClient } from 'react-query';
import useAuthStore from 'stores/use-auth-store';
import { ClientCartRequest, ClientCartResponse } from 'types';
import FetchUtils, { ErrorMessage } from 'utils/FetchUtils';
import ResourceURL from 'constants/ResourceURL';
import NotifyUtils from 'utils/NotifyUtils';


function useSaveCartApi() {
  const queryClient = useQueryClient();
  const { currentCartId, currentTotalCartItems, updateCurrentCartId, updateCurrentTotalCartItems } = useAuthStore();

  return useMutation<any, ErrorMessage, ClientCartRequest>(
    (requestBody) => FetchUtils.postWithToken(ResourceURL.CLIENT_CART, requestBody),
    {
      onSuccess: (cartResponse) => { // cartResponse đang là undefined

        // 🔽 FIX: THÊM DÒNG NÀY ĐỂ KIỂM TRA 🔽
        if (!cartResponse) {
          console.error('SaveCart Success Callback: Received undefined response from server.');
          NotifyUtils.simpleFailed('Có lỗi xảy ra, response từ server rỗng.');
          return; // Dừng hàm tại đây
        }
        // 🔼 KẾT THÚC FIX 🔼

        console.log('Cart API Response:', cartResponse);

        void queryClient.invalidateQueries(['client-api', 'carts', 'getCart']);

        const cartItems = cartResponse.cartItems || cartResponse.cartVariants || [];

        const totalItems = cartItems.reduce((total: number, item: any) => {
          // SỬA LẠI LOGIC TÍNH TỔNG CHO ĐÚNG (nếu dùng controller phức tạp)
          return total + (item.cartItemQuantity || item.quantity || 0);
        }, 0);

        const cartId = cartResponse.cartId || cartResponse._id;

        console.log('Processed cart items:', cartItems);
        console.log('Processed cart ID:', cartId);
        console.log('Total items calculated:', totalItems);

        if (currentCartId !== cartId) {
          updateCurrentCartId(cartId);
        }

        if (currentTotalCartItems !== totalItems) {
          updateCurrentTotalCartItems(totalItems);
        }

        // Bỏ qua logic thông báo phức tạp ở đây
        // vì bạn đã có thông báo ở ClientProductIntro.tsx

      },
      onError: () => NotifyUtils.simpleFailed('Không lưu được thay đổi trên giỏ hàng'),
    }
  );
}

export default useSaveCartApi;