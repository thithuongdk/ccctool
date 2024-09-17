#!/bin/bash
 
############################################################
# Update tag of HOME app
#
# commit with log lastestTag update to lastestTag+1 at bb branch webos-acp:
# $ ccc.sh
# output: submissions/216.nmrm.51.ccrc.249   ---> submissions/216.nmrm.51.ccrc.250 commit to bb branch webos-acp
# output: submissions/216.nmrm.51.ccrc.249.1 ---> submissions/216.nmrm.51.ccrc.250 commit to bb branch webos-acp
#
# commit with log $1 update to lastestTag+1 at bb branch webos-acp:
# $ ccc.sh submissions/216.nmrm.51.ccrc.238
# output: submissions/216.nmrm.51.ccrc.238   ---> submissions/216.nmrm.51.ccrc.250 commit to bb branch webos-acp
# $ ccc.sh submissions/216.nmrm.51.ccrc.235.1
# output: submissions/216.nmrm.51.ccrc.235.1 ---> submissions/216.nmrm.51.ccrc.250 commit to bb branch webos-acp
#
# commit with log $1 update to $2 at bb branch webos-acp:
# $ ccc.sh submissions/216.nmrm.51.ccrc.238.1 submissions/216.nmrm.51.ccrc.238.2
# output: submissions/216.nmrm.51.ccrc.238.1 ---> submissions/216.nmrm.51.ccrc.238.2 commit to bb branch webos-acp
#
# commit with log $1 update to $2 at bb branch $3:
# $ ccc.sh submissions/216.nmrm.51.ccrc.238.1 submissions/216.nmrm.51.ccrc.238.2 @webos-acp.197.23
# output: submissions/216.nmrm.51.ccrc.238.1 ---> submissions/216.nmrm.51.ccrc.238.2 commit to bb branch @webos-acp.197.23
#
############################################################
 
############################################################
# # linux:
# PATH_SOURCE=~/source/com.webos.app.home
# # window:
PATH_SOURCE="D:\repo_LG\com.webos.app.home"
 
############################################################
 
function ask_yes_no {
    read -p "$1 (y/n): " yn
    case $yn in
        [Nn]* ) return 1;;  # Trả về 1 nếu chọn No
    esac
    return 0;
}
 
PATH_SOURCE="${PATH_SOURCE//\\//}"
echo "PATH_SOURCE hiện tại: $PATH_SOURCE"
 
BB_BRANCH=webos-acp
BB_APP_VERSION=1.0.0
HOME_BRANCH=$(git -C "$PATH_SOURCE" branch --show-current)
echo "Branch hiện tại: $HOME_BRANCH"
WEBOS_VERSION_BRANCH=""
# 216.nmrm.51.ccrc|216.nmrm.51.ccic27|170.poip|48.ccnc|ccrc.221.toyota
if [[ "$HOME_BRANCH" == *"48.ccnc"* ]]; then
    HOME_BRANCH_TAG=submissions/48.ccnc.
    HOME_MODEL=ccNC
    WEBOS_VERSION=WEBOS_VERSION_starfish-ccnc
    WEBOS_VERSION_PRE=48.ccnc.
    if [ "$HOME_BRANCH" != "@48.ccnc" ]; then
        WEBOS_VERSION_BRANCH=";branch=$HOME_BRANCH"
    fi
elif [[ "$HOME_BRANCH" == *"216.nmrm.51.ccic27"* ]]; then
    HOME_BRANCH_TAG=submissions/216.nmrm.51.ccic27.
    HOME_MODEL=ccIC27
    WEBOS_VERSION=WEBOS_VERSION_starfish-ccic27
    WEBOS_VERSION_PRE=216.nmrm.51.ccic27.
    if [ "$HOME_BRANCH" != "@216.nmrm.51.ccic27" ]; then
        WEBOS_VERSION_BRANCH=";branch=$HOME_BRANCH"
    fi
elif [[ "$HOME_BRANCH" == *"216.nmrm.51.ccrc"* ]]; then
    HOME_BRANCH_TAG=submissions/216.nmrm.51.ccrc.
    HOME_MODEL=ccRC
    WEBOS_VERSION=WEBOS_VERSION_starfish-ccrc
    WEBOS_VERSION_PRE=216.nmrm.51.ccrc.
    if [ "$HOME_BRANCH" != "@216.nmrm.51.ccrc" ]; then
        WEBOS_VERSION_BRANCH=";branch=$HOME_BRANCH"
    fi
else
    echo "branch $HOME_BRANCH không co trong list setup"
    read -p "Nhấn Enter để THOÁT..."
    exit 1
fi
 
if [ -n "$3" ]; then
    BB_BRANCH=$3
fi
 
if [ -n "$2" ]; then
    echo "Tạo Tag cho branch $HOME_BRANCH_TAG từ Tag $1 -> Tag $2"
elif [ -n "$1" ]; then
    echo "Tạo Tag cho branch $HOME_BRANCH_TAG từ Tag $1 -> Tag mới"
else
    echo "Tạo Tag cho branch $HOME_BRANCH_TAG từ Tag gần nhất -> Tag mới "
fi
 
echo ""
# xóa các tag local
git -C "$PATH_SOURCE" tag | xargs git -C "$PATH_SOURCE" tag -d | echo "clear các local tag..."
git -C "$PATH_SOURCE" fetch --tags -q
 
if [ $? -ne 0 ]; then
    echo "Co loi xay ra khi clear tag"
    read -p "Nhấn Enter để THOÁT..."
    exit 1
fi
echo "done clear"
 
ALL_BRANCH_TAG=$(git -C "$PATH_SOURCE" tag -l "*$HOME_BRANCH_TAG*" --sort=-creatordate | head -n 10)
echo "ALL_BRANCH_TAG=$ALL_BRANCH_TAG"
 
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
 
echo "last branch tag: $LAST_BRANCH_TAG"
 
LAST_BRANCH_TAG_NUM=${LAST_BRANCH_TAG#*$HOME_BRANCH_TAG}.   # Xóa phần trước ALL_BRANCH_TAG
LAST_BRANCH_TAG_NUM=${LAST_BRANCH_TAG_NUM%%.*}           # Xóa phần sau dấu chấm đầu tiên
NEW_BRANCH_TAG_NUM=$((1+LAST_BRANCH_TAG_NUM))
NEW_BRANCH_TAG=$HOME_BRANCH_TAG$NEW_BRANCH_TAG_NUM
 
if [ -n "$1" ]; then
    LAST_BRANCH_TAG=$1
fi
if [ -n "$2" ]; then
    NEW_BRANCH_TAG=$2
    NEW_BRANCH_TAG_NUM=${NEW_BRANCH_TAG#*$HOME_BRANCH_TAG}
fi
 
echo "doing update tag: $LAST_BRANCH_TAG -> $NEW_BRANCH_TAG"
if git -C "$PATH_SOURCE" tag | grep -q "^$NEW_BRANCH_TAG$"; then
    echo "Tag '$NEW_BRANCH_TAG' đã tồn tại."
    read -p "Nhấn Enter để THOÁT..."
    exit 1
fi
 
if ! ask_yes_no "check xem thử, Bạn có muốn tiếp tục?"; then
    echo "Thoát khỏi script."
    exit 1
fi
 
# Kiểm tra lỗi sau khi chỉnh sửa
 
# # for test
# LAST_BRANCH_TAG=submissions/216.nmrm.51.ccic27.85
# NEW_BRANCH_TAG=submissions/216.nmrm.51.ccic27.87
# # NEW_HASH=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# # else
git -C "$PATH_SOURCE" tag -a $NEW_BRANCH_TAG -m "$NEW_BRANCH_TAG"
# git -C "$PATH_SOURCE" push origin $HOME_BRANCH
if [ $? -ne 0 ]; then
    echo "Co loi xay ra khi push tag"
    read -p "Nhấn Enter để THOÁT..."
    exit 1
fi
echo "tag hiện tại: $LAST_BRANCH_TAG -> $NEW_BRANCH_TAG"
echo ""
 
NEW_HASH=$(git -C "$PATH_SOURCE" rev-parse $NEW_BRANCH_TAG)
COMPARE_LOG=$(git -C "$PATH_SOURCE" log --oneline --no-decorate $LAST_BRANCH_TAG..$NEW_BRANCH_TAG)
COMPARE_LOG=${COMPARE_LOG//\"/}
NEW_LINE_WEBOS_VERSION="$WEBOS_VERSION = \"$BB_APP_VERSION-$WEBOS_VERSION_PRE${NEW_BRANCH_TAG_NUM}_$NEW_HASH$WEBOS_VERSION_BRANCH\""
LIST_TICKET=$(echo "$COMPARE_LOG" | sed 's/^[^ ]* //')
BB_COMMENT="com.webos.app.home=$NEW_BRANCH_TAG
 
:Release Notes:
Update Home
 
:Detailed Notes:
com.webos.app.home:
$LAST_BRANCH_TAG..$NEW_BRANCH_TAG
$COMPARE_LOG
 
:Testing Performed:
Local test suite
R
:QA Notes:
N/A
 
:Issues Addressed:
$LIST_TICKET
 
:CCC Link:
 
:Target Model:
$HOME_MODEL"
 
# Kiểm tra lỗi sau khi chỉnh sửa
if [ $? -ne 0 ]; then
    echo "Co loi xay ra khi get log"
    read -p "Nhấn Enter để THOÁT..."
    exit 1
fi
 
echo "compare tag hiện tại:"
echo "edit bb to: $NEW_LINE_WEBOS_VERSION"
echo ""
echo "comment bb:"
echo "$BB_COMMENT"
echo ""
if ! ask_yes_no "check xem thử, Bạn có muốn tiếp tục?"; then
    echo "Thoát khỏi script."
    exit 1
fi
 
 
PATH_BB=./meta-starfish-nvidia/recipes-starfish/com.webos.app.home/com.webos.app.home.bb
USEREMAIL=$(git -C "$PATH_SOURCE" config --get user.email)
USERNAME="${USEREMAIL%%@*}"
if [ -z "$USERNAME" ]; then
    echo "Co loi xay ra khi lay username tu $PATH_SOURCE"
    read -p "Nhấn Enter để THOÁT..."
    exit 1
fi
 
rm -rf ./meta-lg-webos
git clone "ssh://$USERNAME@gpro.lge.com:29418/nvidia/meta-lg-webos" && (cd "meta-lg-webos" && mkdir -p `git rev-parse --git-dir`/hooks/ && curl -Lo `git rev-parse --git-dir`/hooks/commit-msg http://gpro.lge.com/tools/hooks/commit-msg && chmod +x `git rev-parse --git-dir`/hooks/commit-msg)
if [ $? -ne 0 ]; then
    echo "Co loi xay ra khi clone meta-lg-webos"
    read -p "Nhấn Enter để THOÁT..."
    exit 1
fi
 
cd meta-lg-webos
sed -i "s/^"$WEBOS_VERSION" .*/$NEW_LINE_WEBOS_VERSION/" $PATH_BB
git add $PATH_BB
 
echo ""
echo "update WEBOS_VERSION bb file: $NEW_LINE_WEBOS_VERSION"
git commit -m "$BB_COMMENT"
# git push origin HEAD:refs/for/$BB_BRANCH
 
# # # PATH_BB_FOLDER
# # # PATH_BB
read -p "Nhấn Enter để THOÁT..."