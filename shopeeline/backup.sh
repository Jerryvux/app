#!/bin/bash

# Backup database
backup_database() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="/backup/testShopee_db_${timestamp}.sql"
    
    docker-compose exec -T mysql mysqldump -u shopeeline -p shopeeline_pass testShopee_db > "$backup_file"
    echo "Database backed up to $backup_file"
}

# Restore database
restore_database() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        echo "Backup file not found: $backup_file"
        exit 1
    fi
    
    docker-compose exec -T mysql mysql -u shopeeline -p shopeeline_pass testShopee_db < "$backup_file"
    echo "Database restored from $backup_file"
}

# List backups
list_backups() {
    echo "Available backups:"
    ls /backup/*.sql
}

# Main menu
case "$1" in
    backup)
        backup_database
        ;;
    restore)
        if [ -z "$2" ]; then
            echo "Please provide a backup file to restore"
            exit 1
        fi
        restore_database "$2"
        ;;
    list)
        list_backups
        ;;
    *)
        echo "Usage: $0 {backup|restore <file>|list}"
        exit 1
esac
