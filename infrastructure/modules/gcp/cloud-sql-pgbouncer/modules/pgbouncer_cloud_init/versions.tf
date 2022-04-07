terraform {
  required_version = "1.1.7"
  experiments = [module_variable_optional_attrs]
  required_providers {
    cloudinit = "~> 1.0"
    template  = "~> 2.1"
  }
}
 