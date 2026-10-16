#!/bin/sh
# Creates the local media bucket with public read, mirroring CloudFront access in production.
set -e
S3="aws --endpoint-url http://s3:9000 s3api"
until $S3 list-buckets >/dev/null 2>&1; do sleep 1; done
$S3 create-bucket --bucket angadi-media-dev >/dev/null 2>&1 || true
$S3 put-bucket-policy --bucket angadi-media-dev --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": ["s3:GetObject"],
    "Resource": ["arn:aws:s3:::angadi-media-dev/*"]
  }]
}'
$S3 put-bucket-cors --bucket angadi-media-dev --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"]
  }]
}' || echo "CORS not supported by local S3; continuing"
echo "Local S3 bucket ready"
