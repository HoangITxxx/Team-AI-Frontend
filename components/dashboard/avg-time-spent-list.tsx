"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useInfiniteQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import { useWatchContractEvent } from 'wagmi';
import { config } from '@/lib/wagmi';
import { visitorAnalyticsLogicConfig } from '@/lib/contracts';
import { useInView } from 'react-intersection-observer';
// --- 1. Import component mới ---
import { TimeSpentItem, ItemSkeleton } from '../components-child-dashboard/time-spent-item';

const PAGE_SIZE = 100;

function formatTime(seconds: number): string {
    if (seconds < 60) return "< 1 phút";
    const minutes = Math.round(seconds / 60);
    return `${minutes} phút`;
}

function usePaginatedTimeSpentData() {
    const queryClient = useQueryClient();
    const { ref, inView } = useInView();
    const fallbackAvatar = "/avatars/avatar1.png";

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['activeVisitorProfiles'],
        queryFn: async ({ pageParam = 0 }) => {
            const profiles = await readContract(config, {
                ...visitorAnalyticsLogicConfig,
                functionName: 'getActiveVisitorProfilesPaginated',
                args: [BigInt(pageParam), BigInt(PAGE_SIZE)],
            });
            return profiles as any[];
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length === PAGE_SIZE) {
                return allPages.length * PAGE_SIZE;
            }
            return undefined;
        },
    });

    const invalidateActiveVisitorList = () => {
        console.log('Invalidating active visitor list...');
        // Vô hiệu hóa và làm mới query của useInfiniteQuery
        queryClient.invalidateQueries({ queryKey: ['activeVisitorProfiles'] });
    }

    useWatchContractEvent({
        ...visitorAnalyticsLogicConfig,
        eventName: 'VisitorEnteredMap',
        onLogs: invalidateActiveVisitorList,
    });
    
    useWatchContractEvent({
        ...visitorAnalyticsLogicConfig,
        eventName: 'VisitorLeftMap',
        onLogs: invalidateActiveVisitorList,
    });

    useWatchContractEvent({
        ...visitorAnalyticsLogicConfig,
        eventName: 'ProfileUpdated',
        onLogs: invalidateActiveVisitorList,
    });

    useMemo(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const timeSpentData = useMemo(() => {
        const flatData = data?.pages.flat() || [];
        return flatData.map(profile => {
                const visitCount = Number(profile.visitCount);
                const totalTimeSpent = Number(profile.totalTimeSpent);
                const avgTimeInSeconds = visitCount > 0 ? totalTimeSpent / visitCount : 0;
                
                return {
                    id: profile.visitorId,
                    displayId: `${profile.visitorId.slice(0, 10)}...`,
                    rawTimestamp: Number(profile.lastVisitTimestamp),
                    date: profile.lastVisitTimestamp > 0 ? new Date(Number(profile.lastVisitTimestamp) * 1000).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }) : "N/A",
                    views: visitCount,
                    time: formatTime(avgTimeInSeconds),
                    avatar: (profile.avatarUrl && profile.avatarUrl.startsWith('http')) ? profile.avatarUrl : fallbackAvatar,
                };
            })
            .sort((a, b) => b.rawTimestamp - a.rawTimestamp);
    }, [data]);
    
    return { timeSpentData, isLoading, isFetchingNextPage, hasNextPage, ref };
}

export default function AvgTimeSpentList() {
    const { timeSpentData, isLoading, isFetchingNextPage, hasNextPage, ref } = usePaginatedTimeSpentData();

    return (
        <Card className="bg-card/50 border-0 text-foreground flex flex-col h-full min-h-0">
            <CardHeader>
                <CardTitle className="font-medium">AVG time spent</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow pr-2 min-h-0 px-1">
                <ScrollArea className="h-full">
                    <div className="space-y-3">
                        {isLoading && !timeSpentData.length ? (
                            // Sử dụng ItemSkeleton đã import
                            Array(5).fill(0).map((_, index) => <ItemSkeleton key={index} />)
                        ) : timeSpentData.length === 0 ? (
                             <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>No active visitors found.</p>
                            </div>
                        ) : (
                            // --- 2. Sử dụng component TimeSpentItem ---
                            timeSpentData.map((item) => (
                                <TimeSpentItem key={item.id} item={item} />
                            ))
                        )}
                        
                        {/* Phần tử trigger để tải thêm */}
                        {hasNextPage && (
                            <div ref={ref} className="flex justify-center py-4">
                                {/* Hiển thị skeleton khi đang tải trang tiếp theo */}
                                {isFetchingNextPage ? <ItemSkeleton /> : null}
                            </div>
                        )}
                    </div>
                    <ScrollBar />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}