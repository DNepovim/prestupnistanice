import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";

interface Props {
  content: TinaMarkdownContent | TinaMarkdownContent[];
}

export const RichText = ({ content }: Props) => {
  return (
    <TinaMarkdown
      content={content}
      components={{
        p: (props) => <p className="mb-4" {...props} />,
        a: (props) => <a href={props.url} className="underline hover:no-underline" {...props} />,
      }}
    />
  );
};
