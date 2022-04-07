terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "4.15.0"
    }
    null = {
      source = "hashicorp/null"
      version = "3.1.1"
    }
  }
}

provider "null" {
  # Configuration options
}

locals {
  env = "development"
  region = join("-", slice(split("-", var.zone), 0, 2))
}

provider "google" {
  credentials = file(".terraform.service.json")
  project = var.project
  region  = local.region
  zone    = var.zone
}

provider "google-beta" {
  credentials = file(".terraform.service.json")
  project = var.project
  region  = local.region
  zone    = var.zone
}

/* Functions ----------------------------------------------------------------- */

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

module "profile-pdf" {
  depends_on = [ null_resource.build ]
  name        = "pdf"
  source      = "../modules/gcp/function"
  project     = var.project
  source_dir  = "functions/pdf"
  entry_point = "google"
  environment_variables = {}
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

/* Database ---------------------------------------------------------------- */

# resource "random_id" "suffix" {
#   byte_length = 5
# }

# data "google_compute_subnetwork" "subnet" {
#   project = var.project
#   name    = var.subnetwork_name
#   region  = local.region
# }

# module "private_service_access" {
#   source  = "GoogleCloudPlatform/sql-db/google//modules/private_service_access"
#   version = "10.0.0"
#   project_id  = var.project
#   vpc_network = var.network_name
# }

# module "db" {
#   source  = "GoogleCloudPlatform/sql-db/google//modules/postgresql"
#   version = "10.0.0"
#   project_id = var.project
#   name       = "db-${random_id.suffix.hex}"

#   database_version = "POSTGRES_12"
#   region           = local.region
#   zone             = var.zone
#   tier             = "db-f1-micro"

#   db_name       = var.db_name
#   user_name     = var.db_user
#   user_password = var.db_password

#   ip_configuration = {
#     ipv4_enabled        = false
#     private_network     = data.google_compute_subnetwork.subnet.network
#     require_ssl         = false
#     authorized_networks = []
#     allocated_ip_range = null,
#   }

#   module_depends_on = [module.private_service_access.peering_completed]
#   depends_on = [
#     null_resource.build
#   ]
# }

/* PgBouncer ---------------------------------------------------------------- */

# resource "google_compute_address" "pgbouncer" {
#   project      = var.project
#   region       = local.region
#   name         = "ip-pgbouncer-${random_id.suffix.hex}"
#   network_tier = "PREMIUM"
# }

# module "pgbouncer" {
#   source  = "../modules/gcp/cloud-sql-pgbouncer"
#   # version = "1.2.0"

#   project           = var.project
#   name              = "vm-pgbouncer-${random_id.suffix.hex}"
#   zone              = var.zone
#   subnetwork        = var.subnetwork_name
#   public_ip_address = google_compute_address.pgbouncer.address
#   tags              = ["pgbouncer"]

#   disable_service_account = true

#   port          = 25128
#   database_host = module.db.private_ip_address

#   users = [
#     { name = var.db_user, password = var.db_password },
#   ]

#   module_depends_on = [module.db]
# }

/* Firewall ----------------------------------------------------------------- */

# resource "google_compute_firewall" "pgbouncer" {
#   name    = "${var.network_name}-ingress-pgbouncer-${random_id.suffix.hex}"
#   project = var.project
#   network = var.network_name

#   source_ranges = ["0.0.0.0/0"]
#   target_tags   = ["pgbouncer"]

#   allow {
#     protocol = "tcp"
#     ports    = [module.pgbouncer.port]
#   }
# }