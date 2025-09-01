"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  placeholder?: string
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  value: '',
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
})

const Select: React.FC<{
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  required?: boolean
}> = ({ value = '', onValueChange = () => {}, children, required }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange: setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400",
          className
        )}
        onClick={() => onOpenChange(!open)}
        {...props}
      >
        <span className="truncate">
          {children || <span className="text-gray-500">{placeholder}</span>}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC<{ 
  placeholder?: string 
  children?: React.ReactNode 
}> = ({ placeholder, children }) => {
  const { value } = React.useContext(SelectContext)
  return <>{children || value || placeholder}</>
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SelectContext)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && typeof ref === 'object' && ref.current && !ref.current.contains(event.target as Node)) {
          onOpenChange(false)
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open, onOpenChange, ref])

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50",
          "top-full mt-1 w-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { onValueChange, onOpenChange } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-gray-800 dark:focus:bg-gray-800",
          className
        )}
        onClick={() => {
          onValueChange(value)
          onOpenChange(false)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SelectItem.displayName = "SelectItem"

const SelectLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100", className)}
    {...props}
  />
)
SelectLabel.displayName = "SelectLabel"

const SelectSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)} {...props} />
)
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
}