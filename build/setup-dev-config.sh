#!/bin/sh
# Ensure config.js exists for development
# Downloads from manifest repository if not present

CONFIG_SOURCE_PATH="config/config.js"
CONFIG_DIST_PATH="dist/config.js"
FALLBACK_CONFIG_PATH="config/config.fallback.json"
CONFIG_JSON_URL="https://raw.githubusercontent.com/traPtitech/manifest/main/traq/frontend/config.json"

if [ -f "${CONFIG_SOURCE_PATH}" ]; then
    echo "config.js already exists at ${CONFIG_SOURCE_PATH}"
    
    cp "${CONFIG_SOURCE_PATH}" "${CONFIG_DIST_PATH}"
else
    echo "config.js not found, downloading from manifest repository..."
    
    # Download config.json and convert to config.js
    JSON=$(curl -fsSL "$CONFIG_JSON_URL" 2>/dev/null)
    
    if [ -z "${JSON}" ]; then
        echo "WARNING: Failed to download config.json from manifest repository"
        echo "Using fallback development config from ${FALLBACK_CONFIG_PATH}"
        
        if [ ! -f "${FALLBACK_CONFIG_PATH}" ]; then
            echo "ERROR: Fallback config not found at ${FALLBACK_CONFIG_PATH}"
            exit 1
        fi
        
        JSON=$(cat "${FALLBACK_CONFIG_PATH}")
    fi
    # Convert JSON to config.js format
    echo ";(() => { self.traQConfig = ${JSON} })()" > "${CONFIG_DIST_PATH}"
fi

echo "Successfully created ${CONFIG_DIST_PATH}"
