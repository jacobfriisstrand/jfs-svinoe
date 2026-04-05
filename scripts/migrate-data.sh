#!/bin/bash
# Migration script: Supabase -> Self-hosted Postgres
#
# Prerequisites:
#   1. Your Supabase project connection string (from Supabase dashboard -> Settings -> Database)
#   2. Your new Postgres connection string on Coolify
#   3. psql installed locally
#
# Usage:
#   chmod +x scripts/migrate-data.sh
#   ./scripts/migrate-data.sh

set -euo pipefail

echo "=== Svinø Data Migration: Supabase → Coolify Postgres ==="
echo ""

# --- Configuration ---
read -rp "Supabase DB connection string (postgresql://...): " SUPABASE_URL
read -rp "New Coolify DB connection string (postgresql://...): " COOLIFY_URL

DUMP_DIR="./migration-dump"
mkdir -p "$DUMP_DIR"

echo ""
echo "Step 1: Exporting data from Supabase..."

TABLES=("pages" "bookings" "calendar_settings" "tasks" "guide_entries")

for table in "${TABLES[@]}"; do
  echo "  Exporting $table..."
  psql "$SUPABASE_URL" -c "\\copy $table TO '$DUMP_DIR/$table.csv' WITH CSV HEADER"
done

echo ""
echo "Step 2: Running Prisma schema push on new database..."
DATABASE_URL="$COOLIFY_URL" npx prisma db push

echo ""
echo "Step 3: Importing data to new Postgres..."

# Enable uuid-ossp extension
psql "$COOLIFY_URL" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' 2>/dev/null || true

for table in "${TABLES[@]}"; do
  echo "  Importing $table..."
  # Read header from CSV and use it as column list to handle column order mismatches
  HEADER=$(head -1 "$DUMP_DIR/$table.csv")
  psql "$COOLIFY_URL" -c "\\copy $table($HEADER) FROM '$DUMP_DIR/$table.csv' WITH CSV HEADER"
done

echo ""
echo "=== Migration complete! ==="
echo ""
echo "Exported CSVs are in $DUMP_DIR/ for backup."
echo ""
echo "For storage files (images, guide-files), you need to:"
echo "  1. Download them from Supabase Storage dashboard"
echo "  2. Upload them to your S3/MinIO bucket with the same key paths:"
echo "     - cover-images/<pageId>  (e.g., cover-images/home, cover-images/check-ud)"
echo "     - guide-files/<filename>  (e.g., guide-files/abc123.pdf)"
echo ""
echo "Don't forget to update your .env with the new DATABASE_URL and S3 credentials."
