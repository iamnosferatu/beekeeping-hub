// frontend/src/components/editor/MarkdownEditor.js
import React, { useState, useEffect, useRef } from "react";
import { Button, ButtonGroup, Spinner } from "react-bootstrap";
import {
  BsTypeBold,
  BsTypeItalic,
  BsCode,
  BsListUl,
  BsListOl,
  BsLink45Deg,
  BsImage,
  BsBlockquoteLeft,
  BsTypeH1,
  BsTypeH2,
  BsTypeH3,
  BsLayoutSplit,
  BsQuestionCircle,
} from "react-icons/bs";
import "./MarkdownEditor.scss";

const MarkdownEditor = ({ value, onChange, height = "400px" }) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Update internal value when prop changes
    setEditorValue(value || "");
  }, [value]);

  useEffect(() => {
    // Simulate loading delay (would be replaced with actual editor initialization)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setEditorValue(newValue);
    onChange && onChange(newValue);
  };

  // Helper to get cursor position
  const getCursorPosition = () => {
    const textarea = textareaRef.current;
    return textarea
      ? {
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
        }
      : null;
  };

  // Helper to set cursor position
  const setCursorPosition = (start, end) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    }
  };

  // Helper to insert text at cursor
  const insertAtCursor = (before, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Get current state
    const cursorPos = getCursorPosition();
    const text = editorValue;
    const selectedText =
      text.substring(cursorPos.start, cursorPos.end) || placeholder;

    // Build new text
    const newText =
      text.substring(0, cursorPos.start) +
      before +
      selectedText +
      after +
      text.substring(cursorPos.end);

    // Update editor value
    setEditorValue(newText);
    onChange && onChange(newText);

    // Set new cursor position
    const newCursorPos = cursorPos.start + before.length + selectedText.length;

    // Focus and set cursor position after state update
    setTimeout(() => {
      setCursorPosition(
        placeholder ? cursorPos.start + before.length : newCursorPos,
        placeholder
          ? cursorPos.start + before.length + placeholder.length
          : newCursorPos
      );
    }, 0);
  };

  // Toolbar actions
  const addBold = () => insertAtCursor("**", "**", "strong text");
  const addItalic = () => insertAtCursor("*", "*", "emphasized text");
  const addCode = () => insertAtCursor("`", "`", "code");
  const addCodeBlock = () => insertAtCursor("```\n", "\n```", "code block");
  const addH1 = () => insertAtCursor("# ", "", "Heading 1");
  const addH2 = () => insertAtCursor("## ", "", "Heading 2");
  const addH3 = () => insertAtCursor("### ", "", "Heading 3");
  const addUl = () => insertAtCursor("- ", "", "List item");
  const addOl = () => insertAtCursor("1. ", "", "List item");
  const addLink = () =>
    insertAtCursor("[", "](https://example.com)", "link text");
  const addImage = () =>
    insertAtCursor(
      "![",
      '](https://example.com/image.jpg "Image title")',
      "alt text"
    );
  const addQuote = () => insertAtCursor("> ", "", "Blockquote");

  // Add markdown help reference
  const addHelpText = () => {
    const helpText = `
# Markdown Quick Reference

## Headers
# Heading 1
## Heading 2
### Heading 3

## Emphasis
*italic* or _italic_
**bold** or __bold__
~~strikethrough~~

## Lists
- Unordered item
- Another item
  - Nested item

1. Ordered item
2. Another ordered item

## Links
[Link text](https://example.com)

## Images
![Alt text](https://example.com/image.jpg "Optional title")

## Code
Inline \`code\` with backticks
\`\`\`
// Code block
function hello() {
  console.log('Hello world!');
}
\`\`\`

## Blockquotes
> This is a blockquote

## Horizontal Rule
---

## Tables
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;

    setEditorValue(editorValue ? `${editorValue}\n\n${helpText}` : helpText);
    onChange &&
      onChange(editorValue ? `${editorValue}\n\n${helpText}` : helpText);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5" style={{ height }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="markdown-editor">
      {/* Toolbar */}
      <div className="editor-toolbar p-1 mb-2 border rounded bg-light">
        <ButtonGroup className="me-2 mb-1">
          <Button variant="light" onClick={addH1} title="Heading 1">
            <BsTypeH1 />
          </Button>
          <Button variant="light" onClick={addH2} title="Heading 2">
            <BsTypeH2 />
          </Button>
          <Button variant="light" onClick={addH3} title="Heading 3">
            <BsTypeH3 />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="me-2 mb-1">
          <Button variant="light" onClick={addBold} title="Bold">
            <BsTypeBold />
          </Button>
          <Button variant="light" onClick={addItalic} title="Italic">
            <BsTypeItalic />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="me-2 mb-1">
          <Button variant="light" onClick={addUl} title="Unordered List">
            <BsListUl />
          </Button>
          <Button variant="light" onClick={addOl} title="Ordered List">
            <BsListOl />
          </Button>
          <Button variant="light" onClick={addQuote} title="Blockquote">
            <BsBlockquoteLeft />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="me-2 mb-1">
          <Button variant="light" onClick={addLink} title="Link">
            <BsLink45Deg />
          </Button>
          <Button variant="light" onClick={addImage} title="Image">
            <BsImage />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="me-2 mb-1">
          <Button variant="light" onClick={addCode} title="Inline Code">
            <BsCode />
          </Button>
          <Button variant="light" onClick={addCodeBlock} title="Code Block">
            <BsLayoutSplit />
          </Button>
        </ButtonGroup>

        <Button
          variant="light"
          className="mb-1"
          onClick={addHelpText}
          title="Markdown Help"
        >
          <BsQuestionCircle />
        </Button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        className="form-control markdown-textarea"
        value={editorValue}
        onChange={handleChange}
        style={{ height, minHeight: "300px" }}
        placeholder="Write your article content here using Markdown..."
      />
    </div>
  );
};

export default MarkdownEditor;
