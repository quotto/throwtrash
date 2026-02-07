import "@jest/globals";

// AWS SDK が参照するリージョンをテスト用に固定する
if (!process.env.AWS_REGION) {
  process.env.AWS_REGION = "us-east-1";
}
if (!process.env.AWS_DEFAULT_REGION) {
  process.env.AWS_DEFAULT_REGION = "us-east-1";
}
