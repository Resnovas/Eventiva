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

# Build the package
resource "null_resource" "build" {
  provisioner "local-exec" {
    working_dir = "./../../"
    command = "rush build"
  }
}

module "siacheck" {
  depends_on = [ null_resource.build ]
  name        = "siacheck"
  source      = "../modules/gcp/function"
  project     = var.project
  source_dir  = "functions/siacheck"
  entry_point = "google"
  environment_variables = {}
}

module "axlr8" {
  depends_on = [ null_resource.build ]
  name        = "axlr8"
  source      = "../modules/gcp/function"
  project     = var.project
  source_dir  = "functions/axlr8"
  entry_point = "google"
  environment_variables = {}
}