var Fetcher = new Object();

SEC_TO_SAVE = 10000; // duration to keep records in seconds 

var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;
var path = require('path');
var fs = require('fs');

var async = require('async');

childArgs = [
    '--ignore-ssl-errors=yes',
    '--web-security=no',
    path.join(__dirname, 'fetchKSUphantom2.js'),
    '',
    ''
];


var fetchDurationInSec = 60 * 60 * 24 //one day //[seconds]
var fetchDepsInProgress = false;

//var rawksu = JSON.parse('{"0":{"date":0},"1":{"date":0},"2":{"date":0},"3":{"date":0},"4":{"date":0},"5":{"date":0},"6":{"date":0},"7":{"date":0},"8":{"date":0},"9":{"date":0},"10":{"date":0},"11":{"date":0},"12":{"date":0},"13":{"date":0},"14":{"date":0},"15":{"date":0},"16":{"date":0},"17":{"date":0},"18":{"date":0},"19":{"date":0},"20":{"date":0},"21":{"date":0},"22":{"date":0},"23":{"date":0},"24":{"date":0},"25":{"date":0},"26":{"date":0},"27":{"date":0},"28":{"date":0},"29":{"date":0},"30":{"date":0},"31":{"date":0},"32":{"date":0},"33":{"date":0},"34":{"date":0},"35":{"date":0},"36":{"date":0},"37":{"date":0},"38":{"date":0},"39":{"date":0},"40":{"date":0},"41":{"date":0},"42":{"date":0},"43":{"date":0},"44":{"date":0},"45":{"date":0},"46":{"date":0},"47":{"date":0},"48":{"date":0},"49":{"date":0},"50":{"date":0},"51":{"date":0},"52":{"date":0},"53":{"date":0},"54":{"date":0},"55":{"date":0},"56":{"date":0},"57":{"date":0},"58":{"date":0},"59":{"date":0},"60":{"date":0},"61":{"date":0},"62":{"date":0},"63":{"date":0},"64":{"date":0},"65":{"date":0},"66":{"date":0},"67":{"date":0},"68":{"date":0},"69":{"date":0},"70":{"date":0},"71":{"date":0},"72":{"date":0},"73":{"date":0},"74":{"date":0},"75":{"date":0},"76":{"date":0},"77":{"date":0},"78":{"date":0},"79":{"date":0},"80":{"date":0},"81":{"date":0},"82":{"date":0},"83":{"date":0},"84":{"date":0},"85":{"date":0},"86":{"date":0},"87":{"date":0},"88":{"date":0},"89":{"date":0},"90":{"date":0},"91":{"date":0},"92":{"date":0},"93":{"date":0},"94":{"date":0},"95":{"date":0},"96":{"date":0},"97":{"date":0},"98":{"date":0},"99":{"date":0},"100":{"date":0},"101":{"date":0},"102":{"date":0},"103":{"date":0},"104":{"date":0},"105":{"date":0},"106":{"date":0},"107":{"date":0},"108":{"date":0},"109":{"date":0},"110":{"date":0},"111":{"date":0},"112":{"date":0},"113":{"date":0},"114":{"date":0},"115":{"date":0},"116":{"date":0},"117":{"date":0},"118":{"date":0},"119":{"date":0},"120":{"date":0},"121":{"date":0},"122":{"date":0},"123":{"date":0},"124":{"date":0}}');
var universities = [{"UniversityName": "KSU", "UniversityID": 0, "PlacesFetchDate": 0, "Places": []}]; // JSON.parse('[{"UniversityName":"KSU","UniversityID":0,"PlacesFetchDate":0,"Places":[{"PlaceName":"riyadh males","PlaceID":0,"DegreesFetchDate":0,"Degrees":[{"DegreeName":"bachelor","DegreeID":0,"DepartmentsFetchDate":0,"Departments":[{"DepartmentName":"SWE","DepartmentID":121,"CoursesTitles":[],"Courses":["..."],"CoursesFetchDate":0}]}]}]},{}]');
//{"121": { "date": 0 } ,"122": { "date": 0 }};               //[{"UniversityName":"KSU","UniversityID":"0","PlacesFetchData":0,"Places":[{"PlaceName":"riyadh males","PlaceID":"0","DepartmentsFetchDate":0,"Departments":[{"DepartmentName":"SWE","DepartmentID":"121","CoursesFetchDate":0,"Courses":["..."]}]}]},{}];
var universitiesInfo = [{"departmentsUpdateDate": 0}];//ksu
var DepsFetchDate;
var AllDeps = [];

var dep_queue;
var courses_queue;
var queues = [];
var queuesCur = -1;//uninitialized must be initialized with initQueues()

var updateQueue = function () {//creates queue for every dep in every university
    for (var i = 0; i < universities.length; i++) {
        queue.push([]);//create university
        for (var j in universities[i]["Places"]) {
            if (universities[i]["Places"].hasOwnProperty(j)) {
                queue[queue.length - 1].push([]);//create place
                for (var k in universities[i]["Places"][j]["Degrees"]) {
                    if (universities[i]["Places"][j]["Degrees"].hasOwnProperty(k)) {
                        queue[queue.length - 1][queue[queue.length - 1].length - 1].push([]);//create degree
                        //queue[i][j][k] = [];
                        for (var l in universities[i]["Places"][j]["Degrees"][k]["Departments"]) {
                            if (universities[i]["Places"][j]["Degrees"][k]["Departments"].hasOwnProperty(l)) {
                                queue[queue.length - 1][queue[queue.length - 1].length - 1][queue[queue.length - 1][queue[queue.length - 1].length - 1].length - 1] = new Promise(function (resolve, reject) {
                                    resolve("success");
                                });
                                //queue[i][j][k][l]
                            }

                        }
                    }
                }
            }
        }
    }
};
var initQueues = function () {
    /*
     for (var i = 0; i < 1; i++) {
     queues.push(new Promise(function (resolve, reject) {
     resolve("success");
     }));
     }
     queuesCur = 0;
     */

    courses_queue = async.queue(function (task, callback) {
        fetch(task.UniversityName, task.PlaceID, task.DegreeID, task.DepartmentID, function () {
            callback();
        });
    }, 1);

    dep_queue = async.queue(function (task, callback) {
        fetchDep(task.UniversityName, task.PlaceID, task.DegreeID, function (data, error) {

            //console.log(JSON.stringify(data));
            callback();
        });
    }, 1); //10

}

var queueFetch = function (callback) {
    /*
     if (queuesCur == -1) initQueues();
     if (queuesCur == queues.length) queuesCur = 0;
     queues[queuesCur++].then(callback);
     */


}


var fetch = function fetch(university, placeID, degreeID, depID, callback) {//done

    if (universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID] == undefined) {
        console.log("Error : department does not exist");
        callback(null, "Error : department does not exist : fetch()");
        return;
    } else {
        if (universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["Courses"] != undefined && (Date.now() - universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["CoursesFetchDate"]) < fetchDurationInSec) {
            callback(universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["Courses"], null);

        } else {

            //queues


            //

            var childArgs2 = childArgs;
            childArgs2[3] = depID;
            childArgs2[4] = placeID;
            childArgs2[5] = degreeID;


            //console.log("connecting");

            childProcess.execFile(binPath, childArgs2, function (err, stdout, stderr) {
                var output;

                /* solution 1
                 try {
                 output = JSON.parse(stdout);
                 } catch (error) {
                 console.log(stdout);
                 console.log("Error parsing fetched courses");
                 callback(null, "Error parsing fetched courses");
                 return;
                 }
                 */


                fs.readFile('phantomOutput.txt', 'utf8', function (err, data) {
                    if (err) {
                        console.log(stdout);
                        console.log("Error parsing fetched courses");
                        callback(null, "Error parsing fetched courses");
                        return;
                    }
                    output = JSON.parse(data);


                    if (output["Error"] != undefined) {
                        var e = "Error fetching timed out";
                        console.log(e);
                        callback(null, e);
                        return;
                    }


                    //console.log(JSON.stringify(output));
                    universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["Courses"] = output["courses"];
                    universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["CoursesFetchDate"] = Date.now();

                    var final = sortCourses(universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["Courses"]);
                    final = sortCoursesSimilar2(final);

                    universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["Courses"] = final;

                    /*fs.writeFile(path.join(__dirname, 'out.txt'), JSON.stringify(universities[0][index]), function (err) {
                     if (err) {
                     var e = "Error saving";
                     callback(null, e);
                     }

                     callback(universities[0][index], null);
                     //console.log("The file was saved!");
                     });*/
                    callback(universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["Courses"], null);


                });

            });


        }
    }

    function sortCourses(data) {
        var dataTemp = data;
        var subjects = [];
        var coursesArray = dataTemp;

        coursesArray.sort(function Comparator(a, b) {
            if (a['title'] < b['title']) return -1;
            if (a['title'] > b['title']) return 1;
            return 0;
        });

        //console.log(coursesArray);
        //console.log(coursesArray[0]);


        subjects = coursesArray.reduce(function (previousValue, currentValue, index, array) {
            if (index == 1) {
                if (previousValue['title'].search(currentValue['title']) != -1) {
                    return [
                        [previousValue, currentValue]
                    ];
                } else {
                    return [
                        [previousValue],
                        [currentValue]
                    ];
                }

            } else {
                if (previousValue[previousValue.length - 1][0]['title'].search(currentValue['title']) != -1) {
                    previousValue[previousValue.length - 1].push(currentValue);
                    return previousValue;

                } else {
                    previousValue.push(Array(currentValue));
                    return previousValue;
                }
            }


        });


        return subjects;
    }

    function sortCoursesSimilar(courseBySubjectArrayData) {
        var sortedCoursesByObjectAndTimeArray = [];
        for (var i = 0; i < courseBySubjectArrayData.length; i++) {
            var tempArr = [[courseBySubjectArrayData[i][0]]];
            //console.log("i:   "+i);
            courseBySubjectArrayData[i][0]['sortDone'] = true;
            var numDone = 1;

            while (numDone != courseBySubjectArrayData[i].length) {

                for (var n = 0; n < courseBySubjectArrayData[i].length; n++) { //looking for not done
                    if (courseBySubjectArrayData[i][n]['sortDone'] == undefined) {
                        tempArr.push([courseBySubjectArrayData[i][n]]);
                        courseBySubjectArrayData[i][n]['sortDone'] = true;
                        numDone++;
                        break;
                    }
                }
                for (var j = 0; j < courseBySubjectArrayData[i].length; j++) {

                    if (courseBySubjectArrayData[i][j]['sortDone'] == undefined) {
                        var same = true;
                        for (var o = 0; o < courseBySubjectArrayData[i][j]['courses'].length; o++) {
                            if (tempArr[tempArr.length - 1][0]['courses'][o] != undefined) {

                                for (var k = 1; k < 6; k++) {

                                    if (courseBySubjectArrayData[i][j]['courses'][o]['days']['day' + k] != undefined && tempArr[tempArr.length - 1][0]['courses'][o]['days']['day' + k] != undefined) {
                                        if (courseBySubjectArrayData[i][j]['courses'][o]['days']['day' + k]['from'].search(tempArr[tempArr.length - 1][0]['courses'][o]['days']['day' + k]['from']) == -1
                                            || courseBySubjectArrayData[i][j]['courses'][o]['days']['day' + k]['to'].search(tempArr[tempArr.length - 1][0]['courses'][o]['days']['day' + k]['to']) == -1) {
                                            same = false;
                                            break;
                                        }


                                    } else if (courseBySubjectArrayData[i][j]['courses'][o]['days']['day' + k] != undefined || tempArr[tempArr.length - 1][0]['courses'][o]['days']['day' + k] != undefined) {
                                        same = false;
                                        break;
                                    }
                                }
                                if (!same) break;
                            }
                        }
                        if (same) {
                            tempArr[tempArr.length - 1].push(courseBySubjectArrayData[i][j]);
                            courseBySubjectArrayData[i][j]['sortDone'] = true;
                            numDone++;

                        }
                    }
                }
            }
            sortedCoursesByObjectAndTimeArray.push(tempArr)
        }
        //console.log(sortedCoursesByObjectAndTimeArray)
        return sortedCoursesByObjectAndTimeArray;
    }

    function sortCoursesSimilar2(courseBySubjectArrayData) {
        var courseBySubjectAndTime = [];
        for (var i = 0; i < courseBySubjectArrayData.length; i++) {
            courseBySubjectAndTime.push(sortCoursesWithSameTitle(courseBySubjectArrayData[i]));
        }
        return courseBySubjectAndTime;
    }

    function areCoursesSameTime(course1, course2) {
        for (var i = 0; i < course1['courses'].length; i++) {
            if (course2['courses'][i] == undefined) return true;

            for (var k = 1; k < 6; k++) {
                if (course1['courses'][i]['days']['day' + k] != undefined && course2['courses'][i]['days']['day' + k] != undefined) {
                    if (course1['courses'][i]['days']['day' + k]['from'].search(course2['courses'][i]['days']['day' + k]['from']) > -1
                        && course1['courses'][i]['days']['day' + k]['to'].search(course2['courses'][i]['days']['day' + k]['to']) > -1) {

                    } else return false;


                } else if (course1['courses'][i]['days']['day' + k] == course2['courses'][i]['days']['day' + k]) continue;
                else return false;
            }
        }
        return true;
    }

    function sortCoursesWithSameTitle(coursesToSort) {
        var coursesToSortTemp = JSON.parse(JSON.stringify(coursesToSort));
        var out = [];

        while (coursesToSortTemp.length > 1) {
            var courseTemp = coursesToSortTemp.pop();
            var similarCourses = [];
            var coursesToSortTemp2 = []

            similarCourses.push(courseTemp);
            similarCourses = similarCourses.concat(coursesToSortTemp.filter(function (currentCourse) {
                if (areCoursesSameTime(courseTemp, currentCourse)) {
                    return true;
                } else {
                    coursesToSortTemp2.push(currentCourse);
                }
            }));
            coursesToSortTemp = coursesToSortTemp2
            out.push([]);
            out[out.length - 1] = similarCourses;
        }
        if (coursesToSortTemp.length == 1) {
            out.push([]);
            out[out.length - 1] = coursesToSortTemp;
        }

        return out;
    }
};

var getSubjects = function (university, placeID, degreeID, depID, someSubjects, callback) {

    if (universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID] == undefined) {
        console.log("department does not exist");
        callback(null, "Error : department does not exist : getSubjects()");
        return;
    } else {
        if ((Date.now() - universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["CoursesFetchDate"]) < fetchDurationInSec * 1000) {
            filterSubjects(function (matchedCourses) {
                callback({
                    "data": {"courses": matchedCourses, "department": depID},
                    "date": universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['CoursesFetchDate']
                }, null);

            });


            return;

        } else {


            courses_queue.push({
                'UniversityName': university,
                'PlaceID': placeID,
                'DegreeID': degreeID,
                'DepartmentID': depID
            }, function (error) {

                if (error != null) {
                    callback(null, {"error": "didnt load"});

                } else {
                    filterSubjects(function (matchedCourses) {
                        callback({
                            "data": {"courses": matchedCourses, "department": depID},
                            "date": universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['CoursesFetchDate']
                        }, null);

                    });
                }
            });


            queueFetch(function () {
                fetch(university, placeID, degreeID, depID, function (data, error) {
                    if (error != null) {
                        callback(null, {"error": "didnt load"});

                    } else {
                        filterSubjects(function (matchedCourses) {
                            callback({
                                "data": {"courses": matchedCourses, "department": depID},
                                "date": universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['CoursesFetchDate']
                            }, null);

                        });
                    }

                });
            });

        }
    }

    function filterSubjects(callbackfiltered) {
        var filtered = universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['Courses'].filter(function (course, indexOfCourse) {
            return (someSubjects.indexOf(indexOfCourse) != -1) ? true : false;
        });
        //universities[0][index]['data']['courses'][i][0][0]['title']
        callbackfiltered(filtered);

    };


};


var getSubjectsTitle = function (university, placeID, degreeID, depID, callbackTitles) {

    if (universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID] == undefined) {
        callbackTitles(null, "department does not exist : getSubjectsTitle() ");
        return;
    } else {

        if ((Date.now() - universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]["CoursesFetchDate"]) < fetchDurationInSec * 1000) {
            callbackTitles(universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['CoursesTitles'], null);

        } else {
            courses_queue.push({
                'UniversityName': university,
                'PlaceID': placeID,
                'DegreeID': degreeID,
                'DepartmentID': depID
            }, function (err) {
                getTitle();
            });

            queueFetch(function () {
                fetch(university, placeID, degreeID, depID, getTitle);
            });


        }
    }
    var getTitle = function () {
        if (universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['Courses'] == undefined) callbackTitles(null, "courses not retrieved");
        else {
            var titles = universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['Courses'].map(function (courses) {
                return courses[0][0]['title'];
            });
            universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"][depID]['CoursesTitles'] = titles;
            callbackTitles(titles, null);
        }
    };
}

var fetchDep = function (university, placeID, degreeID, callback) {//done

    var childArgsDepKSU = [
        '--ignore-ssl-errors=yes',
        '--web-security=no',
        path.join(__dirname, 'fetchDepKSUphantom.js'),
        placeID,
        degreeID
    ];


    if (university.indexOf('KSU') > -1) {
        if ((Date.now() - universities[0]["Places"][placeID]["Degrees"][degreeID]["DepartmentsFetchDate"]) < 1000 * fetchDurationInSec) {
            callback(universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"].map(function (currentValue) {
                return currentValue["DepartmentName"]
            }), null);
        } else {
            console.log('starting');
            var childProcess_copy = childProcess;
            childProcess_copy.execFile(binPath, childArgsDepKSU, function (err, stdout, stderr) {
                var timeout_error = false;
                console.log('place: ' + placeID + ' degree: ' + degreeID + ' deps fetched');
                try {
                    console.log(stdout);
                    var output = JSON.parse(stdout);
                    //console.log(output);
                } catch (error) {
                    timeout_error = true;
                    console.log("Error parsing fetched dep");
                    callback(null, "Error parsing fetched dep");
                    return;
                }

                if (output["Error"] != undefined) {
                    var e = "Error loading";
                    console.log(e);
                    console.log();
                    console.log();
                    callback(null, e);
                    return;
                }
                console.log();
                console.log();
                if (!timeout_error) {
                    for (var i = 0; i < output.length; i++) {
                        universities[0]["Places"][placeID]["Degrees"][degreeID]["Departments"].push({
                            "DepartmentName": output[i],
                            "DepartmentID": i,
                            "CoursesFetchDate": 0,
                            "Courses": []
                        });
                    }
                    universities[0]["Places"][placeID]["Degrees"][degreeID]["DepartmentsFetchDate"] = Date.now();

                }

                //updateQueue(); should be after all departments fetched
                callback(output, null);

                return;

            });
        }


    } else {
        console.log('university does not exist');
    }

};

var fetchPlaces = function (university, callback) { //done
    childArgsDepKSU = [
        '--ignore-ssl-errors=yes',
        '--web-security=no',
        path.join(__dirname, 'fetchPlaceKSUphantom.js')
    ];


    if (university.indexOf('KSU') > -1) {
        if ((Date.now() - universities[0]["PlacesFetchDate"]) < 1000 * fetchDurationInSec) {
            callback(universities[0]["Places"].map(function (currentValue) {
                return currentValue["PlaceName"]
            }), null);
        } else {
            universities[0]["Places"] = [];//empty all ksu places
            console.log("running " + path.join(__dirname, 'fetchPlaceKSUphantom.js') + " script");
            console.log(" using:" + binPath);
            childProcess.execFile(binPath, childArgsDepKSU, function (err, stdout, stderr) {

                try {

                    console.log('error: ' + err + ' output:' + stdout);
                    if (err) console.log("error details: " + JSON.stringify(err));
                    var output = JSON.parse(stdout);
                } catch (error) {
                    console.log("Error parsing fetched place");
                    callback(null, "Error parsing fetched place");
                    return;
                }

                if (output["Error"] != undefined) {
                    var e = "Error loading";
                    console.log(e);
                    callback(null, e);
                    return;
                }
                for (var i = 0; i < output.length; i++) {

                    universities[0]["Places"].push({
                        "PlaceName": output[i],
                        "PlaceID": universities[0]["Places"].length,
                        "DegreesFetchDate": 0,
                        "Degrees": []
                    });

                }
                universities[0]["PlacesFetchDate"] = Date.now();
                //updateQueue(); should be in fetchdep
                callback(output, null);
                return;

            });
        }

    } else {
        callback(null, "Error university doesn't exists");
    }

};

var fetchDegrees = function (university, callback) {// Done
    childArgsDepKSU = [
        '--ignore-ssl-errors=yes',
        path.join(__dirname, 'fetchDegreesKSUphantom.js')
    ];


    if (university.indexOf('KSU') > -1) {
        if ((Date.now() - universities[0]["Places"][0]["DegreesFetchDate"]) < 1000 * fetchDurationInSec) {
            callback(universities[0]["Places"][0]["Degrees"].map(function (currentValue) {
                return currentValue["DegreeName"]
            }), null);
        } else {
            childProcess.execFile(binPath, childArgsDepKSU, function (err, stdout, stderr) {

                try {
                    var output = JSON.parse(stdout);
                } catch (error) {
                    console.log("Error parsing fetched dep");
                    callback(null, "Error parsing fetched dep");
                    return;
                }

                if (output["Error"] != undefined) {
                    var e = "Error loading";
                    console.log(e);
                    callback(null, e);
                    return;
                }
                for (var i = 0; i < output.length; i++) {
                    for (var j = 0; j < universities[0]["Places"].length; j++) {
                        universities[0]["Places"][j]["Degrees"].push({
                            "DegreeName": output[i],
                            "DegreeID": i,
                            "DepartmentsFetchDate": 0,
                            "Departments": []
                        });
                    }
                }
                universities[0]["Places"][0]["DegreesFetchDate"] = Date.now();
                //updateQueue(); should be in fetchdep
                callback(output, null);
                return;

            });
        }

    } else {
        callback(null, "Error university doesn't exists");
    }

};

var fetchDeps = function (callback) {

    if (callback != undefined) {
        callback(getDeps());
        return;
    }
    if (fetchDepsInProgress) {
        return;
    }

    fetchDepsInProgress = true;

    var TotalDepsFetched = 0;
    var TotalDepsUpdated = 0;
    var starttime = Date.now();


    for (var k = 0; k < universities.length; k++) {

        (function () {
            var uniname = universities[k]['UniversityName'];
            var uniIndex = k;
            fetchPlaces(uniname, function (data, error) {
                if (error != null) {

                    console.log(error);
                    fetchDepsInProgress = false;
                } else {
                    //test
                    if ((Date.now() - starttime) > 50) console.log(data.length + ' places fetched');
                    fetchDegrees(uniname, function (data2, error2) {
                        if (error2 != null) {

                            console.log(error2);
                            fetchDepsInProgress = false;
                        } else {
                            if ((Date.now() - starttime) > 50) console.log(data2.length + ' degrees fetched');


                            for (var i = 0; i < universities[uniIndex]["Places"].length; i++) {
                                if (process.env.NODE_ENV === 'development' && i != 0)
                                    continue;

                                for (var j = 0; j < universities[uniIndex]["Places"][i]["Degrees"].length; j++) {
                                    //console.log('fetching place:' + i + ' degree:' + j);


                                    if (process.env.NODE_ENV === 'development' && j != 4)
                                        continue;


                                    (function () {
                                        var placeindex = i;
                                        var degreeIndex = j;
                                        TotalDepsFetched++;

                                        dep_queue.push({
                                            'UniversityName': uniname,
                                            'PlaceID': placeindex,
                                            'DegreeID': degreeIndex
                                        }, function (err) {


                                        });

                                        /*
                                         queueFetch(function (value) {
                                         fetchDep(uniname, placeindex, degreeIndex, function (data3, error3) {


                                         if (placeindex + 1 == universities[uniIndex]["Places"].length && degreeIndex + 1 == universities[uniIndex]["Places"][placeindex]["Degrees"].length) {
                                         console.log('finished fetching ' + TotalDepsFetched + ' departments in ' + (Date.now() - starttime) / 1000 + ' secs');
                                         }
                                         return;
                                         });
                                         });
                                         */
                                    })();
                                }
                            }
                            dep_queue.drain = function () {
                                if ((Date.now() - starttime) > 50) console.log(TotalDepsFetched + ' departments fetched in ' + (Date.now() - starttime) / 1000 + ' secs');
                                fetchDepsInProgress = false;
                            };

                        }

                    });
                }
            })
        })();
    }


}

var getDeps = function () {
    var allDeps = universities.map(function (currentUniversity) {
        return {
            "UniversityID": currentUniversity["UniversityID"],
            "UniversityName": currentUniversity["UniversityName"],
            "Places": currentUniversity["Places"].map(function (currentPlace) {
                return {
                    "PlaceID": currentPlace["PlaceID"],
                    "PlaceName": currentPlace["PlaceName"],
                    "Degrees": currentPlace["Degrees"].map(function (currentDegree) {
                        return {
                            "DegreeName": currentDegree["DegreeName"],
                            "DegreeID": currentDegree["DegreeID"],
                            "Departments": currentDegree["Departments"].map(function (currentDepartment) {
                                return {
                                    "DepartmentName": currentDepartment["DepartmentName"],
                                    "DepartmentID": currentDepartment["DepartmentID"]
                                };
                            })
                        };
                    })
                };
            })
        }
    });
    return allDeps;
}


var isUniversityExist = function (uniName) { // no need
    for (var uni in universities) {
        if (universities[uni]["UniversityName"] == uniName)
            return true
    }
    return false;
};


//module.exports = { "fetch": fetch };
module.exports = function () {
    initQueues();

    setInterval(fetchDeps, 6 * 1000);//60*60*1000

    fetchDeps();

    return {


        "fetch": function (university, placeID, degreeID, depID, callback) {
            var uni = 0;

            //here you can add other universities
            if (university == "KSU") uni = 0;  //add ksu university
            //
            //

            courses_queue.push({
                'UniversityName': university,
                'PlaceID': placeID,
                'DegreeID': degreeID,
                'DepartmentID': depID
            }, function (err) {
                callback();
            });

            queueFetch(function () {
                fetch(university, placeID, degreeID, depID, callback)
            });
        },
        "getSubjects": getSubjects,
        "getSubjectsTitle": getSubjectsTitle,
        "fetchDep": fetchDep,
        "fetchDegrees": fetchDegrees,
        "fetchPlaces": fetchPlaces,
        "fetchDeps": fetchDeps
    }
};