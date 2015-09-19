

var Fetcher = new Object();

SEC_TO_SAVE = 10000; // duration to keep records in seconds 

var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;
var path = require('path');
var fs = require('fs');

childArgs = [
    '--ignore-ssl-errors=yes',
    path.join(__dirname, 'fetchKSUphantom.js'),
    '',
    ''
];

//var rawksu = JSON.parse('{"0":{"date":0},"1":{"date":0},"2":{"date":0},"3":{"date":0},"4":{"date":0},"5":{"date":0},"6":{"date":0},"7":{"date":0},"8":{"date":0},"9":{"date":0},"10":{"date":0},"11":{"date":0},"12":{"date":0},"13":{"date":0},"14":{"date":0},"15":{"date":0},"16":{"date":0},"17":{"date":0},"18":{"date":0},"19":{"date":0},"20":{"date":0},"21":{"date":0},"22":{"date":0},"23":{"date":0},"24":{"date":0},"25":{"date":0},"26":{"date":0},"27":{"date":0},"28":{"date":0},"29":{"date":0},"30":{"date":0},"31":{"date":0},"32":{"date":0},"33":{"date":0},"34":{"date":0},"35":{"date":0},"36":{"date":0},"37":{"date":0},"38":{"date":0},"39":{"date":0},"40":{"date":0},"41":{"date":0},"42":{"date":0},"43":{"date":0},"44":{"date":0},"45":{"date":0},"46":{"date":0},"47":{"date":0},"48":{"date":0},"49":{"date":0},"50":{"date":0},"51":{"date":0},"52":{"date":0},"53":{"date":0},"54":{"date":0},"55":{"date":0},"56":{"date":0},"57":{"date":0},"58":{"date":0},"59":{"date":0},"60":{"date":0},"61":{"date":0},"62":{"date":0},"63":{"date":0},"64":{"date":0},"65":{"date":0},"66":{"date":0},"67":{"date":0},"68":{"date":0},"69":{"date":0},"70":{"date":0},"71":{"date":0},"72":{"date":0},"73":{"date":0},"74":{"date":0},"75":{"date":0},"76":{"date":0},"77":{"date":0},"78":{"date":0},"79":{"date":0},"80":{"date":0},"81":{"date":0},"82":{"date":0},"83":{"date":0},"84":{"date":0},"85":{"date":0},"86":{"date":0},"87":{"date":0},"88":{"date":0},"89":{"date":0},"90":{"date":0},"91":{"date":0},"92":{"date":0},"93":{"date":0},"94":{"date":0},"95":{"date":0},"96":{"date":0},"97":{"date":0},"98":{"date":0},"99":{"date":0},"100":{"date":0},"101":{"date":0},"102":{"date":0},"103":{"date":0},"104":{"date":0},"105":{"date":0},"106":{"date":0},"107":{"date":0},"108":{"date":0},"109":{"date":0},"110":{"date":0},"111":{"date":0},"112":{"date":0},"113":{"date":0},"114":{"date":0},"115":{"date":0},"116":{"date":0},"117":{"date":0},"118":{"date":0},"119":{"date":0},"120":{"date":0},"121":{"date":0},"122":{"date":0},"123":{"date":0},"124":{"date":0}}');
var universities = [[]];//{"121": { "date": 0 } ,"122": { "date": 0 }};               //JSON.parse('[{"UniversityName":"KSU","UniversityID":"0","PlacesFetchData":0,"Places":[{"PlaceName":"riyadh males","PlaceID":"0","DepartmentsFetchDate":0,"Departments":[{"DepartmentName":"SWE","DepartmentID":"121","Courses":["..."],"DataFetchDate":0}]}]},{}]');
var universitiesInfo=[{"departmentsUpdateDate":0}];//ksu

var queue = [];

var updateQueue=function () {//creates queue for every dep in every university
    for (var i = 0; i < universities.length; i++) {
        queue[i] = {};
        for (var j in universities[i]) {
            if (universities[i].hasOwnProperty(j)) {
                queue[i][j] = new Promise(function (resolve, reject) {
                    resolve("success");
                });
            }
        }
    }
};

var fetch = function fetch(university, placeID, depID, callback) {
    console.log("fetching dep:"+depID);
    
    if (universities[0][depID] == undefined) {
        console.log("Error : department does not exist");
        callback(null, "Error : department does not exist");
        return;
    } else {
        if (universities[0][depID]["data"] != undefined && ((Date.now() - universities[0][depID]["date"]) / 1000) < SEC_TO_SAVE) {
            callback(universities[0][depID], null);
            
        } else {
            //queues
            
            
            
            //
            
            childArgs2 = childArgs;
            childArgs2[2] = depID;
            childArgs2[3] = placeID;

            
            //console.log("connecting");
            
            childProcess.execFile(binPath, childArgs2, function (err, stdout, stderr) {
                var output
                try {
                    output = JSON.parse(stdout);
                } catch (error) {
                    console.log(stdout);
                    console.log("Error parsing fetched courses");
                    callback(null, "Error parsing fetched courses");
                    return;
                }
                
                if (output["Error"] != undefined) {
                    var e = "Error loading";
                    console.log(e);
                    callback(null, e);
                    return;
                }
                //console.log(JSON.stringify(output));
                universities[0][depID]['data'] = output;
                universities[0][depID]['date'] = Date.now();
                
                var final = sortCourses(universities[0][depID]);
                final = sortCoursesSimilar(final);
                
                universities[0][depID]['data']['courses'] = final;
                
                /*fs.writeFile(path.join(__dirname, 'out.txt'), JSON.stringify(universities[0][index]), function (err) {
                    if (err) {
                        var e = "Error saving";
                        callback(null, e);
                    }
                    
                    callback(universities[0][index], null);
                    //console.log("The file was saved!");
                });*/
                callback(universities[0][depID], null);
                
            });
            
            
        }
    }
    
    function sortCourses(data) {
        var dataTemp = data;
        var subjects = [];
        var coursesArray = dataTemp['data']['courses'];
        
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
        return sortedCoursesByObjectAndTimeArray;
    }
};

var getSubjects = function (university, placeID,depID, someSubjects, callback) {

    if (universities[0][depID] == undefined) {
        console.log("department does not exist");
        callback(null, "Error : department does not exist");
        return;
    } else {
        if (universities[0][depID]["data"] != undefined && ((Date.now() - universities[0][depID]["date"]) / 1000) < SEC_TO_SAVE) {
            filterSubjects(function (matchedCourses) {
callback({ "data": { "courses": matchedCourses , "department": depID }, "date": universities[0][depID]['date'] }, null);
            
            });
            
            
            return;
            
        } else {
            queue[0][depID].then(function () {
                fetch(university, placeID,depID, function (data, error) {
                    if (error != null) {
                        callback(null, {"error":"didnt load"});
            
                    } else {
                        filterSubjects(function (matchedCourses) {
                            callback({ "data": { "courses": matchedCourses , "department": depID }, "date": universities[0][depID]['date'] }, null);
            
                        });
                    }
                    
                });
            });
            
        }
    }
    
    function filterSubjects(callbackfiltered) {
        var filtered = universities[0][depID]['data']['courses'].filter(function (course, indexOfCourse) {
            return (someSubjects.indexOf(indexOfCourse) != -1)?true:false;
        });
        //universities[0][index]['data']['courses'][i][0][0]['title']
        callbackfiltered( filtered);
        
    }    ;
    
    function filterSubjects2() {
        var filtered = universities[0][depID]['data']['courses'].filter(function (course) {
            return (someSubjects.indexOf(course[0][0]['title']) != -1)?true:false;
        });
        //universities[0][index]['data']['courses'][i][0][0]['title']
        callback({ "data": { "courses": filtered , "department": depID }, "date": universities[0][depID]['date'] }, null);
    }    ;
};




var getSubjectsTitle = function (university,placeID, depID, callbackTitles) {

    if (universities[0][depID] == undefined) {
        callbackTitles(null, "department does not exist");
        return;
    } else {

        if (universities[0][depID]["titles"] != undefined && ((Date.now() - universities[0][depID]["date"]) / 1000) < SEC_TO_SAVE) {
            callbackTitles(universities[0][depID]['titles'], null);
            
        } else {
            queue[0][depID].then(function () {
                console.log("queueing dep:"+depID);
                fetch(university, placeID,depID, getTitle);
            });
            
        }
    }
    var getTitle= function () {
        console.log("get titles index:"+depID);
        if(universities[0][depID]['data']==undefined) callbackTitles(null, "courses not retrieved");
        else{
        var titles = universities[0][depID]['data']['courses'].map(function (courses) {
            return courses[0][0]['title'];
        });
        universities[0][depID]['titles'] = titles;
            callbackTitles(titles, null);
        }
    }    ;
}

var fetchDep=function(university,placeID, callback){
    childArgsDepKSU = [
        '--ignore-ssl-errors=yes',
        path.join(__dirname, 'fetchDepKSUphantom.js'),
        placeID
    ];


    if(university.indexOf('KSU')>-1){
        if(universitiesInfo[0]["departmentsUpdateDate"]!=undefined){
            if((Date.now() -universitiesInfo[0]["departmentsUpdateDate"])<1000*60*60*24){
                callback(universities[0],null);
            }else{
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
                    universities[0]=output;
                    universitiesInfo[0]["departmentsUpdateDate"]=Date.now();
                    updateQueue();
                    callback(output,null);
                    return;

                });
            }

        }else{
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
                universities[0]=output;
                universitiesInfo[0]={};
                universitiesInfo[0]["departmentsUpdateDate"]=Date.now();
                updateQueue();
                callback(output,null);

            });
        }

    }

};






//needs modifications

var fetchPlaces=function(university, callback){
    childArgsDepKSU = [
        '--ignore-ssl-errors=yes',
        path.join(__dirname, 'fetchPlaceKSUphantom.js')
    ];


    if(university.indexOf('KSU')>-1){
        if(universitiesInfo[0]["placesUpdateDate"]!=undefined){
            if((Date.now() -universitiesInfo[0]["placesUpdateDate"])<1000*60*60*24){
                callback(universities[0],null);
            }else{
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
                    universities[0]=output;
                    universitiesInfo[0]["placesUpdateDate"]=Date.now();
                    updateQueue();
                    callback(output,null);
                    return;

                });
            }

        }else{
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
                universities[0]=output;
                universitiesInfo[0]={};
                universitiesInfo[0]["placesUpdateDate"]=Date.now();
                updateQueue();
                callback(output,null);

            });
        }

    }

};








//module.exports = { "fetch": fetch };
module.exports = {
    "fetch": function (university, placeID,index, callback) {
        var uni = 0;
        
        //here you can add other universities
        if (university == "ksu") uni = 0;  //add ksu university
        //
        //
        
        queue[0][index].then(function () {
            fetch(university, placeID,index, callback)
        });
    },
    "getSubjects": getSubjects,
    "getSubjectsTitle": getSubjectsTitle,
    "fetchDep":fetchDep
};