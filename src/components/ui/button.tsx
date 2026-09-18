import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090D] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.25)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)]",
        destructive:
          "bg-red-500/90 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
        cool:
          "bg-gradient-to-t from-sky-600 to-cyan-500 text-slate-950 font-semibold border border-cyan-300/40 shadow-md shadow-cyan-500/20 hover:brightness-110 active:brightness-95",
        outline:
          "border border-white/15 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08] hover:text-white hover:border-white/25 backdrop-blur-md",
        secondary:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-white/5",
        ghost:
          "text-slate-300 hover:bg-white/[0.08] hover:text-white",
        glass:
          "bg-white/[0.06] text-white border border-white/15 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/[0.12] hover:border-white/25",
        link:
          "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-7 text-sm font-semibold",
        xl: "h-12 rounded-xl px-8 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
