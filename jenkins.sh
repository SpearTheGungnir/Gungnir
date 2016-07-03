#!/bin/bash
# 杀死监听3000端口的进程
node_pid=$(lsof -t -i:3000)
# [ -n str ]判断str是否不为空，⑨表示强制
[ -n "$node_pid" ] && kill -9 $node_pid

rm -rf /home/myapp
cp -r ${WORKSPACE}/source/server/myapp /home
cd /home/myapp
npm install

BUILD_ID=DONTKILLME
# 这里肯定有bug，按官方的说明只需BUILD_ID=DONTKILLME即可不杀死子进程，然而并没有什么卵用。经过1个多小时的实验，无意发现加上一句输出后就会正常
echo ${BUILD_ID}
# nohup后台运行
nohup npm start&
