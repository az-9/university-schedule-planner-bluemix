/**
 * Created by abdulazizm on 6/10/15.
 */
var aiii = []

var scheduleplanner = {
    calculateSchedule: function (chosenSubjects) { //After filter
        var schedules = [];
        var schedulesComb = scheduleplanner.cartesian(chosenSubjects);

        //console.log(schedulesComb);
        for (var i = 0; i < schedulesComb.length; i++) {
            var valid = true;
            for (var j = 0; j < schedulesComb[i].length - 1; j++) {

                for (var k = j + 1; k < schedulesComb[i].length; k++) {
                    if (scheduleplanner.isConflict(schedulesComb[i][j][0], schedulesComb[i][k][0])) {
                        valid = false;
                        break;
                    }
                }
                if (!valid) break;
            }
            if (valid) {
                var combAvailable = schedulesComb[i].every(function (currentSubject) {
                    return currentSubject.every(function (currentCourse) {
                        return currentCourse["courses"].every(function (currentObject) {
                            return currentObject["available"];
                        });
                    });
                });
                if (combAvailable)
                    schedulesComb[i]["available"] = true;
                else
                    schedulesComb[i]["available"] = false;

                //console.log(schedulesComb[i]);
                schedules.push(schedulesComb[i]);
            }
        }
        scheduleplanner.availableSelectedCourses = schedules.filter(function (filterArrayEle) {
            return filterArrayEle["available"];
        });
        //console.log(availableSelectedCourses);
        scheduleplanner.calculatedSchedule = schedules;
        return schedules;

    },
    isConflict: function (o1, o2) {
        var valid = true;
        for (var i = 0; i < o1['courses'].length; i++) {

            for (var j = 0; j < o2['courses'].length; j++) {
                for (var k = 1; k < 6; k++) {
                    if (o1['courses'][i]['days']['day' + k] != undefined && o2['courses'][j]['days']['day' + k] != undefined) {
                        //console.log('reached');
                        if (o1['courses'][i]['days']['day' + k]['from'] > o2['courses'][j]['days']['day' + k]['from'] && o1['courses'][i]['days']['day' + k]['from'] > o2['courses'][j]['days']['day' + k]['to']) {

                        } else if (o1['courses'][i]['days']['day' + k]['from'] < o2['courses'][j]['days']['day' + k]['from'] && o1['courses'][i]['days']['day' + k]['to'] < o2['courses'][j]['days']['day' + k]['from']) {

                        } else {
                            valid = false;
                            break;
                        }
                    }
                }
                if (!valid) break;
            }
            if (!valid) break;
        }
        return !valid;
    },
    cartesian: function (arg) {
        var r = [], max = arg.length - 1;

        function helper(arr, i) {
            for (var j = 0, l = arg[i].length; j < l; j++) {
                var a = arr.slice(0); // clone arr
                a.push(arg[i][j]);
                if (i == max) {
                    r.push(a);
                } else
                    helper(a, i + 1);
            }
        }

        helper([], 0);
        return r;
    },
    filterSubjects: function (courseBySubjectSimilarArray, chosenSubjectsStringArray) {//{"ريض 106",""101 سلم},"" //deprecated
        chosenSubjectsStringArray.sort();

        var chosen = [];
        for (var i = 0; i < chosenSubjectsStringArray.length; i++) {
            for (var j = 0; j < courseBySubjectSimilarArray.length; j++) {
                if (chosenSubjectsStringArray[i].search(courseBySubjectSimilarArray[j][0][0]['title']) != -1) {
                    chosen.push(courseBySubjectSimilarArray[j]);
                    break;
                }
            }
        }
        return chosen;
    },
    sortCourses: function (data) { //deprecated
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
    },
    sortCoursesSimilar: function (courseBySubjectArrayData) { //deprecated
        var sortedCoursesByObjectAndTimeArray = [];
        for (var i = 0; i < courseBySubjectArrayData.length; i++) {
            var tempArr = [
                [courseBySubjectArrayData[i][0]]
            ];
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
    },


    /**
     *
     * // global till end
     */
    selectedUniversity: 0,
    selectedDepartment: 0,
    selectedDegree: 0,
    selectedPlace: 0,
    calculatedSchedule: []
    ,
    coursesInDepartment: JSON.parse('["100 سلم","101 ادا","101 سلم","101 كيح","101 كيم","102 سلم","103 سلم","103 فيز","104 سلم","104 فيز","105 سلم","106 ريض","106 سلم","107 سلم","108 سلم","111 عال","113 عال","122 بحث","151 ريض","200 ريض","200 مال","201 حسب","211 هاب","212 عال","215 عال","220 عال","227 عال","230 نال","244 ريض","254 ريض","303 هال","312 هاب","313 هاب","321 هاب","324 احص","333 هاب","335 نال","361 عال","381 هاب","385 نال","432 نال","434 هاب","439 هال","444 هاب","444 هال","455 هاب","466 هاب","472 نال","476 عال","477 هاب","478 عال","481 هاب","482 نال","485 هاب","493 نال","496 هاب","497 هاب","999 هاب"]')
    ,
    selectedCoursesByIndex: []//[0,3,21]
    ,
    selectedCourses: []
    ,
    coursesTitles: []//previously coursesInDepartment ['math 200','computer 101','physics 106']
    ,
    availableSelectedCourses: []
    ,
    namesOfWantedTeachers: []//sorted by coursesAddList form order [['ahmed','khalid'],['bader']]
    ,
    namesOfUnwantedTeachers: []//sorted by coursesAddList form order [['ahmed','khalid'],['bader']],

    ,
    getCoursesTitles: function (uni, uniPlace, uniDegree, uniDepartment, callback) { //helper

        scheduleplanner.selectedUniversity = uni;
        scheduleplanner.selectedDepartment = uniDepartment;
        scheduleplanner.selectedDegree = uniDegree;
        scheduleplanner.selectedPlace = uniPlace;

        var pathtoRequest = ($(location).attr('href')[$(location).attr('href').length - 1].indexOf("/") > -1) ? $(location).attr('href') + "getcoursestitle/" : $(location).attr('href') + "/getcoursestitle/";
        $.get(pathtoRequest + '{"department":' + scheduleplanner.selectedDepartment + ',"degree":' + scheduleplanner.selectedDegree + ',"place":' + scheduleplanner.selectedPlace + ',"university":' + scheduleplanner.selectedUniversity + '}', function (data, status) {
            try {
                if (status == 'success') {


                    if (JSON.parse(data)["error"] != undefined) {
                        callback();
                    } else {

                        scheduleplanner.coursesTitles = JSON.parse(data);

                        callback(scheduleplanner.coursesTitles);

                    }
                } else {
                    console.log('status:' + status);
                    callback();
                }
            } catch (e) {
                console.log(e);
                callback();
            }
        }).fail(function () {
            callback();
        });
    }
    ,

    getCoursesByIndexAndCalculateSchedule: function (indexArray, callback) { //helper
        scheduleplanner.selectedCoursesByIndex = indexArray;
        var pathtoRequest = ($(location).attr('href')[$(location).attr('href').length - 1].indexOf("/") > -1) ? $(location).attr('href') + "getcourses/" : $(location).attr('href') + "/getcourses/";
        $.get(pathtoRequest + '{"coursesIndex":' + JSON.stringify(indexArray) + ',"department":' + scheduleplanner.selectedDepartment + ',"degree":' + scheduleplanner.selectedDegree + ',"place":' + scheduleplanner.selectedPlace + ',"university":' + scheduleplanner.selectedUniversity + '}', function (data, status) {
            //console.log(JSON.parse(data));
            try {
                if (status == 'success') {

                    if (JSON.parse(data)["error"] != undefined) {
                        callback();
                    } else {
                        scheduleplanner.selectedCourses = JSON.parse(data)["data"]["courses"];

                        console.log(scheduleplanner.selectedCourses);

                        //wanted teachers
                        var selectedCoursesAfterGettingWantedTeachers = scheduleplanner.selectedCourses.map(function (subjects_Array, subjectIndex) {// keep only wanted teachers
                            if (scheduleplanner.namesOfWantedTeachers[subjectIndex].length == 0)return subjects_Array;
                            else
                                return subjects_Array.filter(function (courses_Array) {
                                    return courses_Array.filter(function (section_Object) {
                                        var exist = false;
                                        section_Object['courses'].forEach(function (section_) {
                                            console.log("section teacher:" + section_.teacher + " wanted teachers:" + scheduleplanner.namesOfWantedTeachers[subjectIndex]);
                                            if (isTeacherIn(section_, scheduleplanner.namesOfWantedTeachers[subjectIndex])) {
                                                console.log("true");
                                                exist = true;
                                            }
                                        });
                                        console.log("exist:" + exist);
                                        return exist;
                                    }).length;
                                })
                        });

                        var selectedCoursesAfterRemovingUnwantedTeachers = selectedCoursesAfterGettingWantedTeachers.map(function (subjects_Array, subjectIndex) {// remove unwanted teachers
                            if (scheduleplanner.namesOfUnwantedTeachers[subjectIndex].length == 0)return subjects_Array;
                            else
                                return subjects_Array.filter(function (courses_Array) {
                                    return courses_Array.filter(function (section_Object) {
                                        var exist = false;
                                        section_Object['courses'].forEach(function (section_) {
                                            console.log("section teacher:" + section_.teacher + " wanted teachers:" + scheduleplanner.namesOfUnwantedTeachers[subjectIndex]);
                                            if (isTeacherIn(section_, scheduleplanner.namesOfUnwantedTeachers[subjectIndex])) {
                                                console.log("true");
                                                exist = true;
                                            }
                                        });
                                        console.log("exist:" + exist);
                                        return !exist;
                                    }).length;
                                })
                        })

                        function isTeacherIn(section_, teachers_) {//checks if one of the teachers teach that section
                            return teachers_.some(function (teacher_) {
                                return teacher_.split(' ').every(function (teacher_names) {// ahmad abdulfateh => ['ahmad' ,'abdulfateh']
                                    return section_.teacher.indexOf(teacher_names) > -1;
                                })
                            })
                        }

                        /*
                         var aii = [];
                         this.selectedCourses[1].map(function (objj) {
                         objj.map(function (objjj) {
                         aii.push(objjj)
                         })
                         });

                         console.log(aii);
                         aiii = aii;

                         */


                        console.log(scheduleplanner.selectedCourses);
                        scheduleplanner.calculatedSchedule = scheduleplanner.calculateSchedule(selectedCoursesAfterRemovingUnwantedTeachers);
                        console.log(scheduleplanner.calculatedSchedule);
                        callback(scheduleplanner.calculatedSchedule);

                    }
                } else {
                    console.log('status:' + status);
                    callback();
                }
            } catch (e) {
                console.log(e);
                callback();
            }

        }).fail(function () {
            callback();
        });

    }
}
