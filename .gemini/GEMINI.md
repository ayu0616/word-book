@../memo.md に実装メモを記載している。

- 関連情報
  - @../.serena/memories/code_style_conventions.md
  - @../.serena/memories/codebase_structure.md
  - @../.serena/memories/project_purpose.md
  - @../.serena/memories/suggested_commands.md
  - @../.serena/memories/task_completion_guidelines.md
  - @../.serena/memories/tech_stack.md

## ページの設計方針

- `page.tsx`: サーバーコンポーネント
  - データの取得とページ全体のレイアウトを担当
- `***Content.tsx`: クライアントコンポーネント
  - ユーザーインタラクションを含むコンテンツ部分を担当
