import React from 'react'

export function Checkbox({ id, checked, onCheckedChange, className = '', ...props }) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={`h-4 w-4 rounded border bg-red-500 border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}
