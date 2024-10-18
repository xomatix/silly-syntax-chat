#!/bin/bash
# putty.exe matswie@lab.kis.agh.edu.pl -pw qwgejtma8b9q -L 8080:localhost:8080 -m commands.sh -t

cd ss2
# check if backend is running

PROGRAM_NAME="./silly-syntax-backend-bonanza"
# $PROGRAM_NAME &

# Check if the program is running using ps and grep
if ps aux | grep -v grep | grep -q "$PROGRAM_NAME"
then
    echo "$PROGRAM_NAME is already running."
else
    echo "$PROGRAM_NAME is not running. Starting $PROGRAM_NAME..."
    # Start the program
    $PROGRAM_NAME &
    echo "$PROGRAM_NAME started."
fi


bash