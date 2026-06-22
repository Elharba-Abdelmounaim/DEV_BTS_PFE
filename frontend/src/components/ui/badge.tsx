import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variant === 'success' && 'bg-green-100 text-green-800',
      variant === 'warning' && 'bg-yellow-100 text-yellow-800',
      variant === 'danger'  && 'bg-red-100 text-red-800',
      variant === 'muted'   && 'bg-muted text-muted-foreground',
      variant === 'default' && 'bg-blue-100 text-blue-800',
      className,
    )} {...props} />
  )
}

export default Badge
