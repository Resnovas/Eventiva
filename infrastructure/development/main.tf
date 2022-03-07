terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "3.5.0"
    }
    null = {
      source = "hashicorp/null"
      version = "3.1.0"
    }
  }
}

provider "null" {
  # Configuration options
}
provider "google" {
  credentials = file(".terraform.service.json")
  project = var.project
  region  = var.region
  zone    = var.zone
}
locals {
  env = "development"
}
# module "function" {
#   name        = "managerdatabasehandler"
#   source      = "../modules/gcp/function"
#   project     = var.project
#   source_dir  = "functions/database"
#   entry_point = "app/lib"
#   environment_variables = {
#     "DATABASE_URL" = "postgresql://"
#   }
# }

module "function" {
  name        = "siacheck"
  source      = "../modules/gcp/function"
  project     = var.project
  source_dir  = "functions/siacheck"
  entry_point = "google"
  environment_variables = {}
}