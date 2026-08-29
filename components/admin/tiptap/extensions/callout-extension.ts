import { Node, mergeAttributes } from "@tiptap/core"

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout node
       */
      setCallout: (attributes?: { icon?: string; color?: string }) => ReturnType
      /**
       * Toggle a callout node
       */
      toggleCallout: (attributes?: { icon?: string; color?: string }) => ReturnType
      /**
       * Unset a callout node
       */
      unsetCallout: () => ReturnType
    }
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      icon: {
        default: "💡",
        parseHTML: (element) => element.getAttribute("data-icon") || "💡",
        renderHTML: (attributes) => ({
          "data-icon": attributes.icon,
        }),
      },
      color: {
        default: "default",
        parseHTML: (element) => element.getAttribute("data-color") || "default",
        renderHTML: (attributes) => ({
          "data-color": attributes.color,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const icon = node.attrs.icon || "💡"
    const color = node.attrs.color || "default"

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "callout",
        "data-color": color,
        class: `notion-callout notion-callout-${color}`,
      }),
      [
        "div",
        { class: "notion-callout-icon-wrapper", contenteditable: "false" },
        ["span", { class: "notion-callout-icon" }, icon],
      ],
      ["div", { class: "notion-callout-content" }, 0],
    ]
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes)
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes)
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        },
    }
  },
})
