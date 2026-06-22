interface Props {
  html?: string
  content?: string
  className?: string
}

export function ContentRenderer({ html, content, className = '' }: Props) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html ?? content ?? '' }}
    />
  )
}

export default ContentRenderer
