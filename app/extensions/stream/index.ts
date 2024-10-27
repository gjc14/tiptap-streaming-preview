import { Command, mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MarkdownIt from "markdown-it";

import { Provider } from "~/routes/api.ai.completions";
import Component from "./markdown-component";

interface StreamingPreviewAttributes {
  prompt: string;
  provider: Provider;
  content?: string;
  status: "loading" | "idle" | "error";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    streamingPreview: {
      setStreamingPreview: (attrs: StreamingPreviewAttributes) => ReturnType;
      saveStreamingPreview: (content: string) => ReturnType;
      removeStreamingPreview: () => ReturnType;
      updateStreamingContent: (pos: number, content: string) => ReturnType;
    };
  }
}

export default Node.create<StreamingPreviewAttributes>({
  name: "streamingPreview",

  group: "block",

  inline: false,

  draggable: false,

  atom: true,

  addOptions() {
    return {
      prompt: "",
      provider: "gemini-1.5-flash-latest",
      content: "",
      status: "idle",
    };
  },

  addAttributes() {
    return {
      prompt: {
        default: "",
      },
      provider: {
        default: this.options.provider,
      },
      content: {
        default: "",
      },
      status: {
        default: this.options.status,
      },
    };
  },

  addCommands() {
    return {
      setStreamingPreview:
        (attrs): Command =>
        ({ commands, editor }) => {
          const current = editor.$nodes("streamView");
          if (!current || current.length === 0) {
            // No existing stream view nodes
            const node = this.type.create(attrs);
            commands.insertContent({
              type: this.name,
              attrs: attrs,
            });
            return true;
          } else {
            return false;
          }
        },

      updateStreamingContent:
        (pos: number, content: string): Command =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const node = tr.doc.nodeAt(pos);
            if (!node) return false;

            tr.setNodeAttribute(pos, "content", content);
          }
          return true;
        },

      saveStreamingPreview:
        (content: string): Command =>
        ({ tr, commands, state }) => {
          const positions: number[] = [];
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name) {
              positions.push(pos);
            }
          });

          const md = new MarkdownIt();
          console.log("content", content);
          const htmlContent = md.render(content);

          commands.insertContent(htmlContent); // Insert at the current position

          // Delete them in reverse order to maintain positions
          positions.reverse().forEach((pos) => {
            const node = state.doc.nodeAt(pos);
            if (node) {
              tr.delete(pos, pos + node.nodeSize);
            } else {
              console.warn("Node not found at position:", pos);
            }
          });

          return true;
        },

      removeStreamingPreview:
        (): Command =>
        ({ tr, state }) => {
          // Find all stream view nodes
          const positions: number[] = [];
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name) {
              positions.push(pos);
            }
          });

          // Delete them in reverse order to maintain positions
          positions.reverse().forEach((pos) => {
            const node = state.doc.nodeAt(pos);
            if (node) {
              tr.delete(pos, pos + node.nodeSize);
            } else {
              console.warn("Node not found at position:", pos);
            }
          });
          return true;
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: "stream-view",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "streaming-preview",
      mergeAttributes(HTMLAttributes, {
        "data-prompt": HTMLAttributes.prompt,
        "data-provider": HTMLAttributes.provider,
        "data-content": HTMLAttributes.content,
        "data-status": HTMLAttributes.status,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
