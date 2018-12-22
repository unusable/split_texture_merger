#! /bin/bash

CMD_DIR=$(cd $(dirname $0);pwd)

node ${CMD_DIR}/index.js $1 $2
