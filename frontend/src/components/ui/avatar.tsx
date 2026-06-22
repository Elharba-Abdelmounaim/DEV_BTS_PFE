import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: number
}

export function Avatar({ src, alt, name, size = 40, className, ...props }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {src
        ? <img src={src} alt={alt ?? name ?? ''} className="h-full w-full object-cover" />
        : <span style={{ fontSize: size * 0.38 }} className="font-medium text-muted-foreground">{initials}</span>
      }
    </div>
  )
}

export default Avatar
