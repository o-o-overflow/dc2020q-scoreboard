variable "db_password" {}
variable "jwt_secret" {}

module processor {
  aws_nat_gateways  = 2
  db_instance_class = "db.t3.micro" # "db.m5.large"
  db_password       = var.db_password
  environment       = "production"
  jwt_secret        = var.jwt_secret
  source            = "../tf_modules/"
}

terraform {
  backend "s3" {
    bucket         = "ooo.terraform"
    dynamodb_table = "terraform"
    key            = "scoreboard-production.tfstate"
    profile        = "ooo"
    region         = "us-east-2"
  }
}
