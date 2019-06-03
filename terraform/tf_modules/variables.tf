variable "aws_availability_zones" {
  default = {
    "us-east-2" = ["us-east-2a", "us-east-2b", "us-east-2c"]
  }
}
variable "aws_nat_gateways" {
  default = 1
}
variable "aws_profile" {
  default = "ooo"
}
variable "aws_region" {
  default = "us-east-2"
}
variable "aws_vpc_cidr_block" {
  default = "10.0.0.0/16"
}
variable "db_password" {}
variable "db_instance_class" {
  default = "db.t3.micro"
}
variable "db_username" {
  default = "scoreboard"
}
variable "environment" {}
