output "primary_bucket_name" {
  description = "Name of the primary storage bucket"
  value       = google_storage_bucket.primary_site.name
}

output "secondary_bucket_name" {
  description = "Name of the secondary storage bucket"
  value       = google_storage_bucket.secondary_site.name
}

output "site_ip_address" {
  description = "IP address for both domains"
  value       = google_compute_global_address.site_ip.address
}

output "primary_bucket_url" {
  description = "URL of the primary bucket website"
  value       = "https://storage.googleapis.com/${google_storage_bucket.primary_site.name}/index.html"
}

output "secondary_bucket_url" {
  description = "URL of the secondary bucket website"
  value       = "https://storage.googleapis.com/${google_storage_bucket.secondary_site.name}/index.html"
}
