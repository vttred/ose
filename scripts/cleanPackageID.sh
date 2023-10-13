for keyval in $(grep -E '": [^\{]' ../foundryconfig.json | sed -e 's/: /=/' -e "s/\(\,\)$//"); do
    eval export $keyval
done
sed "s/\"name\": \"$symlinkName\",/\"name\": \"swords-and-wizardry-dev\",/g' $@
sed 's/\"id\": \"$symlinkName\",/\"id\": \"swords-and-wizardry-dev\",/g' $@
