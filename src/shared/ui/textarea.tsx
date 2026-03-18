import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-input bg-muted/20 px-4 py-3 text-base shadow-sm transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
