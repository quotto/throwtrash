# throwtrash-monorepo

throwtrash の Web/Backend と Alexa スキル、共通モジュールをまとめた pnpm 管理のモノレポです。

## 構成
- apps/frontend
  - Next.js フロントエンド
- apps/backend
  - サーバーサイド (Node.js/TypeScript)
- apps/mobile
  - モバイル向け API
- apps/alexa
  - app: Alexa スキル本体
  - main.tf: Terraform 構成
- apps/throwtrash-web/infra
  - CloudFront/CDK 構成
- packages/trash-common
  - 共通モジュール（旧 throwtrash-common-module）

## セットアップ
```bash
pnpm install
```

## 開発・ビルド
```bash
# フロントエンド
pnpm --filter frontend run dev

# バックエンド
pnpm --filter backend run build

# モバイル API
pnpm --filter mobile run build

# Alexa スキル
pnpm --filter alexa run build

# 共通モジュール
pnpm --filter trash-common run build
```

## テスト
```bash
pnpm --filter frontend run test
pnpm --filter backend run test
pnpm --filter mobile run test
pnpm --filter alexa run test
pnpm --filter trash-common run test
```

## デプロイ
GitHub Actions を利用します。各ワークフローは以下のパス変更時のみ実行されます。
- frontend: `apps/frontend/**`
- backend: `apps/backend/**`
- mobile: `apps/mobile/**`
- infra: `apps/throwtrash-web/infra/**`
- alexa-skill: `apps/alexa/**`
- common: `packages/trash-common/**`

## API ドキュメント
- Backend: `apps/backend/docs/backend-openapi.yaml`
- API (モバイル/共有): `apps/mobile/docs/api-openapi.yaml`
