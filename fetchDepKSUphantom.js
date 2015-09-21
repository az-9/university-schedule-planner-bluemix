/**
 * Created by Abdulaziz on 10/8/2014.
 */

var system = require('system');
var fs = require('fs');
var page = require('webpage').create();
//phantom.clearCookies();


page.onResourceError = function (resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
};

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.webSecurityEnabled = false;
phantom.outputEncoding = 'utf-8';

page.onAlert = function (msg) {

};

page.onLoadFinished = function (status) {
    //console.log('Status: ' + status);

};

page.onConsoleMessage = function (msg) {
    //system.stderr.writeLine('   console: ' + msg);
};

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 10000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if (!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("{\"Error\" : \"waitFor() timeout\"}");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof (onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled

                    clearInterval(interval); //< Stop this interval

                }
            }
        }, 250); //< repeat check every 250ms
};

page.open('https://edugate.ksu.edu.sa/ksu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces', function (status) {

    if (system.args.length < 1) {
        console.log('{"Error":"no arguments"}');
        phantom.exit(1);
    }

    if (status === 'fail') {
        console.log(
            "{\"Error\": \"opening url '" + page.reason_url
            + "': \"}" + page.reason
        );
        phantom.exit(1);
    } else {

        page.evaluate(function (placeID) {

            $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[1]).eq(parseInt(placeID)).click();


        }, system.args[1]);

        waitFor(function check() {
            return page.evaluate(function (placeID) {
                return document.readyState === "complete" && $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all.ui-state-highlight", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[1]).index() == parseInt(placeID)
                    }, system.args[1]);

        }, function onReady() {

            page.evaluate(function ( degreeID) {

                $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[2]).eq(parseInt(degreeID)).click();

            }, system.args[2]);

            waitFor(function check() {
                return page.evaluate(function ( degreeID,placeID) {
                    return document.readyState === "complete" && $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all.ui-state-highlight", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[2]).index() == (parseInt(degreeID)+parseInt(placeID));
                },system.args[2],system.args[1]);

            }, function onReady() {

                var output = page.evaluate(function () {

                    return $.map($('[id^=stree]'), function (ele) {
                        return ele.text
                    })
                    /* .reduce(function (o, v, i) {
                     var tmp = {};
                     tmp['DepartmentName'] = v;
                     tmp['date'] = 0;
                     o.push(tmp);
                     return o;
                     }, []); */

                });

                //console.log(JSON.stringify(output));
                console.log(JSON.stringify(output));

                //fs.write("/Users/abdulazizm/WebstormProjects/phantomOutput.txt",JSON.stringify(output),'W');

                setTimeout(function () {
                    phantom.exit();
                }, 100*output.length);
            })
            

        }, 10000);


    }
});


//parseDateInfo("");