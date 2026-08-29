import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toggleBlock: {
      /**
       * Set a toggle block
       */
      setToggleBlock: () => ReturnType
      /**
       * Toggle a toggle block
       */
      toggleToggleBlock: () => ReturnType
    }
  }
}

export const ToggleBlock = Node.create({
  name: "toggleBlock",

  group: "block",

  content: "toggleSummary toggleContent",

  defining: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute("open") || element.getAttribute("data-open") === "true",
        renderHTML: (attributes) => {
          if (attributes.open) {
            return { open: "true", "data-open": "true" }
          }
          return { "data-open": "false" }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'details[data-type="toggle-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(HTMLAttributes, {
        "data-type": "toggle-block",
        class: "notion-toggle",
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setToggleBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { open: true },
            content: [
              {
                type: "toggleSummary",
                content: [{ type: "text", text: "Desplegable" }],
              },
              {
                type: "toggleContent",
                content: [{ type: "paragraph" }],
              },
            ],
          })
        },
      toggleToggleBlock:
        () =>
        ({ commands }) => {
          return commands.setToggleBlock()
        },
    }
  },
})

export const ToggleSummary = Node.create({
  name: "toggleSummary",

  group: "block",

  content: "inline*",

  defining: true,

  parseHTML() {
    return [
      {
        tag: "summary",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "summary",
      mergeAttributes(HTMLAttributes, {
        class: "notion-toggle-summary cursor-pointer select-none font-medium py-1",
      }),
      0,
    ]
  },
})

export const ToggleContent = Node.create({
  name: "toggleContent",

  group: "block",

  content: "block+",

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="toggle-content"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "toggle-content",
        class: "notion-toggle-content pl-6 pt-1 border-l-2 border-border/40 ml-2",
      }),
      0,
    ]
  },
})
