variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
}

variable "primary_domain" {
  description = "Primary domain name"
  type        = string
  default     = "hashhouseharriersjakarta.com"
}

variable "secondary_domain" {
  description = "Secondary domain name"
  type        = string
  default     = "jakartahash.com"
}
