@../memo.md に実装メモを記載している。

- 関連情報
  - @../.serena/memories/code_style_conventions.md
  - @../.serena/memories/codebase_structure.md
  - @../.serena/memories/project_purpose.md
  - @../.serena/memories/suggested_commands.md
  - @../.serena/memories/task_completion_guidelines.md
  - @../.serena/memories/tech_stack.md

## Serena MCPを利用することを推奨します

コードを編集する際は、必ずSerena MCPを利用してください。
Serena MCPは、コードベースの理解と編集を支援するAIアシスタントです。

Serena MCPを利用するとは、以下に示したツールを利用することを意味します。

🟢 serena - Ready (20 tools)
    Tools:
    - activate_project
    - check_onboarding_performed
    - delete_memory
    - find_file
    - find_referencing_symbols
    - find_symbol
    - get_current_config
    - get_symbols_overview
    - insert_after_symbol
    - insert_before_symbol
    - list_dir
    - list_memories
    - onboarding
    - read_memory
    - replace_symbol_body
    - search_for_pattern
    - think_about_collected_information
    - think_about_task_adherence
    - think_about_whether_you_are_done
    - write_memory

## ページの設計方針

- `page.tsx`: サーバーコンポーネント
  - データの取得とページ全体のレイアウトを担当
- `***Content.tsx`: クライアントコンポーネント
  - ユーザーインタラクションを含むコンテンツ部分を担当
