import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { guestEnum, useGuest, useToast } from '@/hooks';
import { MergedGuest } from '@/lib/GoogleSheetsService';
import { encodeBase64WithSalt } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';

interface CanConfirmForProps {
    guests: MergedGuest[];
    fromGuestId: string;
}

export default function CanConfirmFor({ guests, fromGuestId }: CanConfirmForProps) {
    if (guests.length === 0) return null; // Do not render anything if no guests
    return (
        <section className="flex flex-col gap-2 w-full max-h-[250px] overflow-y-auto">
            {guests.map((guest, index) => (
                <CanConfirmStepper key={index} guest={guest} fromGuestId={fromGuestId} />
            ))}
        </section>
    );
};

interface CanConfirmStepperForms {
    code: string;
    message?: string;
    name: string;
}

type StepType = typeof guestEnum[keyof typeof guestEnum];

interface CanConfirmStepperProps {
    guest: MergedGuest;
    fromGuestId: string;
}

function CanConfirmStepper({ guest, fromGuestId }: CanConfirmStepperProps) {
    const slug = encodeBase64WithSalt(guest.id);
    const { updateGuestMutation, validateCodeMutation } = useGuest(slug, false);
    const formMethods = useForm<CanConfirmStepperForms>({
        defaultValues: { code: '', message: '', name: guest.name },
    });
    const { toast } = useToast();

    const [step, setStep] = useState<StepType>(guest.status);


    const successToast = () => {
        return toast({
            title: 'Sucesso!',
            description: 'Convidado atualizado com sucesso!',
        });
    }

    const handleValidate = async ({ toStep }: { toStep: StepType }) => {
        const isCodeValid = await validateCodeMutation.mutateAsync({ guestId: slug as string, code: formMethods.watch('code') });
        if (formMethods.watch('code').trim() === '' || !isCodeValid) {
            toast({
                title: 'Código do convite inválido',
                description: 'Por favor, digite o código correto do convite.',
            });
            formMethods.setValue('code', '')
            return;
        }
        formMethods.setValue('code', '')
        switch (toStep) {
            case guestEnum.attending_name_check_pending:
                updateGuestMutation.mutate(
                    { slug, fields: [{ from_id: fromGuestId }, { status: guestEnum.attending_name_check_pending }] },
                    {
                        onSuccess: () => {
                            successToast();
                            setStep(guestEnum.attending_name_check_pending);
                        },
                    }
                );
                break;
            case guestEnum.attending:
                updateGuestMutation.mutate(
                    { slug, fields: [{ from_id: fromGuestId }, { name: formMethods.watch('name') }, { status: guestEnum.attending }] },
                    {
                        onSuccess: () => {
                            successToast();
                            setStep(guestEnum.attending);
                        },
                    }
                );
                break;
            case guestEnum.not_attending_message_pending:
                updateGuestMutation.mutate(
                    { slug, fields: [{ from_id: fromGuestId }, { message: formMethods.watch('message') }, { status: guestEnum.not_attending_message_pending }] },
                    {
                        onSuccess: () => {
                            successToast();
                            setStep(guestEnum.not_attending_message_pending);
                        },
                    }
                );
                break;
            case guestEnum.not_attending:
                updateGuestMutation.mutate(
                    { slug, fields: [{ from_id: fromGuestId }, { message: formMethods.watch('message') }, { status: guestEnum.not_attending }] },
                    {
                        onSuccess: () => {
                            successToast();
                            setStep(guestEnum.not_attending);
                        },
                    }
                );
                break;
        }
    }

    const stepProps = {
        onAction: handleValidate,
        formMethods,
    }

    if (updateGuestMutation.isPending) return (
        <div className="bg-white p-4 rounded-lg">
            <Skeleton className="w-full h-10" />
        </div>
    )
    return (
        <div className="bg-white p-4 rounded-lg">
            <FormProvider {...formMethods}>
                {step === guestEnum.attending && <div>{formMethods.watch('name')}: <span className="text-green-500 bg-green-100 rounded-md px-2 py-1">Irá a festa! 😄</span></div>}
                {step === guestEnum.to_be_invited && (
                    <StepConfirmDecline {...stepProps} toStep={[guestEnum.attending_name_check_pending!, guestEnum.not_attending_message_pending!]} />
                )}
                {step === guestEnum.attending_name_check_pending && (
                    <StepConfirmName {...stepProps} toStep={guestEnum.attending!} />
                )}
                {step === guestEnum.not_attending_message_pending && (
                    <StepConfirmMessage {...stepProps} toStep={guestEnum.not_attending!} />
                )}
                {step === guestEnum.not_attending && <div>{formMethods.watch('name')} <span className="text-red-500 bg-red-100 rounded-md px-2 py-1">Não irá comparecer 😔</span></div>}
            </FormProvider>
        </div>
    );
}

interface StepsProps {
    toStep: StepType
    onAction: ({ toStep }: { toStep: StepType }) => void
    formMethods: UseFormReturn<CanConfirmStepperForms>
}

interface StepConfirmDeclineProps {
    toStep: StepType[]
    onAction: ({ toStep }: { toStep: StepType }) => void
    formMethods: UseFormReturn<CanConfirmStepperForms>
}

const StepConfirmDecline = ({ toStep, onAction, formMethods }: StepConfirmDeclineProps) => {

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        formMethods.setValue('code', e.target.value.toUpperCase())
    }

    return (
        <div className="flex flex-row justify-between">
            <span className="text-base">{formMethods.watch('name')}</span>
            <div className="flex flex-row w-fit">
                <ConfirmationDialog
                    title="Confira o nome. Está correto?"
                    description={
                        <>
                            Você está confirmando para: <span className="font-bold">{formMethods.watch('name')}</span>
                            <br />
                            <br />
                            <span className="text-sm text-gray-500">
                                Digite o código do convite para confirmar:
                            </span>
                            <Input
                                type="text"
                                className="border-0 focus-visible:ring-0"
                                placeholder="XXXX"
                                value={formMethods.watch('code')}
                                onChange={handleCodeChange}
                            />
                        </>
                    }
                    confirmLabel="Tudo certo, pode confirmar!"
                    onConfirm={() => { onAction({ toStep: toStep[0] as StepType }) }}
                    onCancel={() => { formMethods.setValue('code', '') }}
                >
                    <Button variant="ghost" size="sm">
                        <Check className="icon" />
                    </Button>
                </ConfirmationDialog>
                <ConfirmationDialog
                    title={`${formMethods.watch('name')} não poderá ir?`}
                    description={
                        <>
                            <span className="text-sm text-gray-500">
                                Você quer confirmar que {formMethods.watch('name')} não poderá ir. Digite o código do convite:
                            </span>
                            <Input
                                type="text"
                                className="border-0 focus-visible:ring-0"
                                placeholder="XXXX"
                                value={formMethods.watch('code')}
                                onChange={handleCodeChange}
                            />
                        </>
                    }
                    confirmLabel="Tudo certo, pode negar!"
                    onConfirm={() => onAction({ toStep: toStep[1] as StepType })}
                    onCancel={() => { formMethods.setValue('code', '') }}
                >
                    <Button variant="ghost" size="sm">
                        <X className="icon" />
                    </Button>
                </ConfirmationDialog>
            </div>
        </div>
    );
}


const StepConfirmName = ({ toStep, onAction, formMethods }: StepsProps) => {
    const name = formMethods.watch('name')
    return (
        <div>
            <FormItem>
                <h2 className="text-lg font-bold">Agora confirme o nome</h2>
                <p className="text-sm text-gray-500">Nome: {name}</p>
                <FormControl>
                    <Input type="text" value={name} onChange={(e) => formMethods.setValue('name', e.target.value)} />
                </FormControl>
                <FormDescription>Confirme o nome como está no convite.</FormDescription>
                <FormMessage />
            </FormItem>
            <ConfirmationDialog
                title="O nome está realmente correto?"
                description={
                    <>
                        <span className="text-sm text-gray-500">
                            Confira: <span className="font-bold">{formMethods.watch('name')}</span>
                        </span>
                        <Input
                            type="text"
                            className="border-0 focus-visible:ring-0"
                            placeholder="XXXX"
                            value={formMethods.watch('code')}
                            onChange={(e) => formMethods.setValue('code', e.target.value.toUpperCase())}
                        />
                    </>
                }
                confirmLabel="Confirmar"
                onConfirm={() => onAction({ toStep })}
            >
                <Button>Confirmar</Button>
            </ConfirmationDialog>
        </div>
    );
}


const StepConfirmMessage = ({ toStep, onAction, formMethods }: StepsProps) => {
    return (
        <div className="flex flex-col gap-2">
            <p> Deseja deixar alguma mensagem/justificativa de {formMethods.watch('name').split(' ')[0]}?</p>
            <Textarea
                value={formMethods.watch('message')}
                onChange={(e) => formMethods.setValue('message', e.target.value)}
            />
            <div className="flex flex-row gap-2">
                <ConfirmationDialog
                    title="Confirme a mensagem"
                    description={<>
                        <span className="text-sm text-gray-500">
                            Confira a mensagem: <span className="font-bold">{formMethods.watch('message')}</span>
                        </span>
                        <Input
                            type="text"
                            className="border-0 focus-visible:ring-0"
                            placeholder="XXXX"
                            value={formMethods.watch('code')}
                            onChange={(e) => formMethods.setValue('code', e.target.value.toUpperCase())}
                        />
                    </>}
                    confirmLabel="Confirmar"
                    onConfirm={() => onAction({ toStep })}
                >
                    <Button>Enviar mensagem</Button>
                </ConfirmationDialog>
                <ConfirmationDialog
                    title="Confirmar sem mensagem/justificativa"
                    description={<>
                        <span className="text-sm text-gray-500">
                            Para confirmar digite o código do convite:
                        </span>
                        <Input
                            type="text"
                            className="border-0 focus-visible:ring-0"
                            placeholder="XXXX"
                            value={formMethods.watch('code')}
                            onChange={(e) => formMethods.setValue('code', e.target.value.toUpperCase())}
                        />
                    </>}
                    confirmLabel="Confirmar"
                    onConfirm={() => onAction({ toStep })}
                >
                    <Button variant="outline">Não, obrigado</Button>
                </ConfirmationDialog>
            </div>
        </div>
    )
}