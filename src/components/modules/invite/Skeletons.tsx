import { Skeleton } from "@/components/ui/skeleton";

const skeletonStyles = "bg-gray-300";

export function InviteSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className={`w-full h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-48 ${skeletonStyles}`} />
            <div className="flex flex-col gap-4 items-center">
                <Skeleton className={`w-96 h-8 ${skeletonStyles}`} />
                <div className="flex gap-4 justify-center items-center">
                    <Skeleton className={`w-36 h-8 ${skeletonStyles}`} />
                    <Skeleton className={`w-36 h-8 ${skeletonStyles}`} />
                </div>
            </div>
        </div>
    );
}

export function NameCheckSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-60 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-96 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
        </div>
    );
}

export function AcceptedThankYouSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
        </div>
    );
}

export function DeclinedMessageSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-60 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-96 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
        </div>
    );
}

export function DeclinedThankYouSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
            <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
        </div>
    );
}