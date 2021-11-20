terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "3.5.0"
    }
  }
}

locals {
  env = "development"
}

provider "google" {
  credentials = file("service_account.json")
  project = var.project
  region  = var.region
  zone    = var.zone
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
  source_route = "./lib/index.cjs"
  entry_point = "handler"
  environment_variables = {}
}