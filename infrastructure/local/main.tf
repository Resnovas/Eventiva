locals {
  env = "development"
}

provider "google" {
  project = var.project
  region  = var.region
}

module "function" {
  name        = "managerdatabasehandler"
  source      = "../../modules/function"
  project     = var.project
  source_dir  = "./../src/functions/database"
  entry_point = "app/lib"
  environment_variables = {
    "DATABASE_URL" = "postgresql://"
  }
}
