// lib/store.ts
import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu cho state
interface SelectedVisitorState {
  selectedVisitorId: string | null;
  selectionTimestamp: number | null;
  selectVisitor: (id: string) => void;
  clearSelection: () => void;
}

// Tạo store
export const useVisitorStore = create<SelectedVisitorState>((set) => ({
  selectedVisitorId: null,
  selectionTimestamp: null,
  
  // Hàm để chọn một visitor
  selectVisitor: (id: string) => set({
    selectedVisitorId: id,
    selectionTimestamp: Date.now(), // Lưu lại thời điểm chọn
  }),

  // Hàm để xóa lựa chọn
  clearSelection: () => set({
    selectedVisitorId: null,
    selectionTimestamp: null,
  }),
}));