// lib/contracts.ts

// 1. Import ABI từ file JSON
import VisitorAnalyticsLogicAbi from './abi/VisitorAnalyticsLogic.json';
import  visitorDataStoreABI  from './abi/VisitorDataStore.json';
import DataCollectorAbi from './abi/demo.json';

// 2. Định nghĩa địa chỉ của Smart Contract đã được deploy
//    (Đây là địa chỉ bạn đã dùng trong backend Go)
export const visitorAnalyticsLogicAddress = '0x7381598915fcE991428afEBAcAC5e6D8B5067304'; // << THAY BẰNG ĐỊA CHỈ CỦA BẠN
export const dataCollectorAddress = '0x6b8FB9933c3832ACf8bc554a3A189Dd5931F90d2';

// 3. Tạo một object cấu hình để dễ dàng sử dụng ở nhiều nơi
export const visitorAnalyticsLogicConfig = {
  address: visitorAnalyticsLogicAddress,
  abi: VisitorAnalyticsLogicAbi, // Gán ABI đã import vào đây
} as const; 

export const visitorDataStoreConfig = {
  abi: visitorDataStoreABI,
} as const

export const dataCollectorConfig = {
    address: dataCollectorAddress,
    abi: DataCollectorAbi,
} as const;