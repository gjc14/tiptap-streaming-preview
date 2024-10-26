import "../styles.scss";

import type { MetaFunction } from "@remix-run/node";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import StreamingPreview from "~/extensions/stream";
import { Button } from "~/extensions/stream/markdown-component";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, StreamingPreview],
    content: `
<p>
This is still the text editor you’re used to, but enriched with node views.
</p>
<p>
Did you see that? That’s a React component. We are really living in the future.
</p>
`,
  });

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-3">
      <div className="flex gap-3">
        <Button
          onClick={() => {
            // Insert using default tiptap
            editor?.commands.insertContent({
              type: "streamingPreview",
              attrs: {
                prompt: "Tell me a joke",
              },
            });
          }}
        >
          Send prompt to extension
        </Button>

        <button
          className="hover:underline"
          onClick={() => {
            // Insert using customed command
            editor?.commands.setStreamingPreview({
              prompt: "Tell me a joke",
            });
          }}
        >
          send
        </button>

        <button
          className="hover:underline"
          onClick={() => {
            if (!editor) return;
            editor?.commands.removeStreamingPreview();
          }}
        >
          remove
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="max-h-[80vh] max-w-3xl h-[80vh] w-full grow p-5 border border-primary rounded-lg overflow-scroll"
      />
    </div>
  );
}
