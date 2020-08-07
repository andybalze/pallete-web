/*
RFU
// todo use of fader to control lights
// todo allow keyboard press on only rfu page
// todo get the "." to use 255 values on rfu page (get "." to toggle)

// todo create a night-mode style
// todo get toggle blackout working
// todo toggle setting for 255 or 100% mode

General looks good
// todo remove global variables
// todo write a help
*/
//global $, jQuery, alert, console, localStorage, location
//jslint plusplus: true 
/*************************************
remote states
0: init
1: channels - enter channel number
2: channels - enter channel level
2.5: channels - enter 255 bit channel level
3: looks - enter look number
4: looks - enter look level

remote variables*/
// Local Storage Variables
if (localStorage.ppt_machine_id === null || localStorage.ppt_machine_id === "" || !localStorage.ppt_machine_id) {
    localStorage.ppt_machine_id = "1";
}
if (localStorage.ip_address === null || localStorage.ip_address === "" || !localStorage.ip_address) {
    localStorage.ip_address = $(location).attr('hostname');
}
if (localStorage.looks_page === null || localStorage.looks_page === "" || !localStorage.looks_page) {
    localStorage.looks_page = 'Faders for Dummies';
}
if (localStorage.cue_stack === null || localStorage.cue_stack === "" || !localStorage.cue_stack) {
    localStorage.cue_stack = 'Main Cue List';
}
if (localStorage.entry_mode === null || localStorage.entry_mode === "" || !localStorage.entry_mode) {
    localStorage.entry_mode = 'd';
}
if (localStorage.on_level === null || localStorage.on_level === "" || !localStorage.on_level) {
    localStorage.on_level = '80';
}
if (localStorage.save_restart === null || localStorage.save_restart === "" || !localStorage.save_restart) {
    localStorage.save_restart = 'yes';
}
var remoteState = 1; // holds current state of remote
var debugMode = true;// 
var homepage = "rfu";// sets the homepage which displays first
var consoleConnected = false; // true is the console can be seen
var checkInterval = 5000;
var chChannels = ''; // holds current channel(s) selection
var chLevel = ''; // holds current channel(s) level
var lkNum = ''; // holds current look number
var lkLevel = ''; // holds current look level
var clearToggle = false; // if true reset remote after successful execution and number pressed
var comStart = false; // true if a command started
var checkIntervalId = 0;
var ipAddress = localStorage.ip_address;
var looksPage = localStorage.looks_page;
var cueStack = localStorage.cue_stack;
var entryMode = localStorage.entry_mode;
var onLevel = localStorage.on_level;
var pptMachineId = localStorage.ppt_machine_id;
var saveRestart = localStorage.save_restart;
var workLights = "287,288";
var topHouseLights = "316,317,318,319,320,321,322,323,324,325,326,327,328,329,330";var botHouseLights = "301,302,303,304,305,306,307,308,309,310,311,312,313,314,315";

if (debugMode) { // code that is only executed whil in debug mode
    console.debug('%c' + 'Debug Mode: Active',
        [// style the console message for debug
            'background: linear-gradient(#31D306, #573f02)',
            'border: 1px solid #3E0E02',
            'font-size: 24px',
            'color: white',
            'display: block',
            'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)',
            'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset',
            'line-height: 26px',
            'text-align: center',
            'font-weight: bold'
        ].join(';'));
}
/* Defining Function */

function setRemoteState(state) {
    remoteState = state;
    console.debug("Remote State: \"" + remoteState + "\"");
}

function updateDisplay(display, append) { // update remote display
//function updateDisplay(display=null , append=false) { // update remote display
    "use strict";
    display = (typeof display !== 'undefined') ?  display : null;
    append = (typeof append !== 'undefined') ?  append : false;
    if (display !== null) { //display contains something update
        display = display.replace(/%2D/g, " - ");
        display = display.replace(/%2B/g, " + ");
        display = display.replace(/%2F/g, " Thru ");
        if (display.length === 0) {
            display = '&nbsp;';
        }
        if (append) { // if true add display text to the end of current display
            $("#output").html($("#output").html() + display);
        } else {
            $("#output").html(display);
        }
    } else { // if doesn't contain anything return current text on display
        return $("#output").html();
    }
}

function sendCommand(command) { // send command to lighting desk
    "use strict";
    command = 'http://' + ipAddress + '/script.mq?' + command;
    if (debugMode) {
        console.debug("Command Sent: \"" + command + "\"");
    } // shows debugging info
    $.get(command, function (data) {}); // send the command	
}
function resetRemote(clrDisp) { // reset remote (should we clear the display? true/false)
    "use strict";
    chChannels = '';
    chLevel = '';
    lkNum = '';
    lkLevel = '';
    setRemoteState(1);
    clearToggle = false;
    comStart = false;
    if (clrDisp) {
        updateDisplay('Strand Palette');
    }
    $("a").removeClass("hover");
}
function setLook(lkNum, lkLevel) { // build look command and pass to sendCommand
    "use strict";
    sendCommand("HC.LookFade('" + looksPage + "', '" + lkNum + "', '" + lkLevel + "','0')");
}
function setChannels(channels, val, time, bitValue) { // build channel command and pass to sendCommand
    if (!bitValue) {var bitValue = false}
    var atint, sendlvl;
    if (bitValue) {
        sendlvl = val;
    } else {
        atint = parseInt(val, 10) / 100 * 255;
        sendlvl = Math.round(atint);
    }
    channels = channels.replace("+", "%2B");
    sendCommand("HC.Select('" + channels + "')" + "HC.SetLevel(HC.GetCurrentSelectionSet('%2B'), '" + sendlvl + "','" + time * 1000 + "')");
}
//btn cmds
function btnEnterNumber(num) { // numeric buttons
    // if pressed enter or rem dim then clear for new entry
    "use strict";
    if (clearToggle === true) {
        resetRemote(false);
    }
    comStart = true;
    switch (remoteState) {
    case 1: // entering a channel
        chChannels = chChannels + num;
        updateDisplay(chChannels);
        break;
    case 2: // entering a level
        chLevel = chLevel + num;
        updateDisplay(chChannels + ' @ ' + chLevel);
        if (entryMode === 's') {
            setChannels(chChannels, chLevel + '0', 0);
        }
        break;
    case 2.5: // entering a level
        chLevel = chLevel + num;
        updateDisplay(chChannels + ' @ . ' + chLevel);
        if (entryMode === 's') {
            setChannels(chChannels, chLevel + '0', 0, true);
        }
        break;
    case 3: // entering a look
        lkNum = lkNum + num;
        updateDisplay('Look ' + lkNum);
        break;
    case 4: // entering a look
        lkLevel = lkLevel + num;
        updateDisplay('Look ' + lkNum + ' @ ' + lkLevel);
        if (entryMode === 's') {
            setLook(lkNum, lkLevel + '0', 0);
        }
        break;
    }
}
function btnEnter() { // enter button
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1:
        case 2: // entering a channel
            if (chLevel === '') {
                chLevel = onLevel;
                updateDisplay(' ' + onLevel + '*', true);
            } else {
                updateDisplay('*', true);
            }
            setChannels(chChannels, chLevel, 0);
            clearToggle = 1;
            
            break;
        case 2.5: // entering a channel
            if (chLevel === '') {
                chLevel = onLevel;
                updateDisplay(' ' + onLevel + '*', true);
            } else {
                updateDisplay('*', true);
            }
            setChannels(chChannels, chLevel, 0, true);
            clearToggle = 1;
            
            break;
        case 3:
        case 4: // entering a look
            if (lkLevel === '') {
                lkLevel = onLevel;
                updateDisplay(' ' + onLevel + '*', true);
            } else {
                updateDisplay('*', true);
            }
            setLook(lkNum, lkLevel, 0);
            clearToggle = 1;
            break;
        }
        clearToggle = true;
        
    }
}
function btnOn() { // on button
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1:
        case 2: // entering a channel
        case 2.5: // entering a channel
            setChannels(chChannels, onLevel, 0);
            updateDisplay(chChannels + ' On');
            
            break;
        case 3:
        case 4: // entering a look
            setLook(lkNum, onLevel, 0);
            updateDisplay('Look ' + lkNum + ' On');
            
            break;
        }
        clearToggle = 0;
        chLevel = '';
        lkLevel = '';
        
    }
}
function btnOff() { // off button
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1:
        case 2: // entering a channel
            setChannels(chChannels, 0, 0);
            clearToggle = 1;
            updateDisplay(chChannels + ' Off');
            
            break;
        case 2.5: // entering a channel
            setChannels(chChannels, 0, 0);
            clearToggle = 1;
            updateDisplay(chChannels + ' Off');
            
            break;
        case 3:
        case 4: // entering a look
            setLook(lkNum, 0, 0);
            clearToggle = 1;
            updateDisplay('Look ' + lkNum + ' Off');
            
            break;
        }
        
    }
}
function btnThru() { // thru button							  
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1: // + channel number
            chChannels = chChannels + "%2F";
            updateDisplay(chChannels);
            
            break;
        }
    }
}
function btnMinus() { // - button							  
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1: // - channel number
            chChannels = chChannels + "%2D";
            updateDisplay(chChannels);
            
            break;
        }
    }
}
function btnPlus() { // + button							  
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1: // + channel number
            chChannels = chChannels + "%2B";
            updateDisplay(chChannels);
            
            break;
        }
    }
}
function btnRel() { // release button	
    "use strict";
    sendCommand(("HC.ReleaseAll()"));
    updateDisplay('ReleaseAll');
    
    resetRemote(false);
}
function btnLook() { // look button	
    "use strict";
    resetRemote(false);
    updateDisplay('Look ');
    setRemoteState(3);
    clearToggle = false;
}
function btnAt() { // @ button
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1: // entering a channel number
            setRemoteState(2);
            updateDisplay(chChannels + ' @ ');
            break;
        case 2:
            setRemoteState(2);
            updateDisplay(chChannels + ' @ ');
            clearToggle = 0;
            chLevel = '';
            break;
        case 2.5:
            setRemoteState(2);
            updateDisplay(chChannels + ' @ ' + chLevel);
            clearToggle = 0;
            break;
        case 3: // entering a look
            setRemoteState(4);
            updateDisplay('Look ' + lkNum + ' @ ');
            break;
        case 4:
            setRemoteState(4);
            updateDisplay('Look ' + lkNum + ' @ ');
            clearToggle = 0;
            lkLevel = '';
            break;
        }
        
    }
}
function btnClr() { // clear - go back a character
    "use strict";
    switch (remoteState) {
    case 1: // entering a channel
        if (chChannels.substr(chChannels.length - 3, 3) === '%2B' || chChannels.substr(chChannels.length - 3, 3) === '%2D' || chChannels.substr(chChannels.length - 3, 3) === '%2F') {
            chChannels = chChannels.substr(0, chChannels.length - 3);
        } else if (chChannels.substr(chChannels.length - 4, 4) === 'Thru') {
            return false;
        } else {
            chChannels = chChannels.substr(0, chChannels.length - 1);
        }
        if (chChannels === '') {
            resetRemote(true);
        } else {
            updateDisplay(chChannels);
        }
        break;
    case 2: // entering a level
        chLevel = chLevel.substr(0, chLevel.length - 1);
        if (updateDisplay() === chChannels + ' @ ') {
            updateDisplay(chChannels);
            setRemoteState(1);
        } else {
            updateDisplay(chChannels + ' @ ' + chLevel);
        }
        break;
    case 2.5: // entering a level
        chLevel = chLevel.substr(0, chLevel.length - 1);
        if (updateDisplay() === chChannels + ' @ . ') {
            updateDisplay(chChannels + ' @ ');
            setRemoteState(2);
        } else {
            updateDisplay(chChannels + ' @ . ' + chLevel);
        }
        break;
    case 3: // entering a look
        lkNum = lkNum.substr(0, lkNum.length - 1);
        if (updateDisplay() === 'Look ') {
            resetRemote(true);
        //} else if (lkNum = '') {
            //updateDisplay('look');
        } else {
            updateDisplay('Look ' + lkNum);
        }
        break;
    case 4: // entering a look level
        lkLevel = lkLevel.substr(0, lkLevel.length - 1);
        if (updateDisplay() === 'Look ' + lkNum + ' @ ') {
            updateDisplay('Look ' + lkNum);
            setRemoteState(3);
        } else {
            updateDisplay('Look ' + lkNum + ' @ ' + lkLevel);
        }
        break;
    }
}
function btnRem() { // rem dim
    "use strict";
    if (comStart) {
        sendCommand("HC.Select('" + chChannels + "')" + "HC.RemDim(HC.GetCurrentSelectionSet('%2B'))");
        clearToggle = true;
        updateDisplay(chChannels + ' RemDim');
    }
}
function btnNext() { // next button
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1: // next channel number
            if (chChannels < 4096) {
                sendCommand("HC.Deselect(HC.GetCurrentSelectionSet('%2B'))");
                chChannels++;
                btnRem();
            }
            break;
        case 3: // next look
            if (lkNum < 4096) {
                lkNum++;
                setLook(lkNum, 100, 0);
                updateDisplay('Look ' + lkNum + ' On');
            }
            break;
        }
    }
}
function btnPrev() { // prev button
    "use strict";
    if (comStart) {
        switch (remoteState) {
        case 1: // prev channel number
            if (chChannels > 1) {
                sendCommand("HC.Deselect(HC.GetCurrentSelectionSet('%2B'))");
                chChannels -= 1;
                btnRem();
            }
            break;
        case 3: // prev look
            if (lkNum > 1) {
                lkNum -= 1;
                setLook(lkNum, 100, 0);
                updateDisplay('Look ' + lkNum + ' On');
            }
            break;
        }
    }
}
function btnDecimal() {
    "use strict";
    switch (remoteState) {
    case 1: // entering a channel number
        setRemoteState(2.5);
        updateDisplay(chChannels + ' @ . ');
        break;
    case 2: // entering a level
        setRemoteState(2.5);
        updateDisplay(chChannels + ' @ . ' + chLevel);
        break;
    }
}
function btnRec() {
    "use strict";
    // sendCommand(HC.RecordCue('cue_list',cue_number[,'merge'|'replace'][,'IPCGLSTE'][,cue_time][,'label']));
    // HC.RecordLook('look_page',look_number[,'merge'|'replace'][,'IPCGLSTE'][,'label'])
}
function btnPark() {
    "use strict";
    if (comStart) {
        switch (remoteState) {
            case 1:
            case 2:
            case 2.5:
                sendCommand("HC.FixturePark('"+chChannels+"')");
                clearToggle = 1;
                updateDisplay(chChannels + " Parked");
                break;
        }
    }
}
function btnUnPark() {
    "use strict";
    if (comStart) {
        switch (remoteState) {
            case 1:
            case 2:
            case 2.5:
                sendCommand("HC.FixtureUnPark('"+chChannels+"')");
                clearToggle = 1;
                updateDisplay(chChannels + " UnParked");
                break;
        }
    }
}
function btnCue() {
    "use strict";
}
// Other functions
function checkDesk() {
    "use strict";
    clearInterval(checkIntervalId);
    if (consoleConnected === false) {
        $("#connStatus").html('Looking for Palette...').removeClass('text-success').removeClass('text-danger').addClass('text-warning');
    }
    $.ajax('http://' + ipAddress + '/script.mq?').then(function (data, responseText, jqXHR) {
        if (jqXHR.status === 204) {
            consoleConnected = true;
            $("#connStatus").html('Connected to Palette').removeClass('text-warning').removeClass('text-danger').addClass('text-success');
            checkIntervalId = setInterval(function () {checkDesk(); }, checkInterval);
        }
    }).fail(function () {
        consoleConnected = false;
        $("#connStatus").html('Disconnected from&nbsp;Palette').removeClass('text-warning').removeClass('text-success').addClass('text-danger');
        checkIntervalId = setInterval(function () {checkDesk(); }, checkInterval);
    });
}
function command(cmd) {
    "use strict";
    switch (cmd) {
    case "logout":
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location = "login.html";
        break;
    case "toggleTopHouse":
        sendCommand("output%20=%20%22" + topHouseLights + "%22%20parked%20=%20HC.GetProperty(%22output%22,%20output,%20%22parked%22)%20if%20string.match(parked,%20%22-%22)%20then%20for%20i%20in%20string.gmatch(output,%20%22,?([0-9]*),?%22)%20do%20HC.OutputPark(i,%20%27255%27)%20end%20else%20for%20i%20in%20string.gmatch(output,%20%22,?([0-9]*),?%22)%20do%20HC.OutputUnPark(i)%20end%20end");
        break;
    case "cueListRelease":
        sendCommand("HC.CueListRelease('" + cueStack + "')");
        break;
    case "nextCue":
        sendCommand("HC.CueListGo('" + cueStack + "')");
        break;
    case "cueHaltBack":
        sendCommand("HC.CueListHaltBack('" + cueStack + "')");
        break;
    case "cueGotoExecute":
        sendCommand("HC.CueListGotoAndExecuteFollows('" + cueStack + "', " + $("#cueNumber").val() + ")");
        document.getElementById("cueNumber").value = "";
        break;
    case "CueGotoHalt":
        sendCommand("HC.CueListGotoAndHalt('" + cueStack + "', " + $("#cueNumber").val() + ")");
        document.getElementById("cueNumber").value = ""
        break;
    case "toggleWorks":
        sendCommand("output%20=%20%22" + workLights + "%22%20parked%20=%20HC.GetProperty(%22output%22,%20output,%20%22parked%22)%20if%20string.match(parked,%20%22-%22)%20then%20for%20i%20in%20string.gmatch(output,%20%22,?([0-9]*),?%22)%20do%20HC.OutputPark(i,%20%27255%27)%20end%20else%20for%20i%20in%20string.gmatch(output,%20%22,?([0-9]*),?%22)%20do%20HC.OutputUnPark(i)%20end%20end");
        break;
    case "toggleBotHouse":
        sendCommand("output%20=%20%22" + botHouseLights + "%22%20parked%20=%20HC.GetProperty(%22output%22,%20output,%20%22parked%22)%20if%20string.match(parked,%20%22-%22)%20then%20for%20i%20in%20string.gmatch(output,%20%22,?([0-9]*),?%22)%20do%20HC.OutputPark(i,%20%27255%27)%20end%20else%20for%20i%20in%20string.gmatch(output,%20%22,?([0-9]*),?%22)%20do%20HC.OutputUnPark(i)%20end%20end");
        break;
    case "blackout":
        sendCommand(/*todo HC.SoftkeyPress( 'M or S', button_number  )*/);
        break;
    case "saveShow":
        sendCommand("HC.SaveShow()");
        break;
    case "pptNext":
        sendCommand("HC.PowerPointNextSlide(" + pptMachineId + ")");
        break;
    case "pptPrev":
        sendCommand("HC.PowerPointPrevSlide(" + pptMachineId + ")");
        break;
    case "pptFirst":
        sendCommand("HC.PowerPointFirstSlide(" + pptMachineId + ")");
        break;
    case "pptLast":
        sendCommand("HC.PowerPointLastSlide(" + pptMachineId + ")");
        break;
    case "sendMessage":
        sendCommand("HC.MessageBox('" + $("#popMsg").val() + "')");
        $("#popMsg").val("");
        break;
    case "shutdown":
        $('#warningModal').modal('show');
        $("#sysCmdConfirm").click(function () {
            sendCommand("HC.SystemShutdown()");
            $("#sysCmdConfirm").off("click");
        });
        break;
    case "restart":
        $('#warningModal').modal('show');
        $("#sysCmdConfirm").click(function () {
            sendCommand("HC.SystemRestart(" + saveRestart + ")");
            $("#sysCmdConfirm").off("click");
        });
        break;
    case "tskmgr":
        $('#warningModal').modal('show');
        $("#sysCmdConfirm").click(function () {
            sendCommand("os.execute('taskmgr.exe')");
            $("#sysCmdConfirm").off("click");
        });
        break;
    case "transmitCommand":
        $('#warningModal').modal('show');
        $("#sysCmdConfirm").click(function () {
            sendCommand("os.execute('" + $('#sysCmd').val() + "')");
            $("#sysCmd").val("");
            $("#sysCmdConfirm").off("click");
        });
        break;
    }
}
function loadPage(page) {
    "use strict";
    console.debug("Page: \"" + page +  "\"");
    resetRemote(true);
    $("#content").load(page + ".html", function (rspns, status, xhr) {
        $('.collapse').collapse('hide');
        $("[cmd]").click(function () {
            var cmnd = $(this).attr("cmd");
            command(cmnd);
            return false;
        });//Adds the command functions to the command buttons
        $('#output').html($("main").children().attr("ttl"));
        document.title = "Palette RFU | " + $("main").children().attr("ttl");
    });
}

/* Initially run code when js loads*/
if (window.location.href.split('#')[1]){
    loadPage(window.location.href.split('#')[1]);
} else {
    loadPage(homepage);
}

$("nav ul.nav.navbar-nav li a").click(function () {
    "use strict";
    var data = $(this).attr("href");
    window.history.pushState(data, null, '#'+data+'');
    loadPage(data);
    return false;
}); // sets the menus to be load the content dynamically
window.addEventListener('popstate', function(e){
      var viewPage = e.state;
      if (viewPage == null) {
          loadPage(homepage);
      } else {
          loadPage(viewPage);
      }
})//Script to run to make the back button work
$(window).on('hashchange', function(e){
    loadPage(window.location.href.split('#')[1]);
});
$(function () {
    "use strict";
    $("#connMessage").html(cueStack.replace(/\s/g, '&nbsp;') + ' : ' + looksPage.replace(/\s/g, '&nbsp;'));
    checkDesk();
    // sets keyoard keys to fire button functions
});