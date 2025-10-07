import { TinaMarkdown, type TinaMarkdownContent } from 'tinacms/dist/rich-text'

import { isString } from '../utils/isString'
import { tp } from '../utils/tp'

interface Props {
  content: TinaMarkdownContent | TinaMarkdownContent[]
}

export const RichText = ({ content }: Props) => {
  return (
    <TinaMarkdown
      content={content}
      components={{
        // @ts-expect-error tina is no well typed
        p: ({ children }) => (
          <p className="mb-4">{isString(children) ? tp(children) : children}</p>
        ),
        // @ts-expect-error tina is no well typed
        blockquote: ({ children }) => (
          <blockquote className="mb-4 font-alt text-2xl italic">
            {isString(children) ? tp(children) : children}
          </blockquote>
        ),
        // tina is not well typed
        a: (props: { url: string; children?: string } | undefined) =>
          props ? (
            <a href={props.url} className="underline hover:no-underline">
              {isString(props.children) ? tp(props.children) : props.children}
            </a>
          ) : (
            ''
          ),
      }}
    />
  )
}
