terraform {
  backend "gcs" {
    bucket = "siacheck-tf-state"
    prefix = "env/development"
  }
}