var infoPath = ".\\src\\info.json"

function resetTag(pathSrc, preTag) {
    // RunCMDCommand("for /f %i in ('git -C " + pathSrc + " tag -l \"*" + preTag + "*\" --sort=-creatordate') do git -C " + pathSrc + " tag -d %i");
    var allLineTag = RunCMDCommand("git -C " + pathSrc + " tag -l \"*" + preTag + "*\" --sort=-creatordate");
    if(allLineTag) {
        var tags = allLineTag.split(preTag);
        // check 20 element 
        var tagslength = Math.min(tags.length, 20);
        for (var i = 1; i < tagslength; i++) {
            RunCMDCommand("git -C " + pathSrc + " tag -d " + preTag + tags[i] );
        }
    }
    RunCMDCommand("git -C " + pathSrc + " fetch --tags");
}

function getTag(pathSrc) {
    // alert(pathSrc);
    var srcBranch = RunCMDCommand("git -C " + pathSrc + " branch --show-current");
    document.getElementById("srcBranch").value = srcBranch;
    var preTag = "";
    if (srcBranch.indexOf("48.ccnc")>=0) {
        preTag = "submissions/48.ccnc."
    } else if(srcBranch.indexOf("216.nmrm.51.ccic27")>=0) {
        preTag = "submissions/216.nmrm.51.ccic27."
    } else if(srcBranch.indexOf("216.nmrm.51.ccrc")>=0) {
        preTag = "submissions/216.nmrm.51.ccrc."
    } else {
        alert("err: tool not use for branch " + srcBranch);
        return;
    }
    resetTag(pathSrc, preTag);

    var allLineTag = RunCMDCommand("git -C " + pathSrc + " tag -l \"*" + preTag + "*\" --sort=-creatordate");
    if(allLineTag) {
        var tags = allLineTag.split(preTag);
        var lastTag = "";
        var lastTagNum = 0;
        // check 20 element 
        var tagslength = Math.min(tags.length, 20);
        for (var i = 1; i < tagslength; i++) {
            var tagnum = parseInt(tags[i], 10);
            if (tagnum >= lastTagNum) {
                lastTagNum = tagnum;
                lastTag = tags[i];
            }
        }
        lastTag = preTag + lastTag;
        var newTagNum = lastTagNum + 1;
        var newTag = preTag + newTagNum;
        document.getElementById("tagOld").value = lastTag;
        document.getElementById("tagNew").value = newTag;
    }
    writeFile(infoPath, readFile(infoPath).replace(/"srcHome":.*,/g,'"srcHome": "' + pathSrc.replace(/\\/g,"\\\\") + '",'));
    alert("load Tag complete");
}

function pushTag() {
    var pathSrc = document.getElementById("pathSrc").value;
    var srcBranch = document.getElementById("srcBranch").value;
    var newTag = document.getElementById("tagNew").value;
    if (RunCMDCommand("git -C " + pathSrc + " tag -l \"" + newTag + "\"") == "") {
        RunCMDCommand("git -C " + pathSrc + " tag -a " + newTag + " -m \"" + newTag + "\"");
        RunCMDCommand("git -C " + pathSrc + " push origin " + newTag);
        // alert("done push tag: " + newTag + " to branch: " + srcBranch);
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
    var pathSrc = jsonContent.input.srcHome.replace(/\\\\/g,"\\")
    if(folderExists(jsonContent.input.srcHome)) {
        document.getElementById("pathSrc").value = pathSrc;
        //getTag(pathSrc);
    } else if(folderExists(document.getElementById("pathSrc").value)) {
        //getTag(document.getElementById("pathSrc").value);
    } else {
        document.getElementById("pathSrc").value = ""
        alert("else");
    }
}

function LoadSource() {
    var pathSrc = browseFolder();
    if(pathSrc) {
        document.getElementById("pathSrc").value = pathSrc;
    } else {
        pathSrc = document.getElementById("pathSrc").value;
    }
    getTag(pathSrc);
    // writeFile(infoPath, readFile(infoPath).replace("^ *\"srcHome\":.*$", "\"srcHome\": \"" + pathSrc + "\""));
}

function updateBB() {
    var srcBranch = document.getElementById("srcBranch").value;
    var rootBranch = "";
    var bbPreBranch = "";
    if (srcBranch.indexOf("48.ccnc")>=0) {
        rootBranch = "ccNC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccnc";
    } else if(srcBranch.indexOf("216.nmrm.51.ccic27")>=0) {
        rootBranch = "ccIC27";
        bbPreBranch = "WEBOS_VERSION_starfish-ccic27";
    } else if(srcBranch.indexOf("216.nmrm.51.ccrc")>=0) {
        rootBranch = "ccRC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccrc";
    } else {
    }
    var pathSrc = document.getElementById("pathSrc").value;
    var oldTag = document.getElementById("tagOld").value;
    var newTag = document.getElementById("tagNew").value;
    var bbSrcNewBranch = newTag.replace("submissions/", "")
    var newHash = RunCMDCommand("git -C " + pathSrc + " rev-parse " + newTag).replace("\r", "").replace("\n", "");
    var compareLog = RunCMDCommand("git -C " + pathSrc + " log --oneline --no-decorate " + oldTag + ".." + newTag).replace(/"/g,"");
    var listticket = compareLog.replace(/^\w* /g,"");
    var bbComment = "com.webos.app.home=" + newTag + "\n\n"
                    + ":Release Notes:\n"
                    + "Update Home\n\n"
                    + ":Detailed Notes:\n"
                    + "com.webos.app.home:\n"
                    + oldTag + ".." + newTag + "\n"
                    + compareLog + "\n"
                    + ":Testing Performed:\n"
                    + "Local test suite\n\n"
                    + ":QA Notes:\n"
                    + "N/A\n\n"
                    + ":Issues Addressed:\n"
                    + listticket + "\n"
                    + ":CCC Link:\n\n"
                    + ":Target Model:\n"
                    + rootBranch;
    document.getElementById("bbVersion").value = bbPreBranch + " = \"1.0.0-" + bbSrcNewBranch + "_" + newHash + "\"";
    document.getElementById("bbComment").value = bbComment;
    document.getElementById("commitLink").value = "";
}

function pushBB() {
    var srcBranch = document.getElementById("srcBranch").value;
    var bbPreBranch = "";
    if (srcBranch.indexOf("48.ccnc")>=0) {
        rootBranch = "ccNC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccnc";
    } else if(srcBranch.indexOf("216.nmrm.51.ccic27")>=0) {
        rootBranch = "ccIC27";
        bbPreBranch = "WEBOS_VERSION_starfish-ccic27";
    } else if(srcBranch.indexOf("216.nmrm.51.ccrc")>=0) {
        rootBranch = "ccRC";
        bbPreBranch = "WEBOS_VERSION_starfish-ccrc";
    } else {
    }
    var bbVersion = document.getElementById("bbVersion").value;
    var bbBranch = document.getElementById("bbBranch").value;
    var bbComment = document.getElementById("bbComment").value;
    var pathSrc = document.getElementById("pathSrc").value;
    var usename = RunCMDCommand("git -C " + pathSrc + " config --get user.email").split("@")[0]
    if(!usename) {
        alert("can not get usename");
        return false;
    }

    var gitbbfolder = "gitbbfolder"
    var bbPath = "\\com.webos.app.home\\com.webos.app.home.bb"
    var preCommitLink = 'https://github.com/thithuongdk/ccctool/pull/new/'
    deleteFolder(gitbbfolder);
    RunCMDCommand("git clone git@github.com:thithuongdk/MouseGrabb.git -b \"" + bbBranch + "\" " + gitbbfolder);
    writeFile(gitbbfolder + bbPath, readFile(gitbbfolder + bbPath).replace(new RegExp(bbPreBranch + " *=.*"),bbVersion));
    RunCMDCommand("git -C " + gitbbfolder + " add ." + bbPath);
    RunCMDCommand("git -C " + gitbbfolder + " commit -m \"" + bbComment + "\"");
    var pushCode = RunCMDCommand("git -C " + gitbbfolder + " push origin \"" + bbBranch + "\"");
    // var commitLink = pushCode.replace(new RegExp(".*(" + preCommitLink + ".*)\s.*"),/\1/g);
    var commitLink = RunCMDCommand("git -C " + gitbbfolder + " rev-parse HEAD");
    document.getElementById("commitLink").value = commitLink;
    // alert(pushCode);
    // if(!commitLink) {
    //     alert("push fail");
    //     return false;
    // }
    return true;
    // var bbPath = ".\\meta-lg-webos\\meta-starfish-nvidia\\recipes-starfish\\com.webos.app.home\\com.webos.app.home.bb";
    // RunCMDCommand("rm -rf ./meta-lg-webos");
    // RunCMDCommand("git clone \"ssh://" + usename + "@gpro.lge.com:29418/nvidia/meta-lg-webos\" -b \"" + bbBranch + "\"" 
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