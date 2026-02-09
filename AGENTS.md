# AGENTS.md

このドキュメントは、throwtrash モノレポ向けの開発エージェントガイドラインを定義する。

## 目的と概要
- Alexa/Google アシスタント向け「今日のゴミ出し」サービスの Web/サーバーサイド/スキルを扱う。
- 構成はフロントエンド(Next.js)、バックエンド(Node.js/TypeScript)、API(Node.js/TypeScript)、スキル(Alexa)、共通モジュール(Trash Common)、インフラ(CDK)で分かれている。
- モノレポは pnpm 管理（apps/・packages/ 構成）。

## リポジトリ構成
- apps/throwtrash-web/frontend/: Next.js フロントエンド
- apps/throwtrash-web/backend/: サーバーサイド(TypeScript)
- apps/throwtrash-web/api/: API サーバー(TypeScript)
- apps/throwtrash-web/infra/cdk/: CloudFront/CDK 構成
- apps/throwtrash-alexa-skill/app/: Alexa スキル(TypeScript)
- packages/trash-common/: 共通モジュール(TypeScript)
- work/reports/: 調査・報告メモ
- work/tasks/: 計画タスク一覧

## 主要技術とテスト
- フロントエンド: Next.js, React, MUI, React Query, i18next, Jest
- バックエンド: Node.js, TypeScript, AWS SDK(DynamoDB), Firebase Admin, JWT, Jest
- API: Node.js, TypeScript, AWS SDK(DynamoDB), Firebase Admin, Jest
- Alexa: ask-sdk, AWS SDK, Jest
- 共通モジュール: TypeScript, Jest
- インフラ: AWS CDK(CloudFront)

## 共通方針
### 基本事項
- 日本語で応答すること。
- 必要に応じて、ユーザーに質問を行い、要求を明確にすること。
- ユーザーがあなたに質問をした場合（疑問形での問いかけ）は指示ではない。ユーザーの意見をそのまま受け取って実装を行うのではなく、あなたの考えを述べた上でユーザーに指示を仰ぐこと。
- 作業後、作業内容とユーザーが次に取れる行動を説明すること。
- 次の作業へ進む指示が出た際に git に未反映の内容がある場合は git commit してから作業を開始する。
- コミットメッセージには semantic commit を用いる。
- リモート Push の可否は必ずユーザーに確認する。
- コマンドの出力が確認できない場合、get last command / check background terminal を使用して確認すること。
- コマンドが権限不足やネットワークエラーで失敗する場合、自力で解消を試みないこと。ユーザーに質問し、指示を仰ぐこと。
- 作業開始前には必ず調査レポートおよびタスク一覧の存在を確認し、新規に作成が必要か判断すること。

### コードの書き方
- コードのコメントは日本語で記載すること。
- コメントはコードの意図や動作を明確にするために記すこと。コードを見れば明らかな内容はコメントしないこと。

### テストの実装
- コードを新規に作成した場合は、必ずテストコードも実装すること。
- テストコードは、実装した機能が正しく動作することを確認するためのものである。
- テストコードは、実装した機能の主要な動作をカバーすること。
- カバレッジを 100% にする必要はないが、主要な機能が正しく動作することを確認できるようにすること。
- テストは「単体テスト」と「UI テスト」に分けて実装すること。
  - 単体テストは業務ロジックに対して実装することを基本とし、UI コードに対しては原則として実装しないこと。
  - 単体テストは関数単位でテストケースを作成し、正常系と異常系を実装すること。
  - 言語の制約で関数名に日本語が許容される場合は、テストケースの関数名は日本語とすること。それ以外の場合は、テスト内容が分かるようにテストコード内のコメントで補足すること。
  - UI テストはユーザー操作のシナリオに対して実装することを基本とすること。ファイル単位・プログラム単位には実装しないこと。
  - UI テストは全てのシナリオを網羅する必要はないが、シナリオごとに正常系と異常系のテストを実施すること。

## 開発手順
### 「調査」の指示
- チャットでの要求に対して、必要な情報を明確にするための質問を行うこと。
- 利用する技術やツール、サービス API など最新の情報が必要な場合、その都度 Web 検索を行うこと。関連する MCP があれば随時 MCP サーバーから情報を取得すること。
- レポートの記録を指示されている場合は、プロジェクト内に Markdown 形式で記録すること。
- レポートは work/reports/ 内に Markdown 形式で記録すること。

### 「計画」の指示
- プロジェクト内に Markdown 形式で計画ファイルを作成すること。
- 計画したタスク一覧は work/tasks/ 内に Markdown 形式で作成する。
- タスク一覧のファイル名は `YYYY-MM-DD-<任意のタスク見出し>.md` とし、日付はタスク作成日とする。
- 各タスクには進捗状況が分かるように、未着手・進行中・完了のいずれかを EMOJI で記載すること。
- コードベースとプロジェクト内のドキュメントを読み込み、要件に関連性のあるファイルパスをすべて記載すること。
- このフェーズでは、コードベースの修正を行わないこと。
- コードベースの修正計画に合わせて、ドキュメント修正も計画すること。
- 可能な限りタスクを細分化し、各タスクが独立して実行できるようにすること。
- 作成した計画は必ずユーザーの了承を得ること。了承を得た場合のみ実装フェーズに進むこと。

### 「実装」の指示
- 計画で作成したタスク一覧に基づいて実装を行うこと。必ず対応する計画ファイルが存在することを確認する。
- 実装前に Context7 MCP Server を利用し、resolve-library-id → get-library-docs で関連ライブラリの最新情報を取得する。
- 記載されている以上の実装を行わないこと。
- コードの新規作成・修正が必要な場合、必ずテストコードも作成・修正すること。
- 非推奨の API を使用している場合、可能な限り最新の API に置き換えること。
- ソースコードの修正後、ESLint でコードスタイルを確認し、自動修正可能な問題は自動修正を行う。自動修復されない問題は修正する。
- ソースコードの修正後、`copilot -p "<レビュー依頼内容>" --add-dir . --allow-all-tools` コマンドを実行し、コードレビューを依頼する。指摘された内容に基づき、必要な修正を行う。
- 実装・テスト以外の作業（レビューや環境セットアップなど）で、報告用の記録を作成する場合は work/reports/ 内に Markdown 形式で作成する。
- テストまで完了したら、改めてプロジェクト内のドキュメントを見直し、修正後のコードベースと齟齬がないことを確認すること。差異がある場合はドキュメントを修正すること。
- 実装作業が完了したタイミングまたは計画変更や状況の変化が発生した場合には、タスク一覧を更新すること。

## よく使うコマンド
- 共通モジュール: `pnpm --filter trash-common run test` / `pnpm --filter trash-common run build`
- フロントエンド: `pnpm --filter trashschedule-next run dev` / `pnpm --filter trashschedule-next run build` / `pnpm --filter trashschedule-next run lint` / `pnpm --filter trashschedule-next run test`
- バックエンド: `pnpm --filter backend run test` / `pnpm --filter backend run build`
- API: `pnpm --filter api run test` / `pnpm --filter api run build`
- Alexa: `pnpm --filter throwtrash-alexa-skill run test` / `pnpm --filter throwtrash-alexa-skill run build`
- インフラ(CDK): `cd apps/throwtrash-web/infra/cdk && npm ci && npx cdk deploy <stack> --context stage=<stage>`

## 参照すべきドキュメント
- README.md
- apps/throwtrash-web/frontend/md/manual.md
- apps/throwtrash-web/frontend/md/policy.md
- apps/throwtrash-web/infra/cdk/README.md

## エージェントの分割
- ユーザーからの要求が大規模な場合、複数のエージェントに分割して対応することを検討する。
- 分割を行う場合は必ずユーザーに確認を取る。
