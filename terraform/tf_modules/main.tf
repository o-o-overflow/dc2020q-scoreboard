provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
  version = "~> 2.13"
}

resource "aws_vpc" "vpc" {
  cidr_block = var.aws_vpc_cidr_block
  tags = { Name = "scoreboard-${var.environment}" }
}

resource "aws_internet_gateway" "gateway" {
  tags = { Name = "scoreboard-${var.environment}" }
  vpc_id = aws_vpc.vpc.id
}

resource "aws_subnet" "private" {
  availability_zone = element(lookup(var.aws_availability_zones, var.aws_region), count.index)
  cidr_block = cidrsubnet(var.aws_vpc_cidr_block, 4, count.index)
  count = length(lookup(var.aws_availability_zones, var.aws_region))
  tags = { Name = "scoreboard-${var.environment}-private-${element(lookup(var.aws_availability_zones, var.aws_region), count.index)}" }
  vpc_id = aws_vpc.vpc.id
}

resource "aws_db_subnet_group" "group" {
  name = "scoreboard-private-${var.environment}"
  subnet_ids = aws_subnet.private.*.id
}

resource "aws_subnet" "public" {
  availability_zone = element(lookup(var.aws_availability_zones, var.aws_region), count.index)
  cidr_block = cidrsubnet(cidrsubnet(var.aws_vpc_cidr_block, 4, 15), 4, count.index)
  count = length(lookup(var.aws_availability_zones, var.aws_region))
  map_public_ip_on_launch = true
  tags = { Name = "scoreboard-${var.environment}-public-${element(lookup(var.aws_availability_zones, var.aws_region), count.index)}" }
  vpc_id = aws_vpc.vpc.id
}

resource "aws_eip" "eip" {
  count = var.aws_nat_gateways
  depends_on = ["aws_internet_gateway.gateway"]
  tags = { Name = "scoreboard-${var.environment}-${element(lookup(var.aws_availability_zones, var.aws_region), count.index)}" }
  vpc = true
}

resource "aws_nat_gateway" "gateway" {
  allocation_id = aws_eip.eip[count.index].id
  count = var.aws_nat_gateways
  subnet_id = aws_subnet.public[count.index].id
  tags = { Name = "scoreboard-${var.environment}-${element(lookup(var.aws_availability_zones, var.aws_region), count.index)}" }
}

resource "aws_route_table" "public" {
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gateway.id
  }
  tags = { Name = "scoreboard-${var.environment}-public" }
  vpc_id = aws_vpc.vpc.id
}

resource "aws_route_table" "private" {
  count = length(lookup(var.aws_availability_zones, var.aws_region))
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.gateway[min(count.index, var.aws_nat_gateways - 1)].id
  }
  tags = { Name = "scoreboard-${var.environment}-private-${element(lookup(var.aws_availability_zones, var.aws_region), count.index)}" }
  vpc_id = aws_vpc.vpc.id
}

resource "aws_route_table_association" "private" {
  count = length(lookup(var.aws_availability_zones, var.aws_region))
  route_table_id = aws_route_table.private[count.index].id
  subnet_id = aws_subnet.private[count.index].id
}

resource "aws_route_table_association" "public" {
  count = length(lookup(var.aws_availability_zones, var.aws_region))
  route_table_id = aws_route_table.public.id
  subnet_id = aws_subnet.public[count.index].id
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
  name = "scoreboard-${var.environment}-lambda-allow-outbound"
  tags = { Name = "scoreboard-${var.environment}" }
  vpc_id = aws_vpc.vpc.id
}

resource "aws_security_group" "database" {
  description = "Allow only Postgres traffic"
  ingress {
    description = "Allow Postgres traffic to scoreboard lambdas"
    from_port = 5432
    protocol = "tcp"
    security_groups = [
      aws_security_group.lambda.id,
      aws_security_group.util.id
    ]
    to_port = 5432
  }
  name = "scoreboard-${var.environment}-database"
  tags = { Name = "scoreboard-${var.environment}-database" }
  vpc_id = aws_vpc.vpc.id
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
  name = "scoreboard-${var.environment}-util"
  tags = { Name = "scoreboard-${var.environment}-util" }
  vpc_id = aws_vpc.vpc.id
}

resource "aws_instance" "util" {
  ami = "ami-0b59bfac6be064b78"
  associate_public_ip_address = true
  availability_zone = "us-east-2a"
  depends_on = ["aws_internet_gateway.gateway"]
  disable_api_termination = false
  instance_type = "t3.nano"
  key_name = "bboe"
  subnet_id = aws_subnet.public.0.id
  tags = { Name = "scoreboard-${var.environment}-util" }
  vpc_security_group_ids = [aws_security_group.util.id]
}

resource "aws_db_instance" "scoreboard" {
  allocated_storage = 16
  allow_major_version_upgrade = false
  apply_immediately = false
  auto_minor_version_upgrade = true
  db_subnet_group_name = aws_db_subnet_group.group.id
  deletion_protection = true
  engine = "postgres"
  engine_version = "10.6"
  identifier = "sb-${var.environment}"
  instance_class = var.db_instance_class
  multi_az = true
  name = "scoreboard_${var.environment}"
  password = var.db_password
  skip_final_snapshot = false
  storage_type = "gp2"
  tags = { Name = "scoreboard-${var.environment}" }
  username = var.db_username
  vpc_security_group_ids = [aws_security_group.database.id]
}