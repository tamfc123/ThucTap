// src/pages/ClientPaymentResult.tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';

// Import 2 component giao diện
import ClientPaymentSuccess from '../client-payment-success/ClientPaymentSuccess';
import ClientPaymentCancel from '../client-payment-cancel/ClientPaymentCancel';

const ClientPaymentResult: React.FC = () => {
  // Dùng useSearchParams để đọc tham số từ URL
  const [searchParams] = useSearchParams();

  // Lấy các tham số (có thể là null)
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message') || undefined; // Chuyển null thành undefined cho props

  // Momo trả về resultCode = 0 là thành công
  // Các trường hợp khác (bao gồm cả null) đều là thất bại
  const isSuccess = resultCode === '0';

  // Quyết định render component nào
  if (isSuccess) {
    return <ClientPaymentSuccess message={message} />;
  } else {
    // Nếu resultCode không phải 0, gán message mặc định nếu không có
    const failMessage = message || 'Giao dịch không thành công hoặc đã bị hủy.';
    return <ClientPaymentCancel message={failMessage} />;
  }
};

export default ClientPaymentResult;