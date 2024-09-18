
var currentStep = 1;
var totalSteps = 3; // Tổng số bước

function showStep(step) {
    for (var i = 1; i <= totalSteps; i++) {
        var stepElement = document.getElementById("step" + i);
        if (stepElement) {
            stepElement.style.display = (i === step) ? "block" : "none";
        }
    }
}

function runStep(step) {
    switch(step) {
        case 1:
            OnInit();
            break;
        case 2:
            pushTag();
            updateBB();
            break;
        case 3:
            pushBB();
            break;
        default:
    } 
}

function nextStep() {
    if(currentStep==1 && document.getElementById("srcBranch").value=="") {
        alert("not found src branch, please re select path source");
        return;
    }
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        runStep(currentStep);
    } else {
        alert("Setup complete!");
        window.close(); // or any other action
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

window.onload = function() {
    showStep(currentStep);   // Hiển thị bước đầu tiên
    runStep(currentStep);
};