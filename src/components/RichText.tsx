import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";
import { tp } from "../utils/tp";
import { isString } from "../utils/isString";

interface Props {
  content: TinaMarkdownContent | TinaMarkdownContent[];
}

export const RichText = ({ content }: Props) => {
  return (
    <TinaMarkdown
      content={content}
      components={{
        p: ({ children }) => (
          <p className="mb-4">{isString(children) ? tp(children) : children}</p>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-4 font-alt text-2xl italic">
            {isString(children) ? tp(children) : children}
          </blockquote>
        ),
        a: (props) =>
          props ? (
            <a href={props.url} className="underline hover:no-underline">
              {isString(props.children) ? tp(props.children) : props.children}
            </a>
          ) : (
            ""
          ),
      }}
    />
  );
};
