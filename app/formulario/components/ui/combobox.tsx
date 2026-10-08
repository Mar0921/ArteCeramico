"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  allowCustom?: boolean
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Selecciona...",
  disabled = false,
  className,
  allowCustom = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [filter, setFilter] = React.useState("")
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const optionClickedRef = React.useRef(false)
  const filterRef = React.useRef(filter)
  filterRef.current = filter

  const filteredOptions = React.useMemo(() => {
    if (!filter) return options
    const lowerFilter = filter.toLowerCase()
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerFilter) ||
      opt.value.toLowerCase().includes(lowerFilter)
    )
  }, [options, filter])

  const handleSelect = (optionValue: string) => {
    optionClickedRef.current = true
    onChange(optionValue)
    setOpen(false)
    setFilter("")
    // Reset flag after state updates
    setTimeout(() => { optionClickedRef.current = false }, 0)
  }

  const handleCustomInput = () => {
    if (allowCustom && filterRef.current.trim()) {
      onChange(filterRef.current.trim())
      setOpen(false)
      setFilter("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
      setFilter("")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setFilter(newValue)
    if (!open) setOpen(true)
  }

  const handleBlur = () => {
    setTimeout(() => {
      const currentFilter = filterRef.current
      // Don't create custom value if an option was just clicked
      if (optionClickedRef.current) {
        optionClickedRef.current = false
        return
      }
      // Also don't create custom value if filter exactly matches an existing option
      const exactMatch = options.find((o) => o.value === currentFilter.trim())
      if (!exactMatch && allowCustom && currentFilter.trim() && !options.some((o) => o.value === currentFilter.trim())) {
        handleCustomInput()
      } else if (!open) {
        setFilter("")
      }
    }, 200)
  }

  const handleOptionMouseDown = () => {
    optionClickedRef.current = true
  }

  // Find the selected option label for display
  const selectedOption = options.find((o) => o.value === value)
  const displayValue = selectedOption ? selectedOption.label : value

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate flex-1">
            {displayValue || <span className="text-muted-foreground">{placeholder}</span>}
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 w-full min-w-[8rem] max-h-96 rounded-md border bg-popover p-1 shadow-md",
            !open && "hidden"
          )}
          align="start"
          sideOffset={5}
        >
          <div className="relative">
            <input
              type="text"
              value={filter}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={() => setOpen(true)}
              placeholder="Buscar o escribir..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={disabled}
              autoComplete="off"
            />
          </div>
          <PopoverPrimitive.Arrow className="fill-popover" />
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  onMouseDown={handleOptionMouseDown}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value === option.value
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <svg
                      className="size-4 shrink-0 text-current"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              allowCustom && filter.trim() && (
                <button
                  type="button"
                  onClick={handleCustomInput}
                  onMouseDown={handleOptionMouseDown}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Crear: "{filter}"</span>
                </button>
              )
            )}
            {filteredOptions.length === 0 && !filter && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Sin opciones disponibles
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}