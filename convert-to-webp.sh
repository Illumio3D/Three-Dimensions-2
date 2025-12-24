#!/bin/bash

# Script to convert PNG/JPEG images to WebP format
# Requires: cwebp (install via: brew install webp on macOS)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}Error: cwebp is not installed.${NC}"
    echo "Install it with: brew install webp (on macOS)"
    echo "Or download from: https://developers.google.com/speed/webp/download"
    exit 1
fi

# Quality setting (0-100, 80 is a good balance)
QUALITY=80

# Counter
CONVERTED=0
SKIPPED=0

echo -e "${GREEN}Starting WebP conversion...${NC}\n"

# Convert PNG files
for img in *.png; do
    if [ -f "$img" ]; then
        webp_file="${img%.png}.webp"
        if [ ! -f "$webp_file" ]; then
            echo -e "${YELLOW}Converting: $img${NC}"
            cwebp -q $QUALITY "$img" -o "$webp_file"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Created: $webp_file${NC}"
                ((CONVERTED++))
            else
                echo -e "${RED}✗ Failed: $img${NC}"
            fi
        else
            echo -e "Skipping: $img (WebP already exists)"
            ((SKIPPED++))
        fi
    fi
done

# Convert JPG/JPEG files
for img in *.jpg *.JPG *.jpeg *.JPEG; do
    if [ -f "$img" ]; then
        webp_file="${img%.*}.webp"
        if [ ! -f "$webp_file" ]; then
            echo -e "${YELLOW}Converting: $img${NC}"
            cwebp -q $QUALITY "$img" -o "$webp_file"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Created: $webp_file${NC}"
                ((CONVERTED++))
            else
                echo -e "${RED}✗ Failed: $img${NC}"
            fi
        else
            echo -e "Skipping: $img (WebP already exists)"
            ((SKIPPED++))
        fi
    fi
done

echo -e "\n${GREEN}Conversion complete!${NC}"
echo "Converted: $CONVERTED files"
echo "Skipped: $SKIPPED files"


