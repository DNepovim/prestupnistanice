import MarkdownEditor, { commands } from '@uiw/react-md-editor'
import { wrapFieldsWithMeta } from 'tinacms'

export const MarkdownInput = wrapFieldsWithMeta<string>(({ input }) => {
  return (
    <div data-color-mode="light">
      <div className="wmde-markdown-var"> </div>

      <MarkdownEditor
        value={input.value ?? ''}
        preview="edit"
        height="100%"
        visibleDragbar={false}
        
        commands={[
          commands.heading,
          commands.bold,
          commands.italic,
          commands.link,
          commands.quote,
        ]}
        onChange={(val) => {
          input.onChange(val ?? '')
        }}
      />
    </div>
  )
})
