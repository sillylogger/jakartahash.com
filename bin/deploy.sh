#!/bin/bash
set -e

bundle exec jekyll build
gcloud storage rsync --recursive _site gs://hashhouseharriersjakarta.com

gcloud compute url-maps invalidate-cdn-cache hashhouseharriers-lb \
  --host hashhouseharriersjakarta.com \
  --path "/index.html"
