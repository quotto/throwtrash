# throwtrash-monorepo

throwtrash の Web/Backend と Alexa スキル、共通モジュールをまとめた pnpm 管理のモノレポです。

## 構成
- apps/throwtrash-web
  - frontend: Next.js フロントエンド
  - backend: サーバーサイド (Node.js/TypeScript)
  - api: モバイル向け API
  - infra: CloudFront/CDK 構成
- apps/throwtrash-alexa-skill
  - app: Alexa スキル本体
  - main.tf: Terraform 構成
- packages/trash-common
  - 共通モジュール（旧 throwtrash-common-module）

## セットアップ
```bash
pnpm install
```

## 開発・ビルド
```bash
# フロントエンド
pnpm --filter trashschedule-next run dev

# バックエンド
pnpm --filter backend run build

# モバイル API
pnpm --filter api run build

# Alexa スキル
pnpm --filter throwtrash-alexa-skill run build

# 共通モジュール
pnpm --filter trash-common run build
```

## テスト
```bash
pnpm --filter trashschedule-next run test
pnpm --filter backend run test
pnpm --filter api run test
pnpm --filter throwtrash-alexa-skill run test
pnpm --filter trash-common run test
```

## デプロイ
GitHub Actions を利用します。各ワークフローは以下のパス変更時のみ実行されます。
- throwtrash-web: `apps/throwtrash-web/**`
- alexa-skill: `apps/throwtrash-alexa-skill/**`
- common: `packages/trash-common/**`

## API ドキュメント
- Backend: `apps/throwtrash-web/backend/docs/backend-openapi.yaml`
- API (モバイル/共有): `apps/throwtrash-web/api/docs/api-openapi.yaml`
