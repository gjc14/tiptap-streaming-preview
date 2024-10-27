import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useCompletion } from "ai/react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default (props: NodeViewProps) => {
  const { node, editor, getPos } = props;
  const prompt = node.attrs.prompt;

  // AI
  const { completion, complete } = useCompletion({
    api: "/api/ai/completions",
    body: {
      provider: "gemini-1.5-flash-latest",
    },
  });

  useEffect(() => {
    if (!prompt) return;
    console.log("Prompt:", prompt);
    complete(prompt);
  }, []);

  useEffect(() => {
    if (!completion) return;

    const pos = getPos();

    // Update the node's content attribute as streaming happens
    editor.commands.updateStreamingContent(pos, completion);
  }, [completion]);

  const handleSave = () => {
    if (!editor) return;

    // Save the streaming content as regular text
    editor.commands.saveStreamingPreview(completion);
  };

  const handleDiscard = () => {
    if (!editor) return;

    // Remove the streaming preview node
    editor.commands.removeStreamingPreview();
  };

  return (
    <NodeViewWrapper className="relative p-4 border rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className={"text-muted-foreground"}
      >
        {completion}
      </ReactMarkdown>

      <div className="w-full flex justify-end gap-2 mt-4">
        <Button
          onClick={() => {
            console.log("Discard button clicked");
            handleDiscard();
          }}
        >
          Discard result
        </Button>
        <Button
          onClick={() => {
            console.log("Save button clicked");
            handleSave();
          }}
        >
          Save response
        </Button>
      </div>
    </NodeViewWrapper>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <button
      className="px-3 py-1.5 bg-violet-400 dark:bg-violet-600 rounded-xl border hover:bg-violet-500 dark:hover:bg-violet-700 focus-visible:ring-0 focus-visible:ring-purple-300 dark:focus-visible:ring-purple-200"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
