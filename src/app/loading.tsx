import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    const skeletonStyles = "bg-gray-300";
    return (
        <Skeleton className={`w-full h-[500px] ${skeletonStyles}`} />
    )
}