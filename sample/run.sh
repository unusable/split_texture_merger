#! /bin/bash


CMD_DIR=$(cd $(dirname $0);pwd)

"${CMD_DIR}/../run-egret.sh" "${CMD_DIR}/UI.json"

"${CMD_DIR}/../run-lh.sh" "${CMD_DIR}/Sheet1.plist"

