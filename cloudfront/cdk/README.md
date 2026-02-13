# CloudFront CDK

CloudFrontのPrimary Distributionを構築します（設定は環境変数/.envのみ）。

## 事前準備
- `.env` を用意し、必要な環境変数を設定してください（環境変数が優先されます）。

## 実行例
```bash
cd cloudfront/cdk
npm ci
npx cdk deploy throwtrash-cloudfront-dev --context stage=dev
```

## 環境変数上書き
- `CF_DOMAIN_NAME`
- `CF_CERT_ARN`
- `CF_FRONTEND_BUCKET`
- `CF_BACKEND_API_DOMAIN`
- `CF_MOBILE_API_DOMAIN`

## .env 例
```
CF_DOMAIN_NAME=dev.mythrowaway.net
CF_CERT_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CF_FRONTEND_BUCKET=throwtrash-dev
CF_BACKEND_API_DOMAIN=xxxx.execute-api.ap-northeast-1.amazonaws.com
CF_MOBILE_API_DOMAIN=yyyy.execute-api.ap-northeast-1.amazonaws.com
CF_ALARM_API_DOMAIN=zzzz.execute-api.ap-northeast-1.amazonaws.com
```
