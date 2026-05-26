# Institutional Artifact Platform - Architecture Guide

> **Stage: Component Rendering → Structured Artifact Platform**
>
> You've moved from raw AI chat to professional research UI with type-safe component rendering.

---

## 🏗️ What You Now Have

### 1. **Semantic Artifact Schema (Zod-validated)**

File: [components/research/schemas.ts](components/research/schemas.ts)

- `ResearchArtifact` - Type-safe JSON structure for AI-generated research
- `ContentBlock` - Heading, paragraph, list, blockquote, code, emphasis
- `Chart` - Revenue, margin, market-share, line, bar, pie
- `Table` - Tabular data with columns/rows
- `Metric` - Key performance indicators
- `Section` - Custom content areas

**Key Principle:**
```
LLM generates → semantic JSON
ArtifactRenderer validates → React components
```

### 2. **Component Registry (Type-Safe & Safe)**

File: [components/research/component-registry.ts](components/research/component-registry.ts)

```typescript
export const COMPONENT_REGISTRY = {
  executive_summary: "ExecutiveSummary",
  metrics: "FinancialMetrics",
  revenue_chart: "RevenueChart",
  // ... etc
}

export function getSafeComponent(name: string): React.ComponentType<any> | null
export function isComponentSafe(name: string): boolean
```

**Why This Matters:**
- Prevents arbitrary JSX generation
- All components explicitly registered
- LLM can only reference known components
- Consistent, professional UX guaranteed

### 3. **MCP Service Layer**

File: [components/research/mcp-service.tsx](components/research/mcp-service.tsx)

Core flow:
```typescript
validateArtifact(rawData)           // Schema validation
→ mapArtifactToComponents(artifact) // Convert to React
→ RenderedComponent[]               // Ready to render
```

**Component Ordering (Automatic):**
1. Executive Summary (highest priority)
2. Key Metrics
3. Charts (in order)
4. Sections (custom content)
5. Tables

### 4. **Semantic Typography System**

File: [components/research/typography.tsx](components/research/typography.tsx)

```typescript
<TypographyH1>Research Title</TypographyH1>
<TypographyH2>Section Header</TypographyH2>
<TypographyP>Body paragraph with semantic meaning</TypographyP>
<TypographyList items={["Item 1", "Item 2"]} />
<TypographyBlockquote>Key insight</TypographyBlockquote>
<TypographyStrong>Important text</TypographyStrong>
<TypographyCode>code snippet</TypographyCode>
```

### 5. **Artifact Renderer**

File: [components/research/artifact-renderer.tsx](components/research/artifact-renderer.tsx)

Entry point for all research output:

```typescript
<ArtifactRenderer artifact={llmOutput} />
```

Features:
- Automatic schema validation
- Error boundary with messaging
- Progressive fade-in animation
- Type-safe component mapping

---

## 🎯 Backend Format (REQUIRED)

Your LLM/backend MUST return structured JSON, not markdown:

### ✅ CORRECT

```json
{
  "executive_summary": "Market analysis summary...",
  "key_metrics": [
    { "label": "Revenue", "value": "$61M", "subtext": "2023" },
    { "label": "Growth", "value": "+24%", "subtext": "YoY" }
  ],
  "charts": [
    {
      "type": "revenue",
      "title": "Revenue Growth",
      "data": [
        { "year": "2021", "revenue": 20 },
        { "year": "2022", "revenue": 35 },
        { "year": "2023", "revenue": 61 }
      ]
    }
  ],
  "sections": [
    {
      "title": "Business Model",
      "content": [
        { "type": "paragraph", "content": "The company operates..." },
        { "type": "list", "items": ["Item 1", "Item 2"] }
      ]
    }
  ]
}
```

### ❌ WRONG

```markdown
| Year | Revenue |
|------|---------|
| 2021 | $20M    |
```

---

## 💻 Usage Examples

### Basic Rendering

```typescript
import { ArtifactRenderer, type ResearchArtifact } from "@/components/research"

export function ResearchPage() {
  const artifact: ResearchArtifact = {
    executive_summary: "...",
    key_metrics: [...],
    charts: [...],
    sections: [...]
  }

  return <ArtifactRenderer artifact={artifact} />
}
```

### With Validation

```typescript
import { validateArtifact, tryValidateArtifact } from "@/components/research"

// Throws if invalid
const validated = validateArtifact(data)

// Returns null if invalid
const safe = tryValidateArtifact(data)
if (safe) {
  // render
}
```

### In Chat Component

```typescript
import { ArtifactRenderer } from "@/components/research"

export function ChatMessage({ message }) {
  // For assistant message with artifact
  if (message.type === "artifact") {
    return <ArtifactRenderer artifact={message.payload} />
  }

  return <>{message.content}</>
}
```

---

## 🔄 Backend Integration Pattern

### Step 1: Agents Generate Artifact

```python
# In your backend
artifact = research_agent.analyze(query)
# Returns ResearchArtifact JSON
```

### Step 2: Stream to Frontend

```python
# Serialize to JSON
json_str = artifact.to_json()
# Send via SSE or websocket
send_message(json_str)
```

### Step 3: Frontend Renders

```typescript
// Automatically validated and rendered
<ArtifactRenderer artifact={JSON.parse(jsonStr)} />
```

---

## 📊 Available Chart Types

```typescript
type: "revenue"        // Line chart for growth
type: "margin"         // Bar chart for margins
type: "market-share"   // Pie chart for distribution
type: "line"           // Generic line chart
type: "bar"            // Generic bar chart
type: "pie"            // Generic pie chart
```

### Chart Data Format

```typescript
// For line/bar
{ year: "2023", value: 100, label?: "Optional" }

// For pie
{ name: "Enterprise", value: 45 }
```

---

## 🧩 Content Block Types

```typescript
// Heading
{ type: "heading", level: 2|3|4, content: "Title" }

// Paragraph
{ type: "paragraph", content: "Text..." }

// Ordered/unordered list
{ type: "list", items: ["Item 1", "Item 2"] }

// Quote/insight
{ type: "blockquote", content: "Important insight" }

// Code snippet
{ type: "code", content: "code", language?: "python" }

// Emphasized/large text
{ type: "emphasis", content: "Important point" }
```

---

## 🛡️ Safety & Type Guarantees

### Artifact Validation

```typescript
// This validates:
✓ All required fields present
✓ Data types correct
✓ Chart types are known
✓ Content blocks are valid
✓ No hallucinated components

// If invalid → error boundary with clear message
```

### Component Safety

```typescript
// LLM CANNOT generate:
❌ <CustomComponent />
❌ Arbitrary JSX
❌ Random component names

// LLM CAN ONLY request:
✓ Executive Summary
✓ Financial Metrics
✓ Known chart types
✓ Content sections
```

---

## 🎨 Styling Architecture

| Layer          | Control    | Technology              |
| -------------- | ---------- | ----------------------- |
| Typography    | Frontend   | Tailwind + prose plugin |
| Layout        | Frontend   | shadcn Cards/Grid       |
| Spacing       | Frontend   | Tailwind spacing scale  |
| Colors        | Frontend   | Dark mode zinc/zinc     |
| Data/Content  | Backend    | Structured JSON         |
| Component     | Registry   | Type-safe mapping       |

---

## 📝 System Prompt Guidance

Add this to your LLM system prompt:

```
When generating financial research artifacts, structure output as JSON:

{
  "executive_summary": "string - brief overview",
  "key_metrics": [
    { "label": "name", "value": "123", "subtext": "unit" }
  ],
  "charts": [
    {
      "type": "revenue|margin|market-share|line|bar|pie",
      "title": "Chart Title",
      "data": [{"year": "2023", "value": 100}]
    }
  ],
  "sections": [
    {
      "title": "Section Name",
      "content": [
        { "type": "paragraph|heading|list|blockquote|code", ... }
      ]
    }
  ]
}

IMPORTANT:
- Generate SEMANTIC INTENT, not UI code
- Use provided chart types only
- Structure data clearly
- Include supporting analysis in sections
```

---

## ✅ Implementation Checklist

- [x] Semantic artifact schema with Zod validation
- [x] Component registry for type safety
- [x] MCP service layer for mapping
- [x] Artifact renderer with error handling
- [x] Typography system (semantic HTML)
- [x] Chart components (line, bar, pie)
- [x] Table renderer
- [x] Metric cards
- [x] Content block renderer
- [ ] Backend integration (your responsibility)
- [ ] System prompt updates (recommended)
- [ ] Example artifacts in documentation

---

## 🚀 Next Steps

1. **Integrate Backend**
   - Update your agent/LLM to return ResearchArtifact JSON
   - Use `validateArtifact()` before sending to frontend

2. **Update Chat Component**
   - Detect artifact messages
   - Render with `<ArtifactRenderer />`

3. **Test Full Flow**
   - Query backend
   - Receive artifact JSON
   - Validate schema
   - Render UI
   - Verify styling

4. **Add More Chart Types** (optional)
   - Box plots for distributions
   - Heatmaps for correlations
   - Waterfall for variance

---

## 📦 Exported API

### From `/components/research/index.ts`

```typescript
// Components
export { ArtifactRenderer }
export { ExecutiveSummary }
export { FinancialMetrics }
export { ChartRenderer }
export { TableRenderer }
export { ContentRenderer }

// Typography
export { TypographyH1, TypographyH2, TypographyH3, ... }

// Schemas & Validation
export { validateArtifact, tryValidateArtifact }
export type { ResearchArtifact, ContentBlock, Chart, Table, Metric }

// MCP/Registry
export { COMPONENT_REGISTRY, getSafeComponent, isComponentSafe }
export { mapArtifactToComponents, getComponentContext }
```

---

## 🎯 Architecture Philosophy

> **Intent → Presentation Separation**

- **LLM/Backend:** Generates *semantic meaning* (data structure)
- **Frontend:** Renders *presentation* (visual design)
- **Registry:** Enforces type safety and prevents hallucination

This ensures:
- Professional, consistent UX
- Type-safe component rendering
- Safe AI-generated UI
- Maintainable, scalable system
- Clear separation of concerns

---

**You've successfully transformed from a raw chat app to an institutional artifact platform. 🎉**
