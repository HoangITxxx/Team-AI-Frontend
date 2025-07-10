"use client";

import Image from "next/image";
import { Star, Pencil, UserPlus, User, Hourglass, History, Globe, Smile, Ruler, Badge } from "lucide-react";
import { useMemo, useCallback } from "react";
import { useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi';
import { useQueryClient } from "@tanstack/react-query";
import { visitorAnalyticsLogicConfig, visitorDataStoreConfig } from '@/lib/contracts';

import { Skeleton } from "@/components/ui/skeleton";

// --- HOOKS ĐỂ LẤY DỮ LIỆU ---

// Lấy danh sách ID
function useActiveVisitorIds() {
    const queryClient = useQueryClient();
    const QUERY_KEY = ['activeVisitorsList'];

    const { data, isLoading } = useReadContract({
        ...visitorAnalyticsLogicConfig,
        functionName: 'getActiveVisitors',
        queryKey: QUERY_KEY,
        refetchInterval: 5000,
    });

    const refreshList = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }, [queryClient]);

    useWatchContractEvent({ ...visitorAnalyticsLogicConfig, eventName: 'VisitorEnteredMap', onLogs: refreshList });
    useWatchContractEvent({ ...visitorAnalyticsLogicConfig, eventName: 'VisitorLeftMap', onLogs: refreshList });

    return { visitorIds: (data as `0x${string}`[] || []), isLoading };
}

// Lấy profile chi tiết
function useVisitorProfile(visitorId: string | null) {
    const queryClient = useQueryClient();
    const QUERY_KEY = ['visitorProfile', visitorId];
    
    const { data, isLoading } = useReadContract({
        ...visitorAnalyticsLogicConfig,
        functionName: 'visitorProfiles',
        args: [visitorId as `0x${string}`],
        queryKey: QUERY_KEY,
        enabled: !!visitorId,
        refetchInterval: 5000,
    });

    const refreshProfile = useCallback(() => {
        if(visitorId) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
    }, [queryClient, QUERY_KEY, visitorId]);
    
    useWatchContractEvent({
        ...visitorAnalyticsLogicConfig,
        eventName: 'ProfileUpdated',
        onLogs: (logs) => {
            if (logs.some(log => (log as any).args.visitorId === visitorId)) {
                refreshProfile();
            }
        }
    });

    return { profile: data as any, isLoading };
}

// Lấy cảm xúc cuối cùng
function useLastEmotion(visitorId: string | null) {
    const queryClient = useQueryClient();

    // 1. LẤY ĐỊA CHỈ CỦA DATA STORE HIỆN TẠI
    const { data: currentStoreAddress } = useReadContract({
        ...visitorAnalyticsLogicConfig,
        functionName: 'getCurrentDataStoreAddress',
        queryKey: ['currentDataStoreAddress'],
        enabled: !!visitorId,
        refetchInterval: 5000,
    });

    // 2. GỌI getAllRecords TRÊN ĐỊA CHỈ ĐÓ
    const { data: records, isLoading } = useReadContract({
        address: currentStoreAddress as `0x${string}` | undefined,
        abi: visitorDataStoreConfig.abi,
        functionName: 'getAllRecords',
        queryKey: ['recordsFromCurrentStore', currentStoreAddress],
        enabled: !!currentStoreAddress,
        refetchInterval: 5000,
    });
    //console.log("data records: ", records);

    // 3. LẮNG NGHE SỰ KIỆN VÀ LÀM MỚI
    useWatchContractEvent({
        ...visitorAnalyticsLogicConfig,
        eventName: 'VisitRecorded',
        onLogs: () => {
         //   console.log("VisitRecorded event, refreshing emotion data...");
            queryClient.invalidateQueries({ queryKey: ['currentDataStoreAddress'] });
            queryClient.invalidateQueries({ queryKey: ['recordsFromCurrentStore'] });
        }
    });

    const lastEmotion = useMemo(() => {
        if (!records || !visitorId) return "N/A";
        
       // console.log(`Searching for visitor ${visitorId} in ${records.length} records.`);

        // Lặp ngược từ record mới nhất trong store hiện tại
        for (let i = (records as any[]).length - 1; i >= 0; i--) {
            const record = records[i] as { visitorId: string, emotion: string }; // Lấy record là OBJECT
            
            // SỬA LẠI ĐIỀU KIỆN KIỂM TRA CHO ĐÚNG
            if (record.visitorId === visitorId) {
              //  console.log(`FOUND! Emotion is: ${record.emotion}`);
                return record.emotion || "N/A";
            }
        }
        
      //  console.log(`Visitor ${visitorId} not found in current store records.`);
        return "N/A";
    }, [records, visitorId]);

    return { lastEmotion, isLoadingEmotion: isLoading };
}

// --- COMPONENT SKELETON & STYLES ---
const SidebarSkeleton = () => (
    <div className="bg-card/50 border-0 flex flex-col h-full text-foreground space-y-4 p-5 animate-pulse">
        <div className="h-14 w-12 self-end" />
        <div className="flex flex-col items-center space-y-2 mt-4">
            <Skeleton className="h-[130px] w-[130px] rounded-full" />
            <Skeleton className="h-6 w-48 mt-2" />
        </div>
        <div className="space-y-2 pt-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
            {Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-full" />)}
        </div>
    </div>
);
const badgeClasses = "flex items-center justify-between rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 text-sm text-foreground";
const labelClasses = "text-[8px] text-white/70 uppercase";
const mainContentClasses = "flex items-center gap-2";

// --- HÀM CHUYỂN ĐỔI DATA ---
const processProfileData = (profileArray: any[] | null) => {
    if (!profileArray || profileArray.length < 12 || !profileArray[11]) return null;
    return {
        visitorId: profileArray[0], avatarUrl: profileArray[1], realImageUrl: profileArray[2],
        appearanceText: profileArray[3], ageGroup: profileArray[4], gender: profileArray[5],
        origin: profileArray[6], height: profileArray[7], totalTimeSpent: profileArray[8],
        visitCount: profileArray[9], lastVisitTimestamp: profileArray[10], exists: profileArray[11],
    };
};

// --- COMPONENT SIDEBAR CHÍNH ---
export default function Sidebar() {
    const { visitorIds, isLoading: isLoadingIds } = useActiveVisitorIds();
    const mainVisitorId = useMemo(() => {
        if (visitorIds.length === 0) return null;
        // Giả sử danh sách chưa được sắp xếp, ta cần lấy profile để sắp xếp
        // Nhưng để đơn giản, ta cứ lấy người đầu tiên
        return visitorIds[0];
    }, [visitorIds]);

    const { profile: rawProfile, isLoading: isLoadingProfile } = useVisitorProfile(mainVisitorId);
    const { lastEmotion, isLoadingEmotion } = useLastEmotion(mainVisitorId);

    const mainProfile = useMemo(() => processProfileData(rawProfile), [rawProfile]);
    const otherVisitors = useMemo(() => visitorIds.slice(1, 5), [visitorIds]); // Lấy 4 người tiếp theo

    const isLoading = isLoadingIds || (!!mainVisitorId && (isLoadingProfile || isLoadingEmotion));

    if (isLoading && !mainProfile) return <SidebarSkeleton />;
    if (!mainProfile) {
        return (
            <div className="bg-card/50 border-0 flex flex-col h-full text-foreground p-5 items-center justify-center">
                <p className="text-muted-foreground">No active visitors</p>
            </div>
        );
    }
    
    const ageGroupMap = ['N/A', 'Child', 'Teen', 'Adult', 'Senior'];
    const genderMap = ['N/A', 'Male', 'Female'];
    const avgTimeSpent = mainProfile.visitCount > 0 ? Math.round(Number(mainProfile.totalTimeSpent) / Number(mainProfile.visitCount) / 60) : 0;
    const mainAvatarSrc = mainProfile.avatarUrl && mainProfile.avatarUrl.startsWith('/') ? mainProfile.avatarUrl : "/avatars/main-avatar.png";

    return (
        <div className="bg-card/50 border-0 flex flex-col h-full text-foreground space-y-4 p-5">
            {/* Header */}
            <div className="flex justify-end items-center"><div className="bg-white/10 p-2 rounded-full relative"><Star className="w-8 h-8 text-blue-300" /></div></div>

            {/* Main Profile */}
            <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                    <Image key={mainProfile.visitorId} src={mainAvatarSrc} alt="Main Visitor" width={130} height={130} className="rounded-full border-4 border-white/20 object-cover bg-black/20" />
                </div>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{`${mainProfile.visitorId.slice(0, 8)}...${mainProfile.visitorId.slice(-6)}`}</h2>
                    <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer" />
                </div>
            </div>

            {/* Appearance Info */}
            <div className="space-y-2">
                <h3 className="font-medium">Thông tin mô tả</h3>
                <p className="text-sm text-muted-foreground">{mainProfile.appearanceText || "No information."}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className={badgeClasses}><div className={mainContentClasses}><UserPlus className="h-4 w-4" /><span className="font-semibold">{ageGroupMap[mainProfile.ageGroup]}</span></div><span className={labelClasses}>Tuổi</span></div>
                <div className={badgeClasses}><div className={mainContentClasses}><User className="h-4 w-4" /><span className="font-semibold">{genderMap[mainProfile.gender]}</span></div><span className={labelClasses}>Giới tính</span></div>
                <div className={badgeClasses}><div className={mainContentClasses}><Hourglass className="h-4 w-4" /><span className="font-semibold">{avgTimeSpent} min</span></div><span className={labelClasses}>Avg Time</span></div>
                <div className={badgeClasses}><div className={mainContentClasses}><History className="h-4 w-4" /><span className="font-semibold">{String(mainProfile.visitCount)}</span></div><span className={labelClasses}>Truy cập</span></div>
                <div className={badgeClasses}><div className={mainContentClasses}><Globe className="h-4 w-4" /><span className="font-semibold">{mainProfile.origin}</span></div><span className={labelClasses}>Nguồn gốc</span></div>
                <div className={badgeClasses}><div className={mainContentClasses}><Ruler className="h-4 w-4" /><span className="font-semibold">{mainProfile.height > 0 ? `${mainProfile.height} cm` : 'N/A'}</span></div><span className={labelClasses}>Chiều cao</span></div>
                <div className={badgeClasses}><div className={mainContentClasses}><Smile className="h-4 w-4" /><span className="font-semibold">{lastEmotion}</span></div><span className={labelClasses}>Cảm xúc</span></div>
            </div>

            {/* Visitor Info - ĐÃ SỬA LẠI THEO ĐÚNG THIẾT KẾ */}
            <div className="space-y-3 pt-4 flex-grow flex flex-col">
                <h3 className="font-medium">Thông tin khách hàng</h3>
                <div className="grid grid-cols-4 gap-3">
                    {otherVisitors.map((visitorId) => (
                        <div key={visitorId} className="relative aspect-square rounded-lg bg-black/20 overflow-hidden">
                            <Image src={`/avatars/avatar${(parseInt(visitorId.slice(-2), 16) % 13) + 1}.png`} alt={visitorId} fill className="object-cover opacity-75" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-center mt-4">
                    <div className="relative p-1 rounded-lg bg-white/10" style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)' }}>
                        <div className="w-[110px] h-[110px] rounded-md overflow-hidden">
                            <Image src={mainProfile.realImageUrl || mainAvatarSrc} alt={mainProfile.visitorId} width={110} height={110} className="object-cover" />
                        </div>
                    </div>
                    <span className="mt-2 text-base font-semibold px-6 py-2 rounded-full border border-white/30 bg-yellow-100/20 backdrop-blur-sm text-yellow-300 shadow">
                        {lastEmotion}
                    </span>
                </div>
            </div>
        </div>
    );
}