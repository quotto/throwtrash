# 例外日（全ゴミ共通）対応 計画

## 背景
- 既存はゴミ種別ごとの例外日設定のみ。
- 追加で「全ゴミに共通の例外日」を設定できるようにする。
- 既存データへの影響を避けるため移行は行わない（後方互換の拡張）。
- 個別例外日は維持する。

## 仕様（確定）
- 全体例外日と個別例外日は OR 条件で適用する（どちらかに該当すれば除外）。
- 全体例外日設定は専用ページを用意する。
- 全体例外日の上限は 10 件。

## 方針
- データモデルは後方互換の任意フィールド追加で対応。
- バックエンド／API／フロント／共通ロジックに同一概念（全体例外日）を追加。
- 既存データは「全体例外日が未設定＝空配列扱い」で動作させる。

## 影響範囲（主要ファイル）
- `packages/trash-common/src/types.mts`
- `packages/trash-common/src/client/trash-schedule-service.mts`
- `packages/trash-common/src/__test__/client.test.mts`
- `packages/trash-common/src/__test__/text-creator.test.mts`
- `apps/throwtrash-web/backend/src/register.ts`
- `apps/throwtrash-web/backend/src/__tests__/register.test.ts`
- `apps/throwtrash-web/api/src/interface.ts`
- `apps/throwtrash-web/frontend/app/states/types.ts`
- `apps/throwtrash-web/frontend/app/states/trash-form.ts`
- `apps/throwtrash-web/frontend/app/states/validators.ts`
- `apps/throwtrash-web/frontend/app/states/exclude-date.ts`
- `apps/throwtrash-web/frontend/app/exclude/page.tsx`
- `apps/throwtrash-web/frontend/react/components/TrashSchedule.tsx`
- `apps/throwtrash-web/frontend/__tests__/states/*.test.ts`
- `apps/throwtrash-web/frontend/react/lang/ja.json`
- `apps/throwtrash-web/frontend/react/lang/en.json`
- `apps/throwtrash-web/frontend/md/manual.md`

## タスク一覧
- ✅ データモデル拡張（後方互換）
  - trash-commonの型に全体例外日フィールドを追加（optional）
  - 既存データが未設定でも動作するデフォルト処理を追加

- ✅ バックエンド改修
  - 受け取り/保存/検証の対象に全体例外日を追加
  - 既存データ形式のままでも処理可能な分岐を追加
  - 単体テスト追加・更新

- ✅ フロントエンド改修
  - 全体例外日を編集する専用ページを追加
  - 既存の個別例外日編集を維持
  - バリデーションと送信ペイロードを拡張
  - UIテスト（正常系/異常系）を追加

- ✅ 共通ロジック改修
  - 例外日判定に全体例外日を OR 条件で合成
  - 主要ロジックの単体テストを追加・更新

- ✅ ドキュメント更新
  - `apps/throwtrash-web/frontend/md/manual.md` に全体例外日の説明を追記
  - `react/lang/ja.json` / `react/lang/en.json` にグローバル例外表示ラベルを追加
  - Main画面で全体例外一覧（GlobalExcludeSummary）を表示することを明記

- ✅ 品質確認
  - `pnpm --filter trashschedule-next run test`
  - `AWS_PROFILE=dev-admin AWS_REGION=ap-northeast-1 AWS_DEFAULT_REGION=ap-northeast-1 pnpm --filter backend run test`
  - 変更点の自己レビュー
- 🔲 リリース準備
  - semantic commit を作成し（例：`feat: add global exclude summary`）git status をクリーンに
  - リモートへ push して、ビルド／デプロイパイプライン（アプリ共通または各 module）をトリガーし成功を確認
