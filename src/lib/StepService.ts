import { GuestStatus } from "@/constants/general";

interface CheckNextStepProps {
    slug: string;
    status: GuestStatus;
}

export function checkNextStep({slug, status}: CheckNextStepProps) {
    switch(status) {
        case "to_be_invited":
            return `/invite/${slug}`;
        case "attending":
            return `/invite/${slug}/accepted/thank-you`;
        case "attending_name_check_pending":
            return `/invite/${slug}/accepted/name-check`;
        case "not_attending_message_pending":
            return `/invite/${slug}/declined/message`;
        case "not_attending":
            return `/invite/${slug}/declined/thank-you`;
        default:
            return false;
    }
}