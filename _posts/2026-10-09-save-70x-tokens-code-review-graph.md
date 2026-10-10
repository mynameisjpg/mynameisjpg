---
# UNTITLED.JPG DISPATCH METADATA
title: "You need to graph your agent's workspace [code-review-graph]"
subtitle: "High-level summary of what this tool, dataset, or utility accomplishes."
excerpt: "Reduce your token consumption up to 70x by building a graph of your workspace."
date: "2026-10-09 22:45:59 -0300"
author: "Juan P. Giusepponi"
status: "published"
format: "resource"
topic:
  pillar: "Language, LLMs & Artificial Intelligence"
  subtopic: "LLM architectures and mechanics"
tags:
  - "toolkit"
  - "ai"
  - "graphify"
  - "graph"
  - "antigravity"
  - "vs-code"
  - "ai-agents"
  - "repo"
  - "github"
  - "knowledge-graphs"
reading_time: "Code Toolkit"
theme: "dark"
featured: false
shareable: true
allow_embed: true
image:
  path: "assets/images/knowledge-graphs.jpg"
  alt: "Architectural blueprint layered with black network nodes and digital glitch distortions in black, white, and coral-red tones."
links:
  - title: "Graphify - another knowledge graph repo"
    url: "https://github.com/Graphify-Labs/graphify"
    type: "repo"
    description: ""
backlinks: []
category: "repo"
resource_url: "https://github.com/tirth8205/code-review-graph"
sys_id: "SYS_202610_RES"
---

## 01. What Graph does

AI coding tools often re-read large parts of a codebase to review a change. code-review-graph builds a structural map of the code with Tree-sitter, keeps it updated incrementally, and serves compact context over MCP, so the assistant reads only the files a change touches.

<img src="assets/images/code-graph-tokens.jpg" alt="graph showing how code-review-graph uses up to 71x less tokens" width="100%"/>

---

## 02. Quickstart & Installation

```bash
pip install code-review-graph          # or: pipx install code-review-graph
code-review-graph install              # detect installed AI coding tools and configure each one
code-review-graph build                # parse the codebase
```

To configure one platform, pass --platform with one of codex, claude-code, cursor, windsurf, zed, continue, opencode, antigravity, gemini-cli, qwen, kiro, qoder, copilot, copilot-cli, codebuddy, or hermes:

```bash
code-review-graph install --platform cursor
code-review-graph install --platform codebuddy
```

Then open the project and ask the assistant:

```bash
Build the code review graph for this project
```

---

## 03. Features

|            Feature            |                                                                                                                       Details                                                                                                                        |
| :---------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|      Incremental updates      |                                                               Re-parses only files whose hash changed. On a ~3,000-file repo a two-file edit takes ~2.5 s on the hook path (measured).                                                               |
| Language and notebook support |                                                                                                             See Language coverage above.                                                                                                             |
|  Framework-aware PHP parsing  |                                                   Repository-bounded Composer PSR-4 imports, Blade template references, evidence-gated Laravel Route-to-controller and Eloquent relationship edges                                                   |
| Framework-aware Java parsing  | Spring dependency-injection call resolution, request endpoints and WebFlux routes, scheduled triggers, application-event publisher-to-listener edges, Temporal workflow and activity edges, and Spring Boot config keys indexed without their values |
|     Blast-radius analysis     |                                                                                          Which functions, classes and files are likely affected by a change                                                                                          |
|       Auto-update hooks       |                                                                                   Editor hooks, a git pre-commit hook and watch mode update the graph as you work                                                                                    |
|        Semantic search        |                                     Optional vector embeddings via sentence-transformers, Google Gemini, MiniMax, Voyage AI, or any OpenAI-compatible endpoint (OpenAI, Azure, new-api, LiteLLM, vLLM, LocalAI)                                      |
|   Interactive visualisation   |                                                                               D3.js force-directed graph with search, community legend toggles and degree-scaled nodes                                                                               |
|   Hub and bridge detection    |                                                                                            Most-connected nodes and chokepoints (betweenness centrality)                                                                                             |
|       Surprise scoring        |                                                                                    Unexpected coupling: cross-community, cross-language, peripheral-to-hub edges                                                                                     |
|    Knowledge gap analysis     |                                                                                                 Isolated nodes, untested hotspots, thin communities                                                                                                  |
|      Suggested questions      |                                                                                             Review questions generated from bridges, hubs and surprises                                                                                              |
|        Edge confidence        |                                                                                         Two-tier confidence (EXTRACTED/INFERRED) with float scores on edges                                                                                          |
|        Graph traversal        |                                                                                            BFS/DFS from any node with configurable depth and token budget                                                                                            |
|        Export formats         |                                                                     GraphML (Gephi/yEd), Neo4j Cypher, Obsidian vault, JSON, and SVG (SVG needs matplotlib from the eval extra)                                                                      |
|      Token benchmarking       |                                                                      code_review_graph/token_benchmark.py measures whole-corpus tokens against graph query tokens per question                                                                       |
|   Estimated context savings   |                                                            context_savings metadata (estimated, saved_tokens, saved_percent) on review, impact, detect-changes and architecture responses                                                            |
|     Community auto-split      |                                                                                         Communities above 25% of the graph are split recursively with Leiden                                                                                         |
|        Execution flows        |                                                                                            Call chains from entry points, sorted by weighted criticality                                                                                             |
|      Community detection      |                                                                                                Leiden clustering with resolution scaled to graph size                                                                                                |
|     Architecture overview     |                                                                                               Community-based architecture map with coupling warnings                                                                                                |
|      Risk-scored reviews      |                                                                                         detect_changes maps diffs to affected functions, flows and test gaps                                                                                         |
|       Custom languages        |                                                                                         New languages via .code-review-graph/languages.toml, no fork needed                                                                                          |
|         GitHub Action         |                                                                                Sticky risk-scored PR review comments in CI, with an optional fail-on-risk merge gate                                                                                 |
|       Refactoring tools       |                                                                                  Rename preview, framework-aware dead code detection, community-driven suggestions                                                                                   |
|        Wiki generation        |                                                                                                        Markdown wiki from community structure                                                                                                        |
|      Multi-repo registry      |                                                                                                    Register several repos and search across them                                                                                                     |
|       Multi-repo daemon       |                                                                                 crg-daemon watches several repos as child processes, with health checks and restart                                                                                  |
|          MCP prompts          |                                                                                        5 workflow templates: review, architecture, debug, onboard, pre-merge                                                                                         |
|       Full-text search        |                                                                                              FTS5 hybrid search combining keyword and vector similarity                                                                                              |
|         Local storage         |                                                                                    One SQLite file in .code-review-graph/; no external database or cloud service                                                                                     |
