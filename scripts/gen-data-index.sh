#!/usr/bin/env bash

{
  for year in data/*/; do
    file="data/$(basename "${year}").json"
    jq --slurp 'reduce .[] as $item ({}; . * $item)' "${year}"/*.json > "${file}"

    echo "{\"$(basename "${year}")\": {\"from\": $(jq -r 'keys | min' "${file}"), \"to\": $(jq -r 'keys | max' "${file}")}}"
  done
} | jq --slurp 'reduce .[] as $item ({}; . * $item)' > 'data/index.json'
