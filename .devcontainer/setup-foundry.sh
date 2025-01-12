#!/bin/bash

if [ ! -d "/home/node/.foundryvtt" ]; then
    # Check if there is a .foundrycache folder in the workspace and it has at least one file
    if [ -d "/workspaces/ose/.foundrycache" ] && [ "$(ls -A /workspaces/ose/.foundrycache)" ]; then
        # Find the newest file in the .foundrycache directory
        cachedFoundryFile=$(ls -t /workspaces/ose/.foundrycache/*.zip | head -1)
        echo "Using cached FoundryVTT file $cachedFoundryFile"
        cp "/workspaces/ose/.foundrycache/$(basename "$cachedFoundryFile")" .
        foundryFile=$(basename "$cachedFoundryFile")
    else
        echo 'Please provide the FoundryVTT timed URL from https://foundryvtt.com/. Select the Linux/Node.js operating system.'
        read -p 'FoundryVTT URL: ' foundryUrl
        # Get the filename from the URL
        foundryFile=$(basename "$foundryUrl" | cut -d'?' -f1)
        echo "Downloading $foundryFile"
        curl -L "$foundryUrl" -o "$foundryFile"
        echo "Copying $foundryFile to .foundrycache"
        mkdir -p /workspaces/ose/.foundrycache
        cp "$foundryFile" /workspaces/ose/.foundrycache
    fi
    # quietly unzip the file
    echo "Unzipping $foundryFile"
    unzip "$foundryFile" -d /home/node/.foundryvtt > /dev/null
    rm "$foundryFile"
    mkdir -p /home/node/.foundrydata/Data/systems
fi

ln -s /workspaces/ose /home/node/.foundrydata/Data/systems/ose-dev