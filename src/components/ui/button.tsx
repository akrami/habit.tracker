import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border shadow-sm disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 focus:ring-blue-500",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 focus:ring-red-500",
        outline: "border-gray-200 text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800",
        secondary: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:bg-gray-600",
        ghost: "border-transparent text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700",
        link: "border-transparent text-blue-600 hover:text-blue-800 focus:text-blue-800 underline-offset-4 hover:underline focus:underline dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400",
      },
      size: {
        default: "py-3 px-4 text-sm",
        sm: "py-2 px-3 text-xs",
        lg: "py-3 px-4 text-base",
        icon: "size-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }