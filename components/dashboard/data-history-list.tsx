// Bản demo test 
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import { useWatchContractEvent } from 'wagmi';
import { config } from '@/lib/wagmi';
import { dataCollectorConfig } from '@/lib/contracts';
import { PersonItem, PersonItemSkeleton } from '../components-child-dashboard/person-item';

/**
 * Custom Hook để lấy DỮ LIỆU MỚI NHẤT và tự động cập nhật.
 */
function useLatestData() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['latestDataCollectorData'],
        queryFn: async () => {
            console.log("Fetching latest data...");
            // Sử dụng hàm view `getLatestData` của contract
            const latestData = await readContract(config, {
                ...dataCollectorConfig,
                functionName: 'getLatestData',
                args: [],
            });
            // readContract trả về một mảng [person, timestamp]
            return {
                totalPerson: Number(latestData[0]),
                timestamp: Number(latestData[1]),
            }
        },
        refetchInterval: 30000, // Tự động fetch lại sau mỗi 30 giây
    });

    // Lắng nghe sự kiện để cập nhật ngay lập tức, không cần chờ refetchInterval
    useWatchContractEvent({
        ...dataCollectorConfig,
        eventName: 'DataRecorded',
        onLogs: (logs) => {
            console.log('New DataRecorded event detected! Invalidating latest data query.', logs);
            // Vô hiệu hóa query để tanstack-query tự động fetch lại dữ liệu mới nhất
            queryClient.invalidateQueries({ queryKey: ['latestDataCollectorData'] });
        },
    });

    // Tạo một mảng ảo có N phần tử để render
    const personList = useMemo(() => {
        const count = data?.totalPerson ?? 0;
        // Tạo một mảng có độ dài bằng `count`
        return Array.from({ length: count }, (_, index) => index);
    }, [data]);

    return {
        personList,
        totalPerson: data?.totalPerson ?? 0,
        lastUpdated: data?.timestamp ? new Date(data.timestamp * 1000) : null,
        isLoading
    };
}


export default function LatestDataDisplay() {
    const { personList, totalPerson, lastUpdated, isLoading } = useLatestData();

    return (
        <Card className="bg-card/50 border-0 text-foreground flex flex-col h-full min-h-0">
            <CardHeader>
                <CardTitle className="font-medium">Trạng thái mới nhất</CardTitle>
                <CardDescription>
                    {isLoading
                        ? "Đang tải..."
                        : `Có ${totalPerson} người. Cập nhật lúc: ${lastUpdated?.toLocaleTimeString('vi-VN') ?? 'N/A'}`
                    }
                </CardDescription>
            </CardHeader> 
            <CardContent className="flex-grow pr-2 min-h-0 px-1">
                <ScrollArea className="h-full">
                    <div className="space-y-3">
                        {isLoading && (
                            Array(5).fill(0).map((_, index) => <PersonItemSkeleton key={index} />)
                        )}
                        
                        {!isLoading && personList.length === 0 && (
                             <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>Không có dữ liệu nào được ghi nhận.</p>
                            </div>
                        )}

                        {/* Render ra N hàng PersonItem */}
                        {personList.map((personId) => (
                            <PersonItem key={personId} personId={personId} />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}