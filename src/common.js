
function browseFolder() {
    var shell = new ActiveXObject("Shell.Application");
    var folder = shell.BrowseForFolder(0, "Select Folder :", 0, 0);
    if (folder) {
        return folder.Items().Item().Path;
    }
    return "";
}
function deleteFolder(folderPath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FolderExists(folderPath)) {
        fso.DeleteFolder(folderPath, true);
    }
}
                
function folderExists(folderPath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    return fso.FolderExists(folderPath);
}

function fileExists(filePath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    return fso.FileExists(filePath);
}

function readFile(filePath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FileExists(filePath)) {
        var file = fso.OpenTextFile(filePath, 1); // 1 = ForReading
        var content = file.ReadAll();
        file.Close();
        // alert("content read: " + content);
        return content;
    } else {
        alert(filePath + " not found");
    }
    return "";
}

function writeFile(filePath, content) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FileExists(filePath)) {
        var file = fso.OpenTextFile(filePath, 2); // 2 = ForWriteing
        file.Write(content);
        file.Close();
        // alert("content write: " + content);
    } else {
        alert(filePath + " not found");
    }
}

function parseJSON(jsonString) {
    var jsonObject = eval('(' + jsonString + ')');
    return jsonObject;
}

function readJSONFile(filePath) {
    var jsonContent = readFile(filePath);
    if(jsonContent) {
        var jsonData = parseJSON(jsonContent.replace(/"/g, "'"));
        return jsonData;
    }
    return 0;
}

function RunCommand(command) {
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

function RunCMDCommand(command) {
    var shell = new ActiveXObject("WScript.Shell");
    var exec = shell.Exec(command);
    var output = "";
    // var timecountout = 1000;
    while (exec.Status === 0) {
        //sleep(100); // Chờ cho lệnh hoàn tất
        // if(timecountout--<0) {
        //     return "";
        // }
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