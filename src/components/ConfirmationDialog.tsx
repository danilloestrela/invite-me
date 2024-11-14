import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";

  export interface ConfirmationDialogProps {
    children: React.ReactNode;
    title?: string;
    description?: string | React.ReactNode;
    cancelLabel?: string;
    confirmLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  export function ConfirmationDialog({ children, title, description, cancelLabel, confirmLabel, onConfirm, onCancel }: ConfirmationDialogProps) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title || 'Deseja continuar?'} </AlertDialogTitle>
            {description && <AlertDialogDescription>
              {description}
            </AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>{cancelLabel || 'Cancelar'}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>{confirmLabel || 'Sim'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  );
};
