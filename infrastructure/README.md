# Infrastructure Setup

This directory contains Terraform configuration and deployment scripts for hosting the Jekyll site on Google Cloud Storage.

## Setup

1. **Configure Terraform variables:**
   Edit `terraform/terraform.tfvars` and replace `your-gcp-project-id` with your actual Google Cloud Project ID.

2. **Initialize and deploy infrastructure:**
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

3. **Configure DNS in Namecheap:**
   After running terraform apply, use the IP addresses from the output to configure DNS:
   ```bash
   terraform output
   ```

4. **Deploy your site:**
   ```bash
   cd ..  # back to project root
   ./infrastructure/scripts/deploy.sh
   ```

## Directory Structure

- `terraform/` - Terraform configuration files
- `scripts/` - Deployment and utility scripts

## Commands

- **Deploy infrastructure:** `cd infrastructure/terraform && terraform apply`
- **Deploy site:** `./infrastructure/scripts/deploy.sh`
- **Get IP addresses:** `cd infrastructure/terraform && terraform output`
- **Destroy infrastructure:** `cd infrastructure/terraform && terraform destroy`
