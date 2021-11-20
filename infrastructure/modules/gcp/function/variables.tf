variable "project" {}
variable "name" {}
variable "source_dir" {
    description = "The source directory"
}
variable "entry_point" {
    type = "string"
    default = "handler"
    description = "The entry function to utilise"
}
variable "source_route" {
    type = "string"
    default = "./lib/index.js"
    ddescription = "The default route inside the package to the entry file" 
}
variable "environment_variables" {}