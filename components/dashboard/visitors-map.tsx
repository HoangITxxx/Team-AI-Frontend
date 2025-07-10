// app/components/dashboard/visitors-map.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useMemo, useCallback } from "react";
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { useQueryClient } from "@tanstack/react-query";
import { visitorAnalyticsLogicConfig } from '@/lib/contracts';

// --- CẤU HÌNH ---
const MAP_WIDTH = 500.0;
const MAP_HEIGHT = 500.0;
const PRECISION_DIVISOR = 100.0;

// === COMPONENT CON: TỰ FETCH VÀ TỰ CẬP NHẬT CHO 1 VISITOR ===
function VisitorAvatar({ visitorId }: { visitorId: `0x${string}` }) {
    const queryClient = useQueryClient();
    const positionQueryKey = useMemo(() => ['visitorPosition', visitorId], [visitorId]);
    const profileQueryKey = useMemo(() => ['visitorProfileForMap', visitorId], [visitorId]);

    // 1. Lấy vị trí cho ID này - <<< THÊM POLLING VÀO ĐÂY >>>
    const { data: positionData } = useReadContract({
        ...visitorAnalyticsLogicConfig,
        functionName: 'visitorPositions',
        args: [visitorId],
        query: {
            queryKey: positionQueryKey,
            // Cứ 5 giây một lần, tự động hỏi lại vị trí.
            // Đây là phương án dự phòng cực kỳ mạnh mẽ.
            refetchInterval: 5000, 
        }
    });

    // 2. Lấy profile cho ID này
    const { data: profileData } = useReadContract({
        ...visitorAnalyticsLogicConfig,
        functionName: 'visitorProfiles',
        args: [visitorId],
        query: { 
            queryKey: profileQueryKey,
            staleTime: 1000 * 60 * 5, // Cache profile trong 5 phút
        }
    });
    
    // 3. Lắng nghe sự kiện để CỐ GẮNG cập nhật sớm hơn polling
    useWatchContractEvent({
        ...visitorAnalyticsLogicConfig,
        eventName: 'VisitorMoved',
        onLogs: (logs) => {
            if (logs.some(log => (log as any).args.visitorId === visitorId)) {
                console.log(`[EVENT-MOVE] Visitor ${visitorId.slice(0,10)} moved. Invalidating position query.`);
                // Invalidate query để nó fetch lại ngay lập tức
                queryClient.invalidateQueries({ queryKey: positionQueryKey });
            }
        },
    });

    // 4. Xử lý và tính toán tọa độ
    const visitorStyle = useMemo(() => {
        if (!positionData) return null;
        
        const position = positionData as any;
        const realX = Number(position[0]) / PRECISION_DIVISOR;
        const realY = Number(position[1]) / PRECISION_DIVISOR;

        const left = `${Math.max(0, Math.min(100, (realX / MAP_WIDTH) * 100))}%`;
        const top = `${Math.max(0, Math.min(100, (realY / MAP_HEIGHT) * 100))}%`;
        
        return { top, left };

    }, [positionData]);
    
    if (!visitorStyle || !profileData) {
        return null;
    }

    const avatarUrl = (profileData as any)[1] || `/avatars/avatar1.png`;

    return (
        <Image
            key={visitorId}
            src={avatarUrl}
            alt={`Visitor ${visitorId}`}
            width={32}
            height={32}
            className="rounded-full absolute border-2 border-white/50 transition-all duration-500 ease-in-out transform -translate-x-1/2 -translate-y-1/2"
            style={visitorStyle}
            title={visitorId}
        />
    );
}

// === COMPONENT CHA: giữ nguyên không đổi ===
export default function VisitorsMap() {
    const queryClient = useQueryClient();

    const { data: activeVisitorIds, isLoading: isLoadingIds } = useReadContract({
        ...visitorAnalyticsLogicConfig,
        functionName: 'getActiveVisitors',
        query: {
            queryKey: ['activeVisitorIdsForMap'],
            refetchInterval: 15000,
            select: (data: unknown) => (data as `0x${string}`[]) || [],
        },
    });
    
    const refreshVisitorList = useCallback(() => {
        console.log("[EVENT-LIST] Visitor enter/leave. Refreshing list...");
        queryClient.invalidateQueries({ queryKey: ['activeVisitorIdsForMap'] });
    }, [queryClient]);
    
    useWatchContractEvent({ ...visitorAnalyticsLogicConfig, eventName: 'VisitorEnteredMap', onLogs: refreshVisitorList });
    useWatchContractEvent({ ...visitorAnalyticsLogicConfig, eventName: 'VisitorLeftMap', onLogs: refreshVisitorList });
    
    return (
        <Card className="bg-white/10 border-0 text-foreground h-full p-2 flex flex-col">
            <CardHeader>
                <CardTitle className="font-extrabold pb-2">Visitors</CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm w-fit">
                    Real-time map
                </span>
            </CardHeader>
            <CardContent className="relative flex-grow">
                {/* Map Background */}
                <div className="absolute inset-0 bg-gray-700/50 rounded-lg p-2 flex flex-col gap-2">
                    <div className="h-1/3 grid grid-cols-3 gap-2"><div className="bg-black/20 rounded"></div><div className="col-span-2 bg-black/20 rounded"></div></div>
                    <div className="h-2/3 grid grid-cols-2 gap-2"><div className="bg-black/20 rounded"></div><div className="bg-black/20 rounded"></div></div>
                </div>
                
                {isLoadingIds && (
                    <div className="absolute inset-0 flex items-center justify-center"><p className="text-muted-foreground text-sm">Loading visitor list...</p></div>
                )}
                
                {!isLoadingIds && activeVisitorIds && activeVisitorIds.map((id) => (
                    <VisitorAvatar key={id} visitorId={id} />
                ))}

                 {!isLoadingIds && (!activeVisitorIds || activeVisitorIds.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center"><p className="text-muted-foreground text-sm">No active visitors on the map.</p></div>
                )}
            </CardContent>
        </Card>
    );
}