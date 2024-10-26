# Tiptap Streaming Preview Extension

> A compact demo of streaming `Markdown` from Google AI Gemini and save to Tiptap Extension demo

## Packages

- **Tiptap**
- **React Markdown** - Rendering streaming
- **MarkdownIt** - Render MD to HTML cater to Tiptap
- **AI-SDK** - Streaming functionality
- **Gemini** - Providing MD format response

## Dataflow

1. [Tiptap] Send prompt to Streaming Preview extension
2. [StreamingPreview] Get prompt from attributes (node.attrs.prompt)
3. [StreamingPreview] Call Gemini @ai/api/completions with ai-sdk
4. [StreamingPreview] Rendering completion stream
5. [StreamingPreview] Choosing to discard or save the response
6. [StreamingPreview] Transform data and execute editor's api (commands)
7. [Tiptap] Tiptap get's `HTML` and automatically transform it to visible format

---

# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
