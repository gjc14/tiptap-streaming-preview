import { mergeAttributes, Node, Command } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import Component from "./markdown-component";
import MarkdownIt from "markdown-it";

interface StreamingPreviewAttributes {
  prompt: string;
  content?: string;
  status?: "streaming" | "completed" | "saved";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    streamingPreview: {
      setStreamingPreview: (attrs: StreamingPreviewAttributes) => ReturnType;
      saveStreamingPreview: (pos: number, content: string) => ReturnType;
      removeStreamingPreview: () => ReturnType;
      updateStreamingContent: (pos: number, content: string) => ReturnType;
    };
  }
}

export default Node.create<StreamingPreviewAttributes>({
  name: "streamingPreview",

  group: "block",

  atom: true, // Only one streaming preview node can exist in the editor

  addAttributes() {
    return {
      prompt: {
        default: "",
      },
      content: {
        default: "",
      },
      status: {
        default: "streaming",
      },
    };
  },

  addCommands() {
    return {
      setStreamingPreview:
        (attrs: StreamingPreviewAttributes): Command =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const node = this.type.create(attrs);
            tr.replaceSelectionWith(node);
          }
          return true;
        },

      saveStreamingPreview:
        (pos: number, content: string): Command =>
        ({ tr, editor }) => {
          // Get the current streaming preview node
          const node = tr.doc.nodeAt(pos);
          if (!node) return false;

          const md = new MarkdownIt();
          const htmlContent = md.render(content);

          // Chain remove this streaming preview node and insert the converted html content
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + node.nodeSize })
            .insertContent(htmlContent)
            .run();

          return true;
        },

      removeStreamingPreview:
        (): Command =>
        ({ tr, state, dispatch }) => {
          if (dispatch) {
            // Find all streaming preview nodes
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
              }
            });
          }
          return true;
        },

      updateStreamingContent:
        (pos: number, content: string): Command =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const node = tr.doc.nodeAt(pos);
            if (!node) return false;

            tr.setNodeAttribute(pos, "content", content);
            tr.setNodeAttribute(pos, "status", "completed");
          }
          return true;
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: "streaming-preview",
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return {
            prompt: dom.getAttribute("data-prompt"),
            content: dom.getAttribute("data-content"),
            status: dom.getAttribute("data-status"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "streaming-preview",
      mergeAttributes(HTMLAttributes, {
        "data-prompt": HTMLAttributes.prompt,
        "data-content": HTMLAttributes.content,
        "data-status": HTMLAttributes.status,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
