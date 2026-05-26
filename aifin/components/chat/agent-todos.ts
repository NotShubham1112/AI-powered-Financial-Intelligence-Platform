export type AgentTodo = {
  id: string
  title: string
  status: "not-started" | "in-progress" | "completed"
}

export const AGENT_TODOS: AgentTodo[] = [
  { id: "1", title: "Add todo plan", status: "completed" },
  { id: "2", title: "Create TodoDropdown component", status: "completed" },
  { id: "3", title: "Integrate TodoDropdown into `ChatInput` and add active status dot", status: "completed" },
  { id: "4", title: "Replace `MarkdownRenderer` with react-markdown + remark-gfm and shadcn typography classes", status: "completed" },
  { id: "5", title: "Test UI and ensure responsive layout", status: "in-progress" },
]

export default AGENT_TODOS
