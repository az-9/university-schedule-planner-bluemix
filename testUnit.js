/**
 * Created by abdulazizm on 6/7/15.
 */








var fetchedCurses=(function (id) {


    function parseDateInfo(str) {
        var days = {};

        var splitTimes = str.split("@n ");
        for (var i = 0; i < splitTimes.length; i++) {
            for (var j = 1; j < splitTimes[i].search("@t") ; j = j + 2) {
                var am = (splitTimes[i].search("ص") == -1) ? false : true;
                if (am) {
                    days['day' + splitTimes[i].charAt(j)] = { 'from': (splitTimes[i].slice(splitTimes[i].search("@t") + 3, splitTimes[i].search("@t") + 8)), 'to': (splitTimes[i].slice(splitTimes[i].search("@t") + 13, splitTimes[i].search("@t") + 18)), 'place': splitTimes[i].slice(splitTimes[i].search("@r") + 2, splitTimes[i].length) };
                }
                else {
                    var tf = parseInt(splitTimes[i].charAt(splitTimes[i].search("@t") + 3) + splitTimes[i].charAt(splitTimes[i].search("@t") + 4)) + 12;
                    var tf2 = parseInt(splitTimes[i].charAt(splitTimes[i].search("@t") + 13) + splitTimes[i].charAt(splitTimes[i].search("@t") + 14)) + 12;
                    //console.log(splitTimes[i].charAt(splitTimes[i].search("@t") + 5));
                    days['day' + splitTimes[i].charAt(j)] = { 'from': tf.toString() + (splitTimes[i].slice(splitTimes[i].search("@t") + 5, splitTimes[i].search("@t") + 8)), 'to': tf2 + "" + (splitTimes[i].slice(splitTimes[i].search("@t") + 15, splitTimes[i].search("@t") + 18)), 'place': splitTimes[i].slice(splitTimes[i].search("@r") + 2, splitTimes[i].length) };
                }
            }
        }
        //console.log(days);
        return days
    }


    //console.log(table);
    var DepartmentCourses = { 'department': id, 'courses': [] };
    var course = {};
    course['courses'] = [];

    var rows;
    //var titles= JSON.stringify($.map($('[id^=stree]'), function (ele) { return ele.text }));


    rows = $("#myForm\\:timetable").children().eq(1).find('tr');

    rows.sort(function (a, b) {
        return parseInt(a.children[2].innerHTML) == parseInt(b.children[2].innerHTML)
            ? 0
            : (parseInt(a.children[2].innerHTML) > parseInt(b.children[2].innerHTML) ? 1 : -1);
    });



    for (var i = 0; i < rows.length; i++) {//rows.length

        if (rows[i].children[3].innerHTML.search('محاضرة') == -1 && rows[i].children[0].innerHTML.search(course['title']) != -1) {
            var lectuer = {};
            lectuer['available'] = (rows[i].children[6].children[0].innerHTML.search("مفتوحة") == -1) ? false : true;
            if(rows[i].children[7].children[0].children[1].value.length>5){
                lectuer['days'] = parseDateInfo(rows[i].children[7].children[0].children[1].value);
            }else{
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
            if(rows[i].children[7].children[0].children[1].value.length>5){
                lectuer['days'] = parseDateInfo(rows[i].children[7].children[0].children[1].value);
            }else{
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

})(121);

var final=sortCourses({"data":fetchedCurses});
final =sortCoursesSimilar(final);
console.log(final);
getTitle(function(tit){console.log(tit)});















function getTitle(callback) {
    console.log("get titles index:"+index);
    if(final==undefined) callback(null, "courses not retrieved");
    else{
        var titles = final.map(function (courses) {
            return courses[0][0]['title'];
        });
        final['titles'] = titles;
        callback(titles, null);
    }
}    ;

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
};
