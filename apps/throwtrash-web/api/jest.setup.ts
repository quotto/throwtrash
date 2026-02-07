import { jest } from "@jest/globals";

// ESM 環境でも jest をグローバルに参照できるようにする
const globalAny = globalThis as Record<string, unknown>;
globalAny.jest = jest;

// AWS SDK が参照するリージョンをテスト用に固定する
if (!process.env.AWS_REGION) {
  process.env.AWS_REGION = "us-east-1";
}
if (!process.env.AWS_DEFAULT_REGION) {
  process.env.AWS_DEFAULT_REGION = "us-east-1";
}
