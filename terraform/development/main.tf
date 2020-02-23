module processor {
  db_password = "password"
  environment = "development"
  jwt_secret  = "development"
  source      = "../tf_modules/"
}

terraform {
  backend "s3" {
    bucket         = "ooo.terraform"
    dynamodb_table = "terraform"
    key            = "scoreboard-development.tfstate"
    profile        = "ooo"
    region         = "us-east-2"
  }
}
