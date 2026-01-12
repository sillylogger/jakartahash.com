#!/usr/bin/env ruby
# Process source images to web-optimized WebP
# Usage: ruby scripts/process-images.rb

require 'fileutils'
require 'date'

SOURCE_DIR = '_source/img'
OUTPUT_DIR = 'assets/img'
MAX_SIZE = 1280
QUALITY = 80

# Change to project root
Dir.chdir(File.expand_path('..', __dir__))

# Check for ImageMagick
unless system('which magick > /dev/null 2>&1')
  puts "Error: ImageMagick not found"
  puts "Install with: brew install imagemagick"
  exit 1
end

FileUtils.mkdir_p(OUTPUT_DIR)

# Extract date from filename - tries multiple patterns
def extract_date(filename)
  # YYYYMMDD at start (e.g., 20160327_155351_HDR.jpg)
  if filename =~ /^(\d{4})(\d{2})(\d{2})/
    return "#{$1}-#{$2}-#{$3}"
  end

  # YYYY-MM-DD at start (e.g., 2017-09-03 11.41.52-1.jpg)
  if filename =~ /^(\d{4}-\d{2}-\d{2})/
    return $1
  end

  # IMG-YYYYMMDD or VID-YYYYMMDD (e.g., IMG-20220827-WA0020.jpg)
  if filename =~ /(?:IMG|VID)-(\d{4})(\d{2})(\d{2})/
    return "#{$1}-#{$2}-#{$3}"
  end

  # WhatsApp Image YYYY-MM-DD (e.g., WhatsApp Image 2019-08-19 at 14.21.49.jpeg)
  if filename =~ /WhatsApp.*(\d{4}-\d{2}-\d{2})/
    return $1
  end

  # PC + digits (camera files, no date)
  'unknown-date'
end

puts "Processing images from #{SOURCE_DIR} to #{OUTPUT_DIR}"
puts "Max size: #{MAX_SIZE}px, Quality: #{QUALITY}%"
puts

# Find all image files (not videos) - use case-insensitive glob and dedupe
files = Dir.glob("#{SOURCE_DIR}/*.{jpg,jpeg,heic,png}", File::FNM_CASEFOLD).uniq

if files.empty?
  puts "No images found in #{SOURCE_DIR}"
  exit 0
end

# Sort by extracted date
files_with_dates = files.map do |file|
  filename = File.basename(file)
  date = extract_date(filename)
  [date, file, filename]
end.sort_by { |date, _, _| date }

# Track counts per date for sequential numbering
date_counts = Hash.new(0)
total = files_with_dates.size

files_with_dates.each_with_index do |(date, file, filename), i|
  date_counts[date] += 1
  seq = format('%03d', date_counts[date])

  output_name = "#{date}-#{seq}.webp"
  output_path = "#{OUTPUT_DIR}/#{output_name}"

  puts "[#{i + 1}/#{total}] #{filename} -> #{output_name}"

  # Convert with ImageMagick
  system('magick', file, '-resize', "#{MAX_SIZE}x#{MAX_SIZE}>", '-quality', QUALITY.to_s, output_path)
end

puts
puts "Done! Processed #{total} images to #{OUTPUT_DIR}"
