/**
 * Created by Abdulaziz on 10/8/2014.
 */

var system = require('system');
var fs = require('fs');
var page = require('webpage').create();
//phantom.clearCookies();


page.onResourceError = function (resourceError) {
    //page.reason = resourceError.errorString;
    //page.reason_url = resourceError.url;
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
        var auth;
        page.evaluate(function (placeID) {
            $(document).ready(function () {
                $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[1]).eq(placeID).click();
            });
        }, system.args[2]);


        waitFor(function check() {
            return page.evaluate(function (placeID) {
                return document.readyState === "complete" && $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all.ui-state-highlight", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[1]).index() == parseInt(placeID)
            }, system.args[2]);

        }, function onReady() {
            page.evaluate(function (degreeID) {

                $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[2]).eq(parseInt(degreeID)).click();

            }, system.args[3]);

            waitFor(function check() {
                return page.evaluate(function (degreeID, placeID) {
                    return document.readyState === "complete" && $(".pui-dropdown-item.pui-dropdown-list-item.ui-corner-all.ui-state-highlight", $(".pui-dropdown-items.pui-dropdown-list.ui-widget-content.ui-widget.ui-helper-reset")[2]).index() == (parseInt(degreeID) + parseInt(placeID));
                }, system.args[3], system.args[2]);

            }, function onReady() {

                page.evaluate(function (id) {
                    setIndex(id);
                }, system.args[1]);

            })


        });

        waitFor(function check() {
            return page.evaluate(function () {
                // ensure #first and #last are in the DOM
                //return !!document.getElementsByClassName('ROW1')[0];
                return document.readyState === "complete" && !!document.getElementsByClassName('ROW1')[0];
            });

        }, function onReady() {


            var output = page.evaluate(function (id) {


                function parseDateInfo(str) {
                    var days = {};

                    var splitTimes = str.split("@n ");
                    for (var i = 0; i < splitTimes.length; i++) {
                        for (var j = 1; j < splitTimes[i].search("@t"); j = j + 2) {
                            var am = (splitTimes[i].search("ص") == -1) ? false : true;
                            if (am) {
                                days['day' + splitTimes[i].charAt(j)] = {
                                    'from': (splitTimes[i].slice(splitTimes[i].search("@t") + 3, splitTimes[i].search("@t") + 8)),
                                    'to': (splitTimes[i].slice(splitTimes[i].search("@t") + 13, splitTimes[i].search("@t") + 18)),
                                    'place': splitTimes[i].slice(splitTimes[i].search("@r") + 2, splitTimes[i].length)
                                };
                            }
                            else {
                                var tf = parseInt(splitTimes[i].charAt(splitTimes[i].search("@t") + 3) + splitTimes[i].charAt(splitTimes[i].search("@t") + 4)) + 12;
                                var tf2 = parseInt(splitTimes[i].charAt(splitTimes[i].search("@t") + 13) + splitTimes[i].charAt(splitTimes[i].search("@t") + 14)) + 12;
                                //console.log(splitTimes[i].charAt(splitTimes[i].search("@t") + 5));
                                days['day' + splitTimes[i].charAt(j)] = {
                                    'from': tf.toString() + (splitTimes[i].slice(splitTimes[i].search("@t") + 5, splitTimes[i].search("@t") + 8)),
                                    'to': tf2 + "" + (splitTimes[i].slice(splitTimes[i].search("@t") + 15, splitTimes[i].search("@t") + 18)),
                                    'place': splitTimes[i].slice(splitTimes[i].search("@r") + 2, splitTimes[i].length)
                                };
                            }
                        }
                    }
                    //console.log(days);
                    return days
                }


                //console.log(table);
                var DepartmentCourses = {'department': id, 'courses': []};
                var course = {};
                course['courses'] = [];

                var rows;
                //var titles= JSON.stringify($.map($('[id^=stree]'), function (ele) { return ele.text }));


                rows = $("#myForm\\:timetable").children().eq(1).find('tr');

                rows.sort(function (a, b) {
                    return parseInt(a.children[2].innerHTML) == parseInt(b.children[2].innerHTML) ? 0 : (parseInt(a.children[2].innerHTML) > parseInt(b.children[2].innerHTML) ? 1 : -1);
                });


                for (var i = 0; i < rows.length; i++) {//rows.length

                    if (rows[i].children[3].innerHTML.search('محاضرة') == -1 && rows[i].children[0].innerHTML.search(course['title']) != -1) {
                        var lectuer = {};
                        lectuer['available'] = (rows[i].children[6].children[0].innerHTML.search("مفتوحة") == -1) ? false : true;
                        if (rows[i].children[7].children[0].children[1].value.length > 5) {
                            lectuer['days'] = parseDateInfo(rows[i].children[7].children[0].children[1].value);
                        } else {
                            lectuer['days'] = {};
                        }

                        lectuer['teacher'] = rows[i].children[7].children[0].children[0].value.replace(/["']/g, '');
                        lectuer['type'] = rows[i].children[3].innerHTML.replace(/["']/g, '');
                        lectuer['section'] = parseInt(rows[i].children[2].innerHTML.replace(/["']/g, ''));

                        course['courses'].push(lectuer);
                    } else {
                        var course = {};
                        course['courses'] = [];

                        course['title'] = rows[i].children[0].innerHTML.replace(/["']/g, '');
                        course['description'] = rows[i].children[1].innerHTML.replace(/["']/g, '');
                        //course['section'] = parseInt(rows[i].children[2].innerHTML.replace(/["']/g, ''));
                        course['sex'] = (rows[i].children[5].innerHTML.search("ذكر") == -1) ? 'F' : 'M';
                        course['hours'] = parseInt(rows[i].children[4].innerHTML.replace(/["']/g, ''));

                        var lectuer = {};
                        lectuer['available'] = (rows[i].children[6].children[0].innerHTML.search("مفتوحة") == -1) ? false : true;
                        if (rows[i].children[7].children[0].children[1].value.length > 5) {
                            lectuer['days'] = parseDateInfo(rows[i].children[7].children[0].children[1].value);
                        } else {
                            lectuer['days'] = {};
                        }
                        lectuer['teacher'] = rows[i].children[7].children[0].children[0].value.replace(/["']/g, '');
                        lectuer['type'] = rows[i].children[3].innerHTML.replace(/["']/g, '');
                        lectuer['section'] = parseInt(rows[i].children[2].innerHTML.replace(/["']/g, ''));

                        course['courses'][0] = lectuer;

                        DepartmentCourses['courses'].push(course);
                    }


                    //rows[i];
                }

                //console.log(JSON.stringify(DepartmentCourses));


                return DepartmentCourses;

            }, system.args[1]);
            fs.write("phantomOutput.txt", JSON.stringify(output), 'W');
            //console.log(JSON.stringify(output));


            setTimeout(function () {
                phantom.exit();
            }, 1000);

        }, 10000);


    }
});


//parseDateInfo("");