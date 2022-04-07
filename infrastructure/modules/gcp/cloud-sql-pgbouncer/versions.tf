terraform {
  required_version = ">= 0.13.0"
  experiments = [module_variable_optional_attrs]
  required_providers {
    google = ">= 3.5"
    null   = ">= 3.0"
  }
}
