﻿/**
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


page.open('https://edugate.ksu.edu.sa/ksu/ui/home.faces', function (status) {
    if (status === 'fail') {
        console.log(
            "{\"Error\": \"opening url '" + page.reason_url
            + "': \"}" + page.reason
        );
        phantom.exit(1);
    } else {

        if (!page.evaluate(function (language) {


                return (language == "AR" && !(document.title.indexOf("King") > -1)) ||
                    (language == "EN" && (document.title.indexOf("King") > -1));
            }, system.args[1])) {
            page.evaluate(function () {
                document.forms['headerForm']['headerForm:_idcl'].value = 'headerForm:_id21';
                document.forms['headerForm'].submit();
                return;
            });
        }
        waitFor(function check() {

            return page.evaluate(function (language) {
                return (document.readyState === "complete" && language == "AR" && !(document.title.indexOf("King") > -1)) ||
                    (document.readyState === "complete" && language == "EN" && (document.title.indexOf("King") > -1));
            }, system.args[1]);

        }, function onReady() {

            setTimeout(function () {


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

                        waitFor(function check() {
                            return page.evaluate(function () {
                                return document.readyState === "complete";
                            });

                        }, function onReady() {


                            var output = page.evaluate(function () {

                                return $.map($(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[1]), function (ele) {
                                    return (ele.firstChild)?ele.firstChild.data : null ;
                                });

                            });

                            //console.log(JSON.stringify(output));
                            console.log(JSON.stringify(output));

                            //fs.write("/Users/abdulazizm/WebstormProjects/phantomOutput.txt",JSON.stringify(output),'W');

                            setTimeout(function () {
                                phantom.exit();
                            }, 1000);

                        }, 10000);


                    }
                });

            }, 100)
        });
    }
});


//parseDateInfo("");