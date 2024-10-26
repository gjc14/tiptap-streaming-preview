import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useCompletion } from "ai/react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default (props: NodeViewProps) => {
  const { node, editor, getPos } = props;
  const prompt = node.attrs.prompt;
  const { completion, complete } = useCompletion({
    api: "/api/ai/completions",
    body: {
      provider: "gemini-1.5-flash-latest",
    },
  });

  const [completionState, setCompletionState] = useState("Heyoooo");

  useEffect(() => {
    if (!prompt) return;
    console.log("Prompt:", prompt);
    complete(prompt);
  }, []);

  useEffect(() => {
    if (!completion) return;
    console.log("Completion:", completion);

    const pos = getPos();
    // Update the node's content attribute as streaming happens
    editor.commands.updateStreamingContent(pos, completion);
    setCompletionState(completion);
  }, [completion]);

  const handleSave = () => {
    if (!editor || typeof getPos !== "function") {
      console.error("Editor or getPos not available");
      return;
    }

    const pos = getPos();
    // Save the streaming content as regular text
    editor.commands.saveStreamingPreview(pos, completionState);

    // const pos = getPos();
    // console.log("Current position:", pos);
    // console.log("Editor state before save:", editor.getJSON());

    // try {
    //   editor
    //     .chain()
    //     .focus()
    //     .deleteRange({ from: pos, to: pos + node.nodeSize })
    //     .insertContent({
    //       type: "paragraph",
    //       content: [
    //         {
    //           type: "text",
    //           text: completionState,
    //         },
    //       ],
    //     })
    //     .run();

    //   console.log("Editor state after save:", editor.getJSON());
    // } catch (error) {
    //   console.error("Error during save:", error);
    // }
  };

  const handleDiscard = () => {
    if (!editor) {
      console.error("Editor or getPos not available");
      return;
    }

    editor.commands.removeStreamingPreview();

    // const pos = getPos();
    // console.log("Current position:", pos);
    // console.log("Node type:", node.type.name);
    // console.log("Editor state before discard:", editor.getJSON());

    // try {
    //   // Try multiple approaches to delete the node
    //   const deleted = editor
    //     .chain()
    //     .focus()
    //     // First attempt: using deleteNode command
    //     .command(({ tr, commands }) => {
    //       console.log("Attempting to delete node at position:", pos);
    //       if (tr.doc.nodeAt(pos)) {
    //         tr.delete(pos, pos + node.nodeSize);
    //         return true;
    //       }
    //       return false;
    //     })
    //     .run();

    //   console.log("Deletion successful:", deleted);
    //   console.log("Editor state after discard:", editor.getJSON());
    // } catch (error) {
    //   console.error("Error during discard:", error);
    // }
  };

  return (
    <NodeViewWrapper className="streaming-preview">
      <div className="relative p-4 border rounded-lg">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className={"text-muted-foreground"}
        >
          {completionState}
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
