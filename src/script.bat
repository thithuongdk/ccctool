@echo off
echo Hello from the batch file!
pause

#!/bin/bash
 
############################################################
# Update tag of HOME app
#
# get branch of Home
# get lastest tag and new tag for this commit at Home
#
############################################################
 
############################################################
# PATH_SOURCE="D:\repo_LG\com.webos.app.home"
PATH_SOURCE=$1
PATH_JSON=$2
 
############################################################
 
PATH_SOURCE="${PATH_SOURCE//\\//}"
PATH_JSON="${PATH_JSON//\\\\/\\}"


HOME_BRANCH=$(git -C "$PATH_SOURCE" branch --show-current)
WEBOS_VERSION_BRANCH=""
# 216.nmrm.51.ccrc|216.nmrm.51.ccic27|170.poip|48.ccnc|ccrc.221.toyota
if [[ "$HOME_BRANCH" == *"48.ccnc"* ]]; then
    HOME_BRANCH_TAG=submissions/48.ccnc.
elif [[ "$HOME_BRANCH" == *"216.nmrm.51.ccic27"* ]]; then
    HOME_BRANCH_TAG=submissions/216.nmrm.51.ccic27.
elif [[ "$HOME_BRANCH" == *"216.nmrm.51.ccrc"* ]]; then
    HOME_BRANCH_TAG=submissions/216.nmrm.51.ccrc.
else
    exit 1
fi
 
# xóa các tag local
ALL_DEL_TAG=$(git -C "$PATH_SOURCE" tag | xargs git -C "$PATH_SOURCE" tag -d)
git -C "$PATH_SOURCE" fetch --tags -q
 
ALL_BRANCH_TAG=$(git -C "$PATH_SOURCE" tag -l "*$HOME_BRANCH_TAG*" --sort=-creatordate | head -n 10)
MAX_NUMBER=0
LAST_BRANCH_TAG=$(echo "$ALL_BRANCH_TAG" | while read -r LINE_TMP; do
                    LINE_NUM_TMP=${LINE_TMP#*$HOME_BRANCH_TAG}.
                    THIS_NUMBER=$(echo "$LINE_NUM_TMP" | sed -n 's/^\([0-9]*\).*/\1/p')
                    if [ "$THIS_NUMBER" -gt "$MAX_NUMBER" ]; then
                        MAX_NUMBER=$(echo "$THIS_NUMBER" | tr -d '.')
                        MAX_LINE="$LINE_TMP"
                        echo "$MAX_LINE"
                    fi
                  done| tail -n 1)
 
LAST_BRANCH_TAG_NUM=${LAST_BRANCH_TAG#*$HOME_BRANCH_TAG}.   # Xóa phần trước ALL_BRANCH_TAG
LAST_BRANCH_TAG_NUM=${LAST_BRANCH_TAG_NUM%%.*}           # Xóa phần sau dấu chấm đầu tiên
NEW_BRANCH_TAG_NUM=$((1+LAST_BRANCH_TAG_NUM))
NEW_BRANCH_TAG=$HOME_BRANCH_TAG$NEW_BRANCH_TAG_NUM

LAST_BRANCH_TAG="${LAST_BRANCH_TAG//\//\\\/}"
NEW_BRANCH_TAG="${NEW_BRANCH_TAG//\//\\\/}"
# echo "PATH_SOURCE=$PATH_SOURCE"
# echo "PATH_JSON=$PATH_JSON"
# echo "ALL_BRANCH_TAG=$ALL_BRANCH_TAG"
# echo "LAST_BRANCH_TAG=$LAST_BRANCH_TAG"
# echo "NEW_BRANCH_TAG=$NEW_BRANCH_TAG"

sed -i "s/\(.*\"branchHome\":\).*/\1 \"$HOME_BRANCH\",/" $PATH_JSON
sed -i "s/\(.*\"tagOld\":\).*/\1 \"$LAST_BRANCH_TAG\",/" $PATH_JSON
sed -i "s/\(.*\"tagNew\":\).*/\1 \"$NEW_BRANCH_TAG\",/" $PATH_JSON

# read -p "Nhấn Enter để THOÁT..."