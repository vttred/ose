for keyval in $(grep -E '": [^\{]' ../foundryconfig.json | sed -e 's/: /=/' -e "s/\(\,\)$//"); do
    eval export $keyval
done
sed "s/\"name\": \"swords-and-wizardry-dev\",/\"name\": \"$symlinkName\",/g" $@
sed "s/\"id\": \"swords-and-wizardry-dev\",/\"id\": \"$symlinkName\",/g" $@
