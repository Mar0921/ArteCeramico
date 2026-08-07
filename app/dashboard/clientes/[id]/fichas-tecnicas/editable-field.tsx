"use client"

type Props = {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  editing?: boolean
  className?: string
}

export function EditableField({
  value,
  placeholder,
  onChange,
  editing = true,
  className = "",
}: Props) {
  if (!editing) {
    return (
      <div className={className}>
        {value || (
          <span className="text-neutral-400">{placeholder}</span>
        )}
      </div>
    )
  }

  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded border border-amber-300 bg-amber-50 p-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 ${className}`}
      rows={2}
    />
  )
}
