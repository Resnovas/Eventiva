locals {
  timestamp = formatdate("YYMMDDhhmmss", timestamp())
  package_data = jsondecode(file("./../../projects/${var.source_dir}/package.json"))
  package_name = join("-", split("/", trim(local.package_data.name, "@")))
}

# open the npm package
resource "null_resource" "pack" {
  provisioner "local-exec" {
    working_dir = "./../../projects/${var.source_dir}"
    command = "pnpm pack --pack-destination=temp && cd temp && tar -xf ${local.package_name}-${local.package_data.version}.tgz"
  }
}

# install the npm packages
resource "null_resource" "source" {
  depends_on = [ null_resource.pack ]
  provisioner "local-exec" {
    working_dir = "./../../projects/${var.source_dir}/temp/package"
    command = "npm install && rmdir /s /q node_modules"
  }
}

data "archive_file" "source" {
  depends_on = [ null_resource.source ]
  type        = "zip"
  source_dir  = "./../../projects/${var.source_dir}/temp/package"
  output_path = "/tmp/function-${var.name}-${local.timestamp}.zip"
}

# Create bucket that will host the source code
resource "google_storage_bucket" "bucket" {
  name = "${var.project}-${var.name}function"
  location = "EU"
}

# Add source code zip to bucket
resource "google_storage_bucket_object" "zip" {
  depends_on = [
    data.archive_file.source
  ]
  # Append file MD5 to force bucket to be recreated
  name   = "source.zip#${data.archive_file.source.output_md5}"
  bucket = google_storage_bucket.bucket.name
  source = data.archive_file.source.output_path
}

# Enable Cloud Functions API
resource "google_project_service" "cf" {
  project = var.project
  service = "cloudfunctions.googleapis.com"

  disable_dependent_services = true
  disable_on_destroy         = false
}

# Enable Cloud Build API
resource "google_project_service" "cb" {
  project = var.project
  service = "cloudbuild.googleapis.com"

  disable_dependent_services = true
  disable_on_destroy         = false
}

# Create Cloud Function
resource "google_cloudfunctions_function" "function" {
  depends_on = [
    google_storage_bucket_object.zip
  ]
  name    = var.name
  runtime = "nodejs14"

  available_memory_mb   = 2048
  source_archive_bucket = google_storage_bucket.bucket.name
  source_archive_object = google_storage_bucket_object.zip.name
  trigger_http          = true
  entry_point           = var.entry_point
  environment_variables = var.environment_variables
  timeouts {
    create = "60m"
    update = "60m"
  }
}

# Create IAM entry so all users can invoke the function
resource "google_cloudfunctions_function_iam_member" "invoker" {
  depends_on = [
    google_cloudfunctions_function.function
  ]
  project        = google_cloudfunctions_function.function.project
  region         = google_cloudfunctions_function.function.region
  cloud_function = google_cloudfunctions_function.function.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}
