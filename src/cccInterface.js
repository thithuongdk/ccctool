var infoPath = "src\\info.json"

function resetTag(pathSrc) {
    RunCMDCommand("git -C " + pathSrc + " tag | ForEach-Object { git -C " + pathSrc + " tag -d $_ }");
    RunCMDCommand("git -C " + pathSrc + " fetch --tags");
}

function getTag(pathSrc) {
    resetTag(pathSrc);
    var srcBranch = RunCMDCommand("git -C " + pathSrc + " branch --show-current");
    document.getElementById("srcBranch").value = srcBranch;
    var preTag = "";
    if (srcBranch.includes("48.ccnc")) {
        preTag = "submissions/48.ccnc."
    } else if(srcBranch.includes("216.nmrm.51.ccic27")) {
        preTag = "submissions/216.nmrm.51.ccic27."
    } else if(srcBranch.includes("216.nmrm.51.ccrc")) {
        preTag = "submissions/216.nmrm.51.ccrc."
    } else {
        alert("err: tool not use for branch " + srcBranch);
        return;
    }
    var allLineTag = RunCMDCommand("git -C " + pathSrc + " tag -l \"*" + preTag + "*\" --sort=-creatordate | head -n 10");
    if(!allLineTag) {
        var tags = allLineTag.split(preTag);
        var lastTag = "";
        var lastTagNum = 0;
        for (var tag in tags) {
            var tagnum = parseInt(tag, 10);
            if (tagnum >= lastTagNum) {
                lastTagNum = tagnum;
                lastTag = tag;
            }
        }
        lastTag = preTag + lastTag;
        var newTagNum = lastTagNum + 1;
        var newTag = preTag + newTagNum;
        document.getElementById("tagOld").value = lastTag;
        document.getElementById("tagNew").value = newTag;
    }
}

function pushTag() {
    var pathSrc = document.getElementById("pathSrc").value;
    var newTag = document.getElementById("tagNew").value;
    var srcBranch = document.getElementById("srcBranch").value;
    if (tagNotExists()) {
        RunCMDCommand("git -C " + pathSrc + " tag -a " + newTag + " -m \"" + newTag + "\"");
        var pushCode = RunCMDCommand("git -C " + pathSrc + " push origin " + srcBranch);
        if(!pushCode) {
           alert("Err when push tag: " + newTag + " to branch: " + srcBranch + ", please check and rework")
        }
    } else {
        alert("new tag has been used! please back to change new tag or continue if bypass");
    }
}

function RunCMDCommand(command) {
    var shell = new ActiveXObject("WScript.Shell");
    var exec = shell.Exec("cmd.exe /c " + command);
    var output = "";

    while (exec.Status === 0) {
        //sleep(100); // Chờ cho lệnh hoàn tất
    }

    if (exec.ExitCode === 0) {
        output = exec.StdOut.ReadAll();
        return output
    } else {
        output = exec.StdErr.ReadAll();
        alert("err:" + output);
        return ""
    }
}

function OnInit() {
    var jsonContent = readJSONFile(infoPath);
    if(fileExists(jsonContent.input.srcHome)) {
        document.getElementById("pathSrc").value = jsonContent.input.srcHome;
        getTag(jsonContent.input.srcHome);
    } else {
        document.getElementById("pathSrc").value = ""
    }
}

function LoadSource() {
    var pathSrc = browseFolder();
    if(pathSrc) {
        document.getElementById("pathSrc").value = pathSrc;
        getTag(pathSrc);
        pathSrc = pathSrc.replace(/\\/g, "\\\\");
        var content = readFile(infoPath);
        content = content.replace("^ *\"srcHome\":.*$", "\"srcHome\": \"" + pathSrc + "\"")
        writeFile(infoPath, content);
    }
}

function tagNotExists() {
    var pathSrc = document.getElementById("pathSrc").value;
    var newTag = document.getElementById("tagNew").value;
    if(RunCMDCommand("git -C " + pathSrc + " tag | grep -q \"^" + newTag + "$\"")) {
        return false;
    }
    return true;
}

function updateBB() {
    var srcBranch = document.getElementById("srcBranch").value;
    var rootBranch = "";
    var bbPreBranch = "";
    if (srcBranch.includes("48.ccnc")) {
        rootBranch = "ccNC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccnc";
    } else if(srcBranch.includes("216.nmrm.51.ccic27")) {
        rootBranch = "ccIC27";
        bbPreBranch = "WEBOS_VERSION_starfish-ccic27";
    } else if(srcBranch.includes("216.nmrm.51.ccrc")) {
        rootBranch = "ccRC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccrc";
    } else {
    }
    var pathSrc = document.getElementById("pathSrc").value;
    var oldTag = document.getElementById("tagOld").value;
    var newTag = document.getElementById("tagNew").value;
    var bbSrcNewBranch = newTag.replace("submissions/", "")
    var newHash = RunCMDCommand("git -C " + pathSrc + " rev-parse " + newTag);
    var compareLog = RunCMDCommand("git -C " + pathSrc + " log --oneline --no-decorate " + oldTag + ".." + newTag).replaceAll("\"","");
    var listticket = compareLog.replace(/^\w* /g,"");
    var bbComment = "com.webos.app.home=" + newTag + "\n\n"
                    + ":Release Notes:\n"
                    + "Update Home\n\n"
                    + ":Detailed Notes:\n"
                    + "com.webos.app.home:\n"
                    + oldTag + ".." + newTag + "\n"
                    + compareLog + "\n\n"
                    + ":Testing Performed:\n"
                    + "Local test suite\n\n"
                    + ":QA Notes:\n"
                    + "N/A\n\n"
                    + ":Issues Addressed:\n"
                    + listticket + "\n\n"
                    + ":CCC Link:\n\n"
                    + ":Target Model:\n"
                    + rootBranch;
    document.getElementById("bbVersion").value = bbPreBranch + " = \"1.0.0-" + bbSrcNewBranch + "_" + newHash + "\"";
    document.getElementById("bbComment").value = bbComment;
}
function pushBB() {
    var srcBranch = document.getElementById("srcBranch").value;
    var bbPreBranch = "";
    if (srcBranch.includes("48.ccnc")) {
        rootBranch = "ccNC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccnc";
    } else if(srcBranch.includes("216.nmrm.51.ccic27")) {
        rootBranch = "ccIC27";
        bbPreBranch = "WEBOS_VERSION_starfish-ccic27";
    } else if(srcBranch.includes("216.nmrm.51.ccrc")) {
        rootBranch = "ccRC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccrc";
    } else {
    }
    var bbVersion = document.getElementById("bbVersion").value;
    var bbBranch = document.getElementById("bbBranch").value;
    var bbComment = document.getElementById("bbComment").value;
    var usename = RunCMDCommand("git -C " + pathSrc + " config --get user.email").split("@")[0]
    if(!usename) {
        alert("can not get usename")
        return;
    }

    var bbPath = ".\\MouseGrabb\\com.webos.app.home\\com.webos.app.home.bb"
    RunCMDCommand("rm -rf MouseGrabb");
    // RunCMDCommand("rmdir /s /q MouseGrabb");
    RunCMDCommand("git clone git@github.com:thithuongdk/MouseGrabb.git");
    RunCMDCommand("sed -i \"s/^ *" + bbPreBranch + " .*/" + bbVersion + "/\" " + bbPath);
    RunCMDCommand("git -C .\\MouseGrabb add " + bbPath)
    RunCMDCommand("git -C .\\MouseGrabb commit -m \"" + bbComment + "\"")
    var pushCode = RunCMDCommand("git -C .\\MouseGrabb push origin " + bbBranch)
    if(!pushCode) {
        alert("push bb error")
    }


    // var bbPath = ".\\meta-lg-webos\\meta-starfish-nvidia\\recipes-starfish\\com.webos.app.home\\com.webos.app.home.bb";
    // RunCMDCommand("rm -rf ./meta-lg-webos");
    // RunCMDCommand("git clone \"ssh://" + usename + "@gpro.lge.com:29418/nvidia/meta-lg-webos\" "  
    //                 + "&& (cd \"meta-lg-webos\" && mkdir -p `git rev-parse --git-dir`/hooks/ "
    //                 + "&& curl -Lo `git rev-parse --git-dir`/hooks/commit-msg http://gpro.lge.com/tools/hooks/commit-msg "
    //                 + "&& chmod +x `git rev-parse --git-dir`/hooks/commit-msg)")
    // RunCMDCommand("sed -i \"s/^ *" + bbPreBranch + " .*/" + bbVersion + "/\" " + bbPath);
    // RunCMDCommand("git -C .\\meta-lg-webos add " + bbPath)
    // RunCMDCommand("git -C .\\meta-lg-webos commit -m \"" + bbComment + "\"")
    // var pushCode = RunCMDCommand("git -C .\\meta-lg-webos push origin HEAD:refs/for/" + bbBranch)
    // if(!pushCode) {
    //     alert("push bb error")
    // }
}