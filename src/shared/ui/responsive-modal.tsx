import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet"
import { cn } from "@/lib/utils"

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("sm:max-w-md", className)}>
          {(title || description) && (
             <DialogHeader className="mb-2">
                 {title && <DialogTitle>{title}</DialogTitle>}
                 {description && <DialogDescription>{description}</DialogDescription>}
             </DialogHeader>
          )}
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={cn(
          "w-full h-full border-none p-0 flex flex-col bg-white overflow-hidden animate-in slide-in-from-right duration-300", 
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/10 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
           <div>
             {title && <SheetTitle className="text-sm font-black uppercase tracking-widest">{title}</SheetTitle>}
             {description && <SheetDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">{description}</SheetDescription>}
           </div>
           <button 
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center text-foreground hover:bg-muted/40 transition-colors"
           >
              <X size={20} strokeWidth={3} />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+3rem)]">
            {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

import { X } from "lucide-react"
