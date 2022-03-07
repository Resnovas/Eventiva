variable "project" {}
variable "name" {}
variable "source_dir" {
    description = "The source directory"
}
variable "entry_point" {
    type = string
    default = "handler"
    description = "The entry function to utilise"
}
variable "environment_variables" {}