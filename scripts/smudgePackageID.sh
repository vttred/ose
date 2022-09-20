for keyval in $(grep -E '": [^\{]' ../foundryconfig.json | sed -e 's/: /=/' -e "s/\(\,\)$//"); do
    eval export $keyval
done
sed "s/\"name\": \"ose-dev\",/\"name\": \"$symlinkName\",/g" $@
sed "s/\"id\": \"ose-dev\",/\"id\": \"$symlinkName\",/g" $@
