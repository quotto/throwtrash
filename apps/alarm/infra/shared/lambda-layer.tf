removed {
  from = aws_lambda_layer_version.layer
  lifecycle {
    destroy = false
  }
}