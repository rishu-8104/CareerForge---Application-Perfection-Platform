import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-button hover:-translate-y-1 active:translate-y-0 transition-transform",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-1 active:translate-y-0 transition-transform",
        outline:
          "border border-input hover:bg-accent/10 hover:text-accent hover:-translate-y-1 active:translate-y-0 transition-transform",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:-translate-y-1 active:translate-y-0 transition-transform",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 hover:-translate-y-1 active:translate-y-0 transition-transform",
        ghost: "hover:bg-accent/10 hover:text-accent hover:-translate-y-1 active:translate-y-0 transition-transform",
        link: "underline-offset-4 hover:underline text-primary",
        gradient:
          "bg-primary-gradient text-white hover:opacity-90 shadow-button hover:-translate-y-1 active:translate-y-0 transition-transform",
        "gradient-secondary":
          "bg-secondary-gradient text-white hover:opacity-90 shadow-button hover:-translate-y-1 active:translate-y-0 transition-transform",
        "gradient-accent":
          "bg-accent-gradient text-white hover:opacity-90 shadow-button hover:-translate-y-1 active:translate-y-0 transition-transform",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md text-base",
        xl: "h-12 px-10 rounded-lg text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

