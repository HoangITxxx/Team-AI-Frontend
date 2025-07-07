// lib/contracts.ts

// 1. Import ABI từ file JSON
import VisitorAnalyticsLogicAbi from './abi/VisitorAnalyticsLogic.json';

// 2. Định nghĩa địa chỉ của Smart Contract đã được deploy
//    (Đây là địa chỉ bạn đã dùng trong backend Go)
export const visitorAnalyticsLogicAddress = '0x03972fdbe2E2b1748fC09c6aa709F9d7241f3bF0'; // << THAY BẰNG ĐỊA CHỈ CỦA BẠN

// 3. Tạo một object cấu hình để dễ dàng sử dụng ở nhiều nơi
export const visitorAnalyticsLogicConfig = {
  address: visitorAnalyticsLogicAddress,
  abi: VisitorAnalyticsLogicAbi, // Gán ABI đã import vào đây
} as const; 