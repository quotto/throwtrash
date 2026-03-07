data "archive_file" "update-function-zip" {
  type        = "zip"
  source_dir  = "${path.root}/../packages/api/update/dist"
  output_path = "${path.module}/app-update.zip"
}
data "archive_file" "update-layer-zip" {
  type        = "zip"
  source_dir  = "${path.root}/../packages/api/update/layer"
  output_path = "${path.module}/app-update-layer.zip"
}
resource "aws_lambda_layer_version" "throwtrash-alarm-update-layer" {
  layer_name          = "throwtrash-alarm-update-libs"
  skip_destroy        = true
  compatible_runtimes = ["nodejs20.x"]
  filename            = data.archive_file.update-layer-zip.output_path
  source_code_hash    = data.archive_file.update-layer-zip.output_base64sha256
}

resource "aws_lambda_function" "throwtrash-alarm-update-lambda" {
  function_name = "throwtrash-alarm-update"
  role          = aws_iam_role.throwtrash-alarm-lambda-role.arn
  handler       = "index.handler"

  filename         = data.archive_file.update-function-zip.output_path
  source_code_hash = data.archive_file.update-function-zip.output_base64sha256

  runtime = "nodejs20.x"

  layers = [aws_lambda_layer_version.throwtrash-alarm-update-layer.arn]

  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.throwtrash-alarm-log-group.name
  }

  publish = var.environment == "prod"

  environment {
    variables = {
      ALARM_TABLE_NAME                  = aws_dynamodb_table.throwtrash-alarm-table.name
      EVENT_BRIDGE_SCHEDULER_GROUP_NAME = aws_scheduler_schedule_group.throwtrash-alarm-schedule-group.name
      ALARM_TRIGGER_FUNCTION_ARN        = "${var.alarm_trigger_lambda_arn}:${var.environment}",
      ALARM_TRIGGER_FUNCTION_ROLE_ARN   = aws_iam_role.throwtrash-alarm-scheduler-role.arn
    }
  }

  tags = local.tags
}

resource "aws_lambda_alias" "throwtrash-update-dev" {
  name             = "dev"
  function_name    = aws_lambda_function.throwtrash-alarm-update-lambda.function_name
  function_version = "$LATEST"
}

resource "aws_lambda_permission" "throwtrash-update-permission-apigw" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.throwtrash-alarm-update-lambda.function_name
  qualifier     = aws_lambda_alias.throwtrash-update-dev.name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/${aws_api_gateway_method.api-method-put.http_method}/${aws_api_gateway_resource.api-resource-update.path_part}"
}
