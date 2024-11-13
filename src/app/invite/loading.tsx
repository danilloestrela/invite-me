import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    const skeletonStyles = "bg-gray-300";
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
        </div>

    )
}