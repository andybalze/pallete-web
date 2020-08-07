/*var webappCache = window.applicationCache;

function errorCache() {
    alert("Cache failed to update");
}
webappCache.addEventListener("error", errorCache, false);*/
/* 
	Version 2.2 - 12/5/10

	(snip) This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.



remote states
0: init
1: channels - enter channel number
2: channels - enter channel level
3: looks - enter look number
4: looks - enter look level

remote variables */
var remote_state = 0; // holds current state of remote
var ch_channels = ''; // holds current channel(s) selection
var prev_ch_channels = ''; // holds previous channel(s) selection
var ch_level = ''; // holds current channel(s) level
var lk_num = ''; // holds current look number
var prev_lk_num = '' // holds previous look number
var prev_lk = ''; // holds current previous number
var lk_level = ''; // holds current look level
var display = '&nbsp;'; // holds display string
var clear_toggle = false; // if true reset remote after successful execution and number pressed
var clr_timer = false; // handle for the clear display timer
var update_timer = false; // handle for the update display timer
var com_start = false; // true if a command started
var check_interval_id = 0;
var connected = false; // true if console can bee seen
var debug = true; // true if debbuging
var panel = ''; // active panel
//var checkInterval = 3000;
var checkInterval = 99999000;
if (localStorage.ip_address == null || localStorage.ip_address === "") {
    localStorage.ip_address = '' + $(location).attr('hostname') + '';
}
if (localStorage.looks_page == null || localStorage.looks_page === "") {
    localStorage.looks_page = 'Sub Page 1';
}
if (localStorage.cue_stack == null || localStorage.cue_stack === "") {
    localStorage.cue_stack = 'Main Cue List';
}
if (localStorage.entry_mode == null || localStorage.entry_mode === "") {
    localStorage.entry_mode = 'd';
}
if (localStorage.on_level == null || localStorage.on_level === "") {
    localStorage.on_level = '80';
}
var ip = localStorage.ip_address;
var looks_page = localStorage.looks_page;
var cue_stack = localStorage.cue_stack;
var entry_mode = localStorage.entry_mode;
var on_level = localStorage.on_level;
$(function () { /* html loaded - set event handlers and reset remote */
    window.onorientationchange = function () {
            set_orientation();
        } // set orientation on iphone change
    $(function () {
        $(window).keyup(function (e) {
            switch ((e || window.event).keyCode || (e || window.event).which) {
            case 8: // Backspace
                btn_clr();
                break;
            case 27: //esc
                btn_rel();
                break;
            case 46: // Del
                btn_clr();
                break;
            }
        });
        $(window).keypress(function (e) {
            switch ((e || window.event).keyCode || (e || window.event).which) {
            case 8: // Backspace
                btn_clr();
                break;
            case 43: // +
                btn_plus();
                break;
            case 45: // -
                btn_minus();
                break;
            case 48: // 0
                btn_enter_number(0);
                break;
            case 49: //1
                btn_enter_number(1);
                break;
            case 50: //2
                btn_enter_number(2);
                break;
            case 51: // 3
                btn_enter_number(3);
                break;
            case 52: // 4
                btn_enter_number(4);
                break;
            case 53: // 5
                btn_enter_number(5);
                break;
            case 54: // 6
                btn_enter_number(6);
                break;
            case 55: // 7
                btn_enter_number(7);
                break;
            case 56: // 8
                btn_enter_number(8);
                break;
            case 57: // 9
                btn_enter_number(9);
                break;
            case 13: // Enter
                btn_enter();
                break;
            case 64: // @
                btn_at();
                break;
            case 46: // dot
                btn_clr();
                break;
            case 47: // /
                btn_thru();
                break;
            }
        });
    });
    $('#txt_ipaddress').val(ip);
    $('#txt_looks_page').val(looks_page);
    $('#txt_cue_stack').val(cue_stack);
    $("#sel_entry_mode option[value='" + entry_mode + "']").attr("selected", 'selected');
    $('#txt_on_level').val(on_level);
    $("#save_ip_address").click(function () {
        ip = $('#txt_ipaddress').val();
        localStorage.ip_address = ip;
        $('#message').html('IP Address Saved').fadeIn();
        return false;
    });
    $("#save_looks_page").click(function () {
        looks_page = $('#txt_looks_page').val();
        localStorage.looks_page = looks_page;
        $('#message').html('Looks Page Saved').fadeIn();
        return false;
    });
    $("#save_cue_stack").click(function () {
        cue_stack = $('#txt_cue_stack').val();
        localStorage.cue_stack = cue_stack;
        $('#message').html('Cue Stack Saved').fadeIn();
        return false;
    });
    $("#save_entry_mode").click(function () {
        entry_mode = $('#sel_entry_mode :selected').val();
        localStorage.entry_mode = entry_mode;
        $('#message').html('Entry Mode Saved').fadeIn();
        return false;
    });
    $("#save_on_level").click(function () {
        on_level = $('#txt_on_level').val();
        localStorage.on_level = on_level;
        $('#message').html('On Level Saved').fadeIn();
        return false;
    });
    $('#message').html(cue_stack + ' : ' + looks_page);
    $(".look").click(function () {
        btn_look();
        return false;
    });
    $(".number").click(function () {
        num = $(this).attr("ref");
        btn_enter_number(num);
        return false;
    });
    $(".shtdwn").click(function () {
        btn_shtdwn($(this).attr("ref"));
        return false;
    });
    $(".enter").click(function () {
        btn_enter();
        return false;
    });
    $(".btn_msg").click(function () {
        btn_msg();
        return false;
    });
    $(".on").click(function () {
        btn_on();
        return false;
    });
    $(".off").click(function () {
        btn_off();
        return false;
    });
    $(".thru").click(function () {
        btn_thru();
        return false;
    });
    $(".minus").click(function () {
        btn_minus();
        return false;
    });
    $(".plus").click(function () {
        btn_plus();
        return false;
    });
    $(".rel").click(function () {
        btn_rel();
        return false;
    });
    $(".at").click(function () {
        btn_at();
        return false;
    });
    $(".clr").click(function () {
        btn_clr();
        return false;
    });
    $(".rem").click(function () {
        btn_rem();
        return false;
    });
    $(".next").click(function () {
        btn_next();
        return false;
    });
    $(".prev").click(function () {
        btn_prev();
        return false;
    });
    $(".nav").click(function () {
        panel = $(this).attr("ref");
        show_panel(panel);
        return false;
    });
    $(".halt").click(function () {
        btn_halt();
        return false;
    });
    $(".go").click(function () {
        btn_go();
        return false;
    });
    $(".btn_trans_cmd").click(function () {
        btn_trans_cmd();
        return false;
    });
    set_orientation();
    reset_remote(true);
    check_desk();
    show_panel("chan");
});
/* common functions */
function set_orientation(panel) {
    var orientation = window.orientation;
    switch (orientation) {
    case 0:
        $("#main_container").addClass("portrait").removeClass("landscape");
        break;
    case 90:
        $("#main_container").removeClass("portrait").addClass("landscape");
        break;
    case -90:
        $("#main_container").removeClass("portrait").addClass("landscape");
        break;
    }
}
function show_panel(panel) {
    $("ul#top li a").css("background", "#000033");
    $(".panel").hide();
    $('#message').html('');
    $("#" + panel + ".panel").show();
    $("ul#top li a." + panel + "").css("background", "#003300");
    $('#message').html(cue_stack + ' : ' + looks_page);
}
function check_desk() {
    clearInterval(check_interval_id);
    if (connected == false) {
        $("#status").html('Looking for Palette...').removeClass('connected').removeClass('disconnected').addClass('connecting');
    }
    $.ajax('http://' + ip + '/script.mq?').then(function (data, responseText, jqXHR) {
        if (jqXHR.status == 204) {
            connected = true;
            $("#status").html('Connected to Palette').removeClass('connecting').removeClass('disconnected').addClass('connected');
            check_interval_id = setInterval('check_desk()', checkInterval);
        }
    }).fail(function () {
        connected = false;
        $("#status").html('Disconnected from Palette').removeClass('connecting').removeClass('connected').addClass('disconnected');
        check_interval_id = setInterval('check_desk()', checkInterval);
    });
}
function send_command(command) { // send command to lighting desk
    command = 'http://' + ip + '/script.mq?' + command;
    if (debug) {
        $("#debug").html(command);
    } // shows debugging info
    $.get(command, function (data) {}); // send the command	
}
function command_reply(type, command) {
    switch (type) {
    case 'cues':
        console.log('cues');
        break;
    case 'current_cue':
        console.log('current_cue');
        break;
    case 'looks':
        console.log('looks');
        break;
    case 'system':
        console.log('system');
        break;
    case 'commandLine':
        console.log('commandLine');
        break;
    case 'command':
        console.log('command is :\'' + command + '\'');
        break;
    default:
        break;
    }
}
function set_look(lk_num, lk_level) { // build look command and pass to send_command
    send_command("HC.LookFade('" + looks_page + "', '" + lk_num + "', '" + lk_level + "','0')");
}
function set_channels(channels, val, time) { // build channel command and pass to send_command
    atint = parseInt(val) / 100 * 255;
    sendlvl = Math.round(atint) + "";
    channels = channels.replace("+", "%2B");
    send_command("HC.Select('" + channels + "')" + "HC.SetLevel(HC.GetCurrentSelectionSet('%2B'), '" + sendlvl + "','" + time * 1000 + "')");
}
function clr_tmr() { // sets an automatic timer for updating the display
    clr_timer = window.setTimeout(function () {
            display = 'Strand Palette';
            update_display();
            com_start = false;
        }, 5000) // set the interval in milliseconds
}
function update_display() { // update remote display
    clearTimeout(clr_timer); // if a display update timer is running - stop it!
    display = display.replace(/%2D/g, " - ");
    display = display.replace(/%2B/g, " + ");
    display = display.replace(/%2F/g, " Thru ");
    if (display.length == 0) {
        display = '&nbsp;';
    }
    $("#output").html(display);
    $("#debug").html(remote_state);
}
function reset_remote(clr_disp) { // reset remote (should we clear the display? true/false)
    ch_channels = '';
    ch_level = '';
    ch_time = 0;
    lk_num = '';
    lk_level = '';
    lk_time = 0;
    remote_state = 1;
    clear_toggle = false;
    com_start = false;
    if (clr_disp) {
        display = 'Strand Palette';
        update_display();
    }
    send_command("HC.Deselect(HC.GetCurrentSelectionSet('%2B'))");
    $("a").removeClass("hover");
}
/* button events */
function btn_go() {
    send_command("if HTML_Cue==nil then HTML_Cue='' end if HTML_Cue=='' then HC.ProcessKey(0,0x1412002D,true,0,2) else HC.CueListGotoAndExecuteFollows('" + cue_stack + "', HTML_Cue) HTML_Cue='' end");
}
function btn_halt() {
    send_command("HC.ProcessKey(0, 0x1412002C, true, 0, 2)");
}
function btn_enter_number(num) { // numeric buttons
    // if pressed enter or rem dim then clear for new entry
    if (clear_toggle == true) {
        reset_remote(false);
    }
    com_start = true;
    switch (remote_state) {
    case 1: // entering a channel
        ch_channels = ch_channels + num;
        display = ch_channels;
        prev_ch_channels = ch_channels;
        break;
    case 2: // entering a level
        ch_level = ch_level + num;
        display = ch_channels + ' @ ' + ch_level;
        if (entry_mode == 's') {
            set_channels(ch_channels, ch_level + '0', 0);
        }
        prev_ch_channels = ch_channels;
        break;
    case 3: // entering a look
        lk_num = lk_num + num;
        display = 'Look ' + lk_num;
        prev_lk_num = lk_num;
        break;
    case 4: // entering a look
        lk_level = lk_level + num;
        display = 'Look ' + lk_num + ' @ ' + lk_level;
        if (entry_mode == 's') {
            set_look(lk_num, lk_level + '0', 0);
        }
        prev_lk_num = lk_num;
        break;
    }
    update_display();
}
function btn_shtdwn(param) {
    if(param == "shtdwn") {
        send_command("HC.SystemShutdown()");
    } else if(param == "reboot") {
        send_command("HC.SystemRestart("+$('input:radio[name=restart_save]:checked').val()+")");
    }
}
function btn_trans_cmd() {
        if (confirm("Proceed with extreme caution when using this command.")) {
            send_command("os.execute('"+$('.cmd_txt')['0'].value+"')");
            $('.cmd_txt')['0'].value = "";
        }
        else {
            return false;
        }
}
function btn_enter() { // enter button
    if (com_start) {
        switch (remote_state) {
        case 1:
        case 2: // entering a channel
            if (ch_level == '') {
                ch_level = on_level;
                display = display + ' ' + on_level + '*';
            }
            else {
                display = display + '*';
            }
            set_channels(ch_channels, ch_level, 0);
            clear_toggle = 1;
            update_display();
            break;
        case 3:
        case 4: // entering a look
            if (lk_level == '') {
                lk_level = on_level;
                display = display + ' ' + on_level + '*';
            }
            else {
                display = display + '*';
            }
            set_look(lk_num, lk_level, 0);
            clear_toggle = 1;
            prev_lk = lk_num;
            break;
        }
        clear_toggle = true;
        update_display();
    }
}
function btn_on() { // on button
    if (com_start) {
        switch (remote_state) {
        case 1:
        case 2: // entering a channel
            set_channels(ch_channels, on_level, 0);
            display = ch_channels + ' On';
            prev_ch_channels = ch_channels;
            update_display();
            break;
        case 3:
        case 4: // entering a look
            set_look(lk_num, on_level, 0);
            display = 'Look ' + lk_num + ' On';
            update_display();
            prev_lk_num = lk_num;
            break;
        }
        clear_toggle = 0;
        ch_level = '';
        lk_level = '';
        update_display();
    }
}
function btn_off() { // off button
    if (com_start) {
        switch (remote_state) {
        case 1:
        case 2: // entering a channel
            set_channels(ch_channels, 0, 0);
            clear_toggle = 1;
            display = ch_channels + ' Off';
            update_display();
            break;
        case 3:
        case 4: // entering a look
            set_look(lk_num, 0, 0);
            clear_toggle = 1;
            display = 'Look ' + lk_num + ' Off';
            update_display();
            break;
        }
        update_display();
    }
}
function btn_thru() { // thru button							  
    if (com_start) {
        switch (remote_state) {
        case 1: // + channel number
            ch_channels = ch_channels + "%2F";
            display = ch_channels;
            update_display();
            break;
        }
    }
}
function btn_minus() { // - button							  
    if (com_start) {
        switch (remote_state) {
        case 1: // - channel number
            ch_channels = ch_channels + "%2D";
            display = ch_channels;
            update_display();
            break;
        }
    }
}
function btn_plus() { // + button							  
    if (com_start) {
        switch (remote_state) {
        case 1: // + channel number
            ch_channels = ch_channels + "%2B";
            display = ch_channels;
            update_display();
            break;
        }
    }
}
function btn_msg() { // release button	
    send_command(("HC.MessageBox('" + $('#message_text').val() + "')"));
    document.getElementById('message_text').value = "";
}
function btn_rel() { // release button	
    send_command(("HC.ReleaseAll()"));
    display = 'ReleaseAll';
    update_display();
    reset_remote(false);
    clr_tmr();
}
function btn_look() { // look button	
    reset_remote(false);
    display = 'Look ';
    remote_state = 3;
    update_display();
    clear_toggle = false;
}
function btn_at() { // @ button
    if (com_start) {
        switch (remote_state) {
        case 1: // entering a channel number
            remote_state = 2;
            display = ch_channels + ' @ ';
            break;
        case 2:
            remote_state = 2;
            display = prev_ch_channels + ' @ ';
            clear_toggle = 0;
            ch_level = '';
            break;
        case 3: // entering a look
            remote_state = 4;
            display = 'Look ' + lk_num + ' @ ';
            break;
        case 4:
            remote_state = 4;
            display = 'Look ' + prev_lk_num + ' @ ';
            clear_toggle = 0;
            lk_level = '';
            break;
        }
        update_display();
    }
}
function btn_clr() { // clear - go back a character
    if (com_start) {
        switch (remote_state) {
        case 1: // entering a channel
            if (ch_channels.substr(ch_channels.length - 3, 3) == '%2B' || ch_channels.substr(ch_channels.length - 3, 3) == '%2D' || ch_channels.substr(ch_channels.length - 3, 3) == '%2F') {
                ch_channels = ch_channels.substr(0, ch_channels.length - 3);
            }
            else if (ch_channels.substr(ch_channels.length - 4, 4) == 'Thru') {}
            else {
                ch_channels = ch_channels.substr(0, ch_channels.length - 1);
            }
            if (ch_channels == '') {
                reset_remote(true);
            }
            else {
                display = ch_channels;
            }
            break;
        case 2: // entering a level
            ch_level = ch_level.substr(0, ch_level.length - 1);
            if (display == ch_channels + ' @ ') {
                display = ch_channels;
                remote_state = 1;
            }
            else {
                display = ch_channels + ' @ ' + ch_level;
            }
            break;
        case 3: // entering a look
            lk_num = lk_num.substr(0, lk_num.length - 1);
            if (display == 'Look ')
                {
                    reset_remote(true);
                }
            else {
                //if (lk_num = '') {
                //    display = 'look';
                //}
                //else {
                    display = 'Look ' + lk_num;
                //}
            }
            break;
        case 4: // entering a look level
            lk_level = lk_level.substr(0, lk_level.length - 1);
            if (display == 'Look ' + lk_num + ' @ ') {
                display = 'Look ' + lk_num;
                remote_state = 3;
            }
            else {
                display = 'Look ' + lk_num + ' @ ' + lk_level;
            }
            break;
        }
        update_display();
    }
}
function btn_rem() { // rem dim
    if (com_start) {
        send_command("HC.Select('" + ch_channels + "')" + "HC.RemDim(HC.GetCurrentSelectionSet('%2B'))");
        clear_toggle = true;
        display = ch_channels + ' RemDim';
        update_display();
        //clr_tmr();
    }
}
function btn_next() { // next button
    if (com_start) {
        switch (remote_state) {
        case 1: // next channel number
            if (ch_channels < 4096) {
                send_command("HC.Deselect(HC.GetCurrentSelectionSet('%2B'))");
                ch_channels++;
                btn_rem();
            }
            break;
        case 3: // next look
            if (lk_num < 4096) {
                if (prev_lk != '') {
                    set_look(prev_lk, 0, 0);
                }
                lk_num++;
                set_look(lk_num, 100, 0);
                display = 'Look ' + lk_num + ' On';
                prev_lk = lk_num;
            }
            break;
        }
        update_display();
    }
}
function btn_prev() { // prev button
    if (com_start) {
        switch (remote_state) {
        case 1: // prev channel number
            if (ch_channels > 1) {
                send_command("HC.Deselect(HC.GetCurrentSelectionSet('%2B'))");
                ch_channels--;
                btn_rem();
            }
            break;
        case 3: // prev look
            if (lk_num > 1) {
                if (prev_lk != '') {
                    set_look(prev_lk, 0, 0);
                }
                lk_num--;
                set_look(lk_num, 100, 0);
                display = 'Look ' + lk_num + ' On';
                prev_lk = lk_num;
            }
            break;
        }
        update_display();
    }
}
$("#slidLooksFader").slider({
    value: 0
    , orientation: "vertical"
    , min: 0
    , max: 255
    , step: 2.5
    , slide: function (event, ui) {
        valuePercent = Math.round(ui.value / 2.55)
        if (com_start) {
            switch (remote_state) {
            case 1:
                break;
            case 2: // entering a channel
                set_channels(ch_channels, valuePercent, 0);
                clear_toggle = 1;
                display = ch_channels + ' @ ' + valuePercent;
                update_display();
                break;
            case 3:
            case 4: // entering a look
                set_look(lk_num, valuePercent, 0);
                clear_toggle = 1;
                display = 'Look ' + lk_num + ' @ ' + valuePercent;
                update_display();
                prev_lk = lk_num;
                break;
            }
            clear_toggle = true;
            update_display();
        }
        $("#slidLooksFader-value").html(ui.value);
    }
});
if (debug) {
    $("#main_container").append("<div id=\"debug\"></div>");
    console.log('%c' + 'Debug mode: Active', [
'background: linear-gradient(#31D306, #573f02)'
, 'border: 1px solid #3E0E02'
, 'font-size: 36px'
, 'color: white'
, 'display: block'
, 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
, 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
, 'line-height: 40px'
, 'text-align: center'
, 'font-weight: bold'
].join(';'));
    $("#levels").append("<p>Your slider has a value of <span id=\"slidLooksFader-value\"></span>b</p>");
    $("#slidLooksFader-value").html($('#slidLooksFader').slider('value'));
}
console.log("touchscreen is", VirtualJoystick.touchScreenAvailable() ? "available" : "not available");
/*var joystick = new VirtualJoystick({
    container: document.getElementById('joystick')
    , mouseSupport: true
, });
setInterval(function () {
    var outputEl = document.getElementById('result');
    if(debug){outputEl.innerHTML = '<b>Result:</b> ' + ' dx:' + joystick.deltaX() + ' dy:' + joystick.deltaY() + (joystick.right() ? ' right' : '') + (joystick.up() ? ' up' : '') + (joystick.left() ? ' left' : '') + (joystick.down() ? ' down' : '')}
}, 1 / 30 * 1000);*/