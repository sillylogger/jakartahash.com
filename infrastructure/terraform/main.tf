terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Primary bucket for hashhouseharriersjakarta.com
resource "google_storage_bucket" "primary_site" {
  name          = var.primary_domain
  location      = var.region
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }

  uniform_bucket_level_access = true
}

# Secondary bucket for jakartahash.com (redirect)
resource "google_storage_bucket" "secondary_site" {
  name          = var.secondary_domain
  location      = var.region
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }

  uniform_bucket_level_access = true
}

# Make buckets publicly readable
resource "google_storage_bucket_iam_member" "primary_public_read" {
  bucket = google_storage_bucket.primary_site.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_storage_bucket_iam_member" "secondary_public_read" {
  bucket = google_storage_bucket.secondary_site.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Single IP address for both domains
resource "google_compute_global_address" "site_ip" {
  name = "hash-house-harriers-ip"
}

# Backend bucket for primary domain
resource "google_compute_backend_bucket" "primary_backend" {
  name        = "primary-site-backend"
  bucket_name = google_storage_bucket.primary_site.name
  enable_cdn  = true
}

# Backend bucket for secondary domain
resource "google_compute_backend_bucket" "secondary_backend" {
  name        = "secondary-site-backend"
  bucket_name = google_storage_bucket.secondary_site.name
  enable_cdn  = true
}

# Combined URL map with host-based routing
resource "google_compute_url_map" "site_url_map" {
  name            = "hash-house-harriers-url-map"
  default_service = google_compute_backend_bucket.primary_backend.id

  host_rule {
    hosts        = [var.primary_domain]
    path_matcher = "primary-site"
  }

  host_rule {
    hosts        = [var.secondary_domain]
    path_matcher = "secondary-site"
  }

  path_matcher {
    name            = "primary-site"
    default_service = google_compute_backend_bucket.primary_backend.id
  }

  path_matcher {
    name            = "secondary-site"
    default_service = google_compute_backend_bucket.secondary_backend.id
  }
}

# Single HTTPS proxy for both domains
resource "google_compute_target_https_proxy" "site_https_proxy" {
  name             = "hash-house-harriers-https-proxy"
  url_map          = google_compute_url_map.site_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.site_ssl.id]
}

# SSL certificate for both domains
resource "google_compute_managed_ssl_certificate" "site_ssl" {
  name = "hash-house-harriers-ssl"
  managed {
    domains = [var.primary_domain, var.secondary_domain]
  }
}

# Single HTTPS forwarding rule
resource "google_compute_global_forwarding_rule" "site_https" {
  name       = "hash-house-harriers-https-rule"
  target     = google_compute_target_https_proxy.site_https_proxy.id
  port_range = "443"
  ip_address = google_compute_global_address.site_ip.address
}

# Combined HTTP to HTTPS redirect
resource "google_compute_url_map" "site_http_redirect" {
  name = "hash-house-harriers-http-redirect"
  
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "site_http_proxy" {
  name    = "hash-house-harriers-http-proxy"
  url_map = google_compute_url_map.site_http_redirect.id
}

resource "google_compute_global_forwarding_rule" "site_http" {
  name       = "hash-house-harriers-http-rule"
  target     = google_compute_target_http_proxy.site_http_proxy.id
  port_range = "80"
  ip_address = google_compute_global_address.site_ip.address
}
