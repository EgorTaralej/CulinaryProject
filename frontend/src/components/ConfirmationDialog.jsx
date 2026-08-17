import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ConfirmationDialog({ isOpen, onOpenChange, onConfirm, title, description }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 h-auto transition-all">
            Отказ
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="rounded-xl bg-[#f97316] hover:bg-slate-950 text-white font-bold px-6 py-3 h-auto border-none shadow-md transition-all active:scale-95"
          >
            Изтрий
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}