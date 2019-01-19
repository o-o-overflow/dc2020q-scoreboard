variable "DB_PASSWORD" {}
variable "DB_USERNAME" {}

provider "aws" {
  profile = "ooo"
  region  = "us-east-2"
}

resource "aws_vpc" "scoreboard" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "sb" }
}

resource "aws_internet_gateway" "gateway" {
  tags = { Name = "sb" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}


resource "aws_subnet" "private_a" {
  availability_zone = "us-east-2a"
  cidr_block = "10.0.0.0/20"
  tags = { Name = "sb_private_a" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_subnet" "private_b" {
  availability_zone = "us-east-2b"
  cidr_block = "10.0.16.0/20"
  tags = { Name = "sb_private_b" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_subnet" "private_c" {
  availability_zone = "us-east-2c"
  cidr_block = "10.0.32.0/20"
  tags = { Name = "sb_private_c" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_db_subnet_group" "sb_private" {
  name = "sb-private"
  subnet_ids = [
    "${aws_subnet.private_a.id}",
    "${aws_subnet.private_b.id}",
    "${aws_subnet.private_c.id}"
  ]
}

resource "aws_subnet" "public_a" {
  availability_zone = "us-east-2a"
  cidr_block = "10.0.253.0/24"
  map_public_ip_on_launch = true
  tags = { Name = "sb_public_a" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_subnet" "public_b" {
  availability_zone = "us-east-2b"
  cidr_block = "10.0.254.0/24"
  map_public_ip_on_launch = true
  tags = { Name = "sb_public_b" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_subnet" "public_c" {
  availability_zone = "us-east-2c"
  cidr_block = "10.0.255.0/24"
  map_public_ip_on_launch = true
  tags = { Name = "sb_public_c" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}


resource "aws_eip" "nat_a" {
  depends_on = ["aws_internet_gateway.gateway"]
  tags = { Name = "sb_a" }
  vpc = true
}

resource "aws_eip" "nat_b" {
  depends_on = ["aws_internet_gateway.gateway"]
  tags = { Name = "sb_b" }
  vpc = true
}

resource "aws_eip" "nat_c" {
  depends_on = ["aws_internet_gateway.gateway"]
  tags = { Name = "sb_c" }
  vpc = true
}


resource "aws_nat_gateway" "gateway_a" {
  allocation_id = "${aws_eip.nat_a.id}"
  subnet_id = "${aws_subnet.public_a.id}"
  tags = { Name = "sb_a" }
}

resource "aws_nat_gateway" "gateway_b" {
  allocation_id = "${aws_eip.nat_b.id}"
  subnet_id = "${aws_subnet.public_b.id}"
  tags = { Name = "sb_b" }
}

resource "aws_nat_gateway" "gateway_c" {
  allocation_id = "${aws_eip.nat_c.id}"
  subnet_id = "${aws_subnet.public_c.id}"
  tags = { Name = "sb_c" }
}

resource "aws_route_table" "public" {
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.gateway.id}"
  }
  tags = { Name = "sb_public" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_route_table" "private_a" {
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = "${aws_nat_gateway.gateway_a.id}"
  }
  tags = { Name = "sb_private_a" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_route_table" "private_b" {
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = "${aws_nat_gateway.gateway_b.id}"
  }
  tags = { Name = "sb_private_b" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_route_table" "private_c" {
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = "${aws_nat_gateway.gateway_c.id}"
  }
  tags = { Name = "sb_private_c" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}


resource "aws_route_table_association" "private_a" {
  route_table_id = "${aws_route_table.private_a.id}"
  subnet_id = "${aws_subnet.private_a.id}"
}

resource "aws_route_table_association" "private_b" {
  route_table_id = "${aws_route_table.private_b.id}"
  subnet_id = "${aws_subnet.private_b.id}"
}

resource "aws_route_table_association" "private_c" {
  route_table_id = "${aws_route_table.private_c.id}"
  subnet_id = "${aws_subnet.private_c.id}"
}

resource "aws_route_table_association" "public_a" {
  route_table_id = "${aws_route_table.public.id}"
  subnet_id = "${aws_subnet.public_a.id}"
}

resource "aws_route_table_association" "public_b" {
  route_table_id = "${aws_route_table.public.id}"
  subnet_id = "${aws_subnet.public_b.id}"
}

resource "aws_route_table_association" "public_c" {
  route_table_id = "${aws_route_table.public.id}"
  subnet_id = "${aws_subnet.public_c.id}"
}

resource "aws_security_group" "lambda" {
  description = "Allow only outbound traffic"
  egress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic to the Internet"
    from_port = 0
    protocol = "-1"
    to_port = 0
  }
  name = "sb_lambda_allow_outbound"
  tags = { Name = "sb_lambda" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_security_group" "database" {
  description = "Allow only Postgres traffic"
  ingress {
    description = "Allow Postgres traffic to scoreboard lambdas"
    from_port = 5432
    protocol = "tcp"
    security_groups = [
      "${aws_security_group.lambda.id}",
      "${aws_security_group.util.id}"
    ]
    to_port = 5432
  }
  name = "sb_database"
  tags = { Name = "sb_database" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}

resource "aws_security_group" "util" {
  description = "Allow ssh access as well as all access to the Internet"
  egress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outgoing traffic to the Internet"
    from_port = 0
    protocol = "-1"
    to_port = 0
  }
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow ssh access from anywhere"
    from_port = 22
    protocol = "tcp"
    to_port = 22
  }
  name = "sb_util"
  tags = { Name = "sb_util" }
  vpc_id = "${aws_vpc.scoreboard.id}"
}


resource "aws_instance" "util" {
  ami = "ami-0b59bfac6be064b78"
  associate_public_ip_address = true
  availability_zone = "us-east-2a"
  depends_on = ["aws_internet_gateway.gateway"]
  disable_api_termination = false
  instance_type = "t3.nano"
  key_name = "bboe"
  subnet_id = "${aws_subnet.public_a.id}"
  tags = { Name = "sb-util" }
  vpc_security_group_ids = ["${aws_security_group.util.id}"]
}

resource "aws_db_instance" "scoreboard-dev" {
  allocated_storage = 8
  allow_major_version_upgrade = false
  apply_immediately = true
  availability_zone = "us-east-2a"
  auto_minor_version_upgrade = false
  db_subnet_group_name = "${aws_db_subnet_group.sb_private.id}"
  deletion_protection = false
  engine = "postgres"
  engine_version = "10.4"
  identifier = "sb-dev"
  instance_class = "db.t2.micro"
  multi_az = false
  name = "scoreboard"
  password = "${var.DB_PASSWORD}"
  skip_final_snapshot = true
  storage_type = "gp2"
  tags = { Name = "sb-dev" }
  username = "${var.DB_USERNAME}"
  vpc_security_group_ids = ["${aws_security_group.database.id}"]
}
