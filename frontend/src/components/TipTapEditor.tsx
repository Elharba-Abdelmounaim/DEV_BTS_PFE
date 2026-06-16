import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import styles from './TipTapEditor.module.css'

const lowlight = createLowlight(common)

interface Props {
  initialContent: Record<string, unknown> | null
  onChange:       (json: Record<string, unknown>, html: string) => void
  placeholder?:   string
}

/*
 * Installation (run once):
 *   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
 *               @tiptap/extension-image @tiptap/extension-code-block-lowlight
 *               lowlight
 */

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`${styles.toolbarBtn} ${active ? styles.toolbarBtnActive : ''}`}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

export default function TipTapEditor({ initialContent, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,   // use CodeBlockLowlight instead
      }),
      Link.configure({ openOnClick: false }),
      Image,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialContent ?? '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>, editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  })

  // Update when external initialContent changes (edit mode)
  useEffect(() => {
    if (editor && initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent)
    }
  }, [initialContent])

  if (!editor) return <div className={styles.loading}>Loading editor…</div>

  const setLink = () => {
    const url = window.prompt('Enter URL')
    if (!url) return editor.chain().focus().unsetLink().run()
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')} title="Inline code">
            {'</>'}
          </ToolbarButton>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })} title="Heading 2">
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })} title="Heading 3">
            H3
          </ToolbarButton>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')} title="Bullet list">
            ≡
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')} title="Numbered list">
            1.
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')} title="Quote">
            "
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')} title="Code block">
            {'{ }'}
          </ToolbarButton>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert link">
            🔗
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Image URL')
              if (url) editor.chain().focus().setImage({ src: url }).run()
            }}
            title="Insert image">
            🖼
          </ToolbarButton>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()} title="Undo">
            ↩
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()} title="Redo">
            ↪
          </ToolbarButton>
        </div>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
