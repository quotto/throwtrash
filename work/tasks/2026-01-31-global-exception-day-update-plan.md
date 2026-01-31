# 全体例外日対応（再計画）

## 背景
- 既存のゴミ種別ごとの例外日設定に加えて、全てのゴミに共通の例外日を設定する要望がある。これを OR 条件で個別例外日と組み合わせて適用する。
- 全体例外日には専用の管理ページを設け、上限を 10 件とし、既存データの移行は行わず、個別例外日は引き続き保持する。
- 後方互換を保つため、モデルは optional で拡張し、既存データは空配列として扱う。

## 対応範囲
- データベース（model）定義
- バックエンド（保存・取得・バリデーション）
- フロントエンド（設定 UI と送受信、全体例外専用ページ）
- 共通ロジック、テスト、ドキュメント

## 主要ファイル（予定）
- `packages/trash-common/src/types.mts`
- `packages/trash-common/src/client/trash-schedule-service.mts`
- `packages/trash-common/src/__test__/client.test.mts`
- `apps/throwtrash-web/backend/src/register.ts`
- `apps/throwtrash-web/backend/src/__tests__/register.test.ts`
- `apps/throwtrash-web/api/src/interface.ts`
- `apps/throwtrash-web/frontend/app/states/trash-form.ts`
- `apps/throwtrash-web/frontend/app/states/validators.ts`
- `apps/throwtrash-web/frontend/app/states/exclude-date.ts`
- `apps/throwtrash-web/frontend/app/exclude/page.tsx`
- `apps/throwtrash-web/frontend/react/components/TrashSchedule.tsx`
- `apps/throwtrash-web/frontend/react/lang/ja.json`
- `apps/throwtrash-web/frontend/react/lang/en.json`
- `work/reports/`（更新が必要な場合）
- `work/tasks/`（計画・進捗記録）

## タスク一覧
- ✅ `backend-dist` 配下を Jest から ignore して backend テストを通す（既存の duplicate manual mock 対応）
- ✅ データモデルの optional 全体例外日フィールド追加と限定 10 件の上限チェック（Trash Common + API interface）
- ✅ バックエンドで全体例外日を保存・読み込み・検証する処理を追加し、個別例外日との OR 判定に統合
- ✅ フロントエンドに全体例外日専用ページを追加し、既存の個別例外日設定と OR 条件で送信できる UI/バリデーションを整備（UI テスト含む）
- ✅ 全体例外日ロジックを共通モジュールに集約し、単体テストで正常系/異常系をカバー
- ✅ ドキュメント（manual 等）と i18n テキストを全体例外日対応で更新
- 🔲 修正後に `pnpm` ベースで ESLint + 各モジュールの単体テストを実行し、`copilot -p "レビュー依頼: 全体例外日" --allow-all --add-dir .` でレビュー依頼（`trashes`/`backend`テスト実行済、Copilot CLI を300秒枠で2回試行したが内部エラー／180秒タイムアウトのため要再実行）
- 🔲 リリース準備
  - semantic commit で変更をコミットした後、リモートへ push
  - リモートCI／デプロイプロセスを起動し、ビルドとデプロイが正常完了することを確認

## 補足
- `dev-admin` プロファイル、`ap-northeast-1` リージョンを前提とする。
- `--allow-all` は Copilot CLI オプションなので、`copilot -p ... --allow-all` でレビュー要求に追加する。
