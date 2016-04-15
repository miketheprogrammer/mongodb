#!/usr/bin/env bash

set -u
set -e

readonly VERSION="1.0.0"
readonly SELF="$(basename $0)"
readonly BUILDTOOLS_PATH="$(dirname $0)"

usage () {
    cat <<EOF
Usage:
$SELF <region> <env> <cluster_name>   Build Search AMI
$SELF -h | --help        Print this help message
$SELF --version          Print the version
EOF
}

version () {
    echo "$SELF v$VERSION"
}

build () {
    region=$1
    environment=${2:-prod}
    cluster_name=${3:-deis-mongodb}

    packer build \
        -var-file "$BUILDTOOLS_PATH/provisioning/packer.json" \
        -var "account=$region" \
        -var "env=$environment" \
        -var "cluster_name=$cluster_name" \
        $BUILDTOOLS_PATH/provisioning/packer/mongodb.json
}

if [ "$#" -lt "1" ]; then
    version
    usage
    exit 2
fi

case $1 in
    -h|--help)
        version
        usage
        ;;
    --version)
        version
        ;;
    *)
        if [ "$#" -lt "1" ]; then
            version
            usage
            exit 2
        fi
        build $@
        ;;
esac
