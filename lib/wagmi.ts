// lib/wagmi.ts
'use client'; // Đánh dấu file này có thể dùng ở client

import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains'; // Import các chain có sẵn nếu cần

// --- TẠO MỘT CHAIN TÙY CHỈNH CHO VICTION ---
// Bạn có thể tìm thông tin này trên trang tài liệu của Viction
export const viction = {
  id: 89, // 89 cho Viction Testnet, 88 cho Mainnet
  name: 'Viction Testnet',
  nativeCurrency: { name: 'Viction', symbol: 'VIC', decimals: 18 },
  rpcUrls: {
    // Dùng RPC mà backend Go của bạn đang dùng để đảm bảo tính nhất quán
    default: { http: ['https://rpc-proxy-sequoia.iqnb.com:8446'] }, 
    // Hoặc RPC của bạn: { http: ['https://rpc-proxy-sequoia.iqnb.com:8446'] }
  },
  blockExplorers: {
    default: { name: 'VictionScan Testnet', url: 'https://testnet.vicscan.xyz' },
  },
} as const; // 'as const' rất quan trọng

// --- TẠO CẤU HÌNH CHÍNH ---
export const config = createConfig({
  // chains: là một mảng các blockchain mà app của bạn hỗ trợ
  chains: [viction, sepolia], 
  
  // transports: chỉ định cách kết nối đến mỗi chain
  transports: {
    [viction.id]: http(), // Dùng kết nối HTTP cho Viction
    [sepolia.id]: http(), // Dùng kết nối HTTP cho Sepolia
  },
});