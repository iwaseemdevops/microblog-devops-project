variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"  
}

variable "project_name" {
  description = "Name of the project for resource tagging"
  type        = string
  default     = "microblog-fullstack"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"  # Free tier eligible
}