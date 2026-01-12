#!/usr/bin/env ruby
# Process source images to web-optimized WebP
# Usage: ruby scripts/process-images.rb
#
# Source structure:
#   _source/img/headline/  -> Hero slideshow images
#   _source/img/gallery/   -> Photo pile images
#
# Output structure:
#   assets/img/headline/   -> Processed hero images
#   assets/img/gallery/    -> Processed pile images
#
# Data files generated:
#   _data/headline_images.yml
#   _data/gallery_images.yml

require 'fileutils'
require 'date'
require 'yaml'

SOURCE_DIR = '_source/img'
OUTPUT_DIR = 'assets/img'
DATA_DIR = '_data'
SUBFOLDERS = %w[headline gallery]
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

# Process a subfolder
def process_subfolder(subfolder)
  source_path = "#{SOURCE_DIR}/#{subfolder}"
  output_path = "#{OUTPUT_DIR}/#{subfolder}"

  unless Dir.exist?(source_path)
    puts "Skipping #{subfolder}/ - folder not found"
    return []
  end

  FileUtils.mkdir_p(output_path)

  # Find all image files - use case-insensitive glob and dedupe
  files = Dir.glob("#{source_path}/*.{jpg,jpeg,heic,png}", File::FNM_CASEFOLD).uniq

  if files.empty?
    puts "No images found in #{source_path}"
    return []
  end

  puts "Processing #{files.size} images from #{source_path}"

  # Sort by extracted date
  files_with_dates = files.map do |file|
    filename = File.basename(file)
    date = extract_date(filename)
    [date, file, filename]
  end.sort_by { |date, _, _| date }

  # Track counts per date for sequential numbering
  date_counts = Hash.new(0)
  processed = []

  files_with_dates.each_with_index do |(date, file, filename), i|
    date_counts[date] += 1
    seq = format('%03d', date_counts[date])

    output_name = "#{date}-#{seq}.webp"
    full_output_path = "#{output_path}/#{output_name}"

    puts "  [#{i + 1}/#{files.size}] #{filename} -> #{output_name}"

    # Convert with ImageMagick
    system('magick', file, '-resize', "#{MAX_SIZE}x#{MAX_SIZE}>", '-quality', QUALITY.to_s, full_output_path)

    # Track for YAML output
    processed << {
      'src' => "/assets/img/#{subfolder}/#{output_name}",
      'date' => date
    }
  end

  processed
end

puts "Image Processing Pipeline"
puts "========================="
puts "Max size: #{MAX_SIZE}px, Quality: #{QUALITY}%"
puts

FileUtils.mkdir_p(DATA_DIR)

total_processed = 0

SUBFOLDERS.each do |subfolder|
  puts
  images = process_subfolder(subfolder)

  if images.any?
    yaml_file = "#{DATA_DIR}/#{subfolder}_images.yml"
    File.write(yaml_file, images.to_yaml)
    puts "  -> Generated #{yaml_file} (#{images.size} images)"
    total_processed += images.size
  end
end

puts
puts "========================="
puts "Done! Processed #{total_processed} images total"

if total_processed == 0
  puts
  puts "No images found. Make sure to add images to:"
  puts "  #{SOURCE_DIR}/headline/  (for hero slideshow)"
  puts "  #{SOURCE_DIR}/gallery/   (for photo pile)"
end
