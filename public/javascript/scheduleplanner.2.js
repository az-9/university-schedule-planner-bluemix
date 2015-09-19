/**
 * Created by abdulazizm on 6/10/15.
 */


function toScheduleEvent(courseObject, week, relatedCourses, calendarnum) {
    var calendar = $('#calendar' + calendarnum).fullCalendar('getCalendar');

    var outputArray = [];
    var outputCourse = {};
    for (var i = 0; i < courseObject['courses'].length; i++) {
        for (var j = 1; j < 6; j++) {

            var m = calendar.moment();
            m.set('year', 2014);
            m.set('month', 5);  // April
            m.set('date', 7);
            m.add(7 * (week - 1), 'days');
            m.add(j, 'days');

            if (courseObject['courses'][i]['days']['day' + j] != undefined) {
                outputCourse['title'] = courseObject['title'];
                outputCourse['start'] = m.format("YYYY-MM-DD") + 'T' + courseObject['courses'][i]['days']['day' + j]['from'] + ':00';
                outputCourse['end'] = m.format("YYYY-MM-DD") + 'T' + courseObject['courses'][i]['days']['day' + j]['to'] + ':00';
                outputCourse['teacher'] = courseObject['courses'][i]['teacher'];
                outputCourse['available'] = courseObject['courses'][i]['available'];
                outputCourse['place'] = courseObject['courses'][i]['days']['day' + j]['place'];
                if (relatedCourses != undefined) outputCourse['data'] = relatedCourses;
                outputCourse['day'] = j;
                outputCourse['type'] = courseObject['courses'][i]['type'];
                ;
                outputArray.push(outputCourse);

            }
            outputCourse = {};
        }

    }
    return outputArray;

}

function toTable(objarray, type, day) {
    var out = "<table><thead><tr><th>teacher</th><th>available</th><th>type</th><th>section</th><th>place</th></tr></thead><tbody>";

    for (var i = 0; i < objarray.length; i++) {
        for (var j = 0; j < objarray[i]['courses'].length; j++) {
            if (objarray[i]['courses'][j]['type'].search(type) != -1 && objarray[i]['courses'][j]['days']['day' + day] != undefined) {
                out += "<tr><td>" + objarray[i]['courses'][j]['teacher'] + "</td>";
                out += "<td>" + ((objarray[i]['courses'][j]['available']) ? "available" : "not available") + "</td>";
                out += "<td>" + objarray[i]['courses'][j]['type'] + "</td>";
                out += "<td>" + objarray[i]['courses'][j]['section'] + "</td>";
                out += "<td>" + objarray[i]['courses'][j]['days']['day' + day]['place'] + "</td>"
                out += "</tr>"
            }
        }
    }
    out += "</table>";
    return out;
}

function toSelect(objarray, id) {
    var out = '<select class="form-control"' + ((id != undefined) ? ' id="' + id : '') + '">';
    for (var i = 0; i < objarray.length; i++) {
        out += '<option>' + objarray[i] + '</option>';
    }
    out += '</select>';
    return out;
}

function toOptions(objarray, field, id) {
    var out = '';
    for (var i = 0; i < objarray.length; i++) {
        out += '<option id="' + objarray[i][id] + '">' + objarray[i][field] + '</option>';
    }
    return out;
}


function populateCoursesAddList(isback) {
    $('#loadingModal').modal('toggle');
    scheduleplanner.getCoursesTitles($('#university')[0].children[$('#university')[0].selectedIndex].id, $('#place')[0].children[$('#place')[0].selectedIndex].id, $('#degree')[0].children[$('#degree')[0].selectedIndex].id, $('#department')[0].children[$('#department')[0].selectedIndex].id, function (titles) {
        if (titles == undefined) {
            show_error('حصل خطأ ما أعد المحاولة مرة اخرى');
        } else {
            $('#error').hide();

            document.getElementById('coursesAddList').innerHTML = '<div  class="entry input-group col-md-12">' + toSelect(titles) + '<span class="input-group-btn"><a class="btn btn-success btn-add" type="button"><span class="glyphicon glyphicon-plus"></span></a></span></div>';

            $('#step1').hide();
            $('#step2').show();
            $('#step3').hide();
        }
        $('#loadingModal').modal('toggle');
    });

}

function populateSchedule() {
    selectedCoursesByIndex = [];
    $('#loadingModal').modal('toggle');

    $("#calendar1").css("display", "block");
    $("#calendar2").css("display", "block");

    $('#coursesAddList .entry select').each(function (indexSelect, selectEle) {
        if (indexSelect != $('#coursesAddList .entry select').length - 1) selectedCoursesByIndex.push(selectEle.selectedIndex)
    });
    scheduleplanner.getCoursesByIndexAndCalculateSchedule(selectedCoursesByIndex, function (schedule) {
        if (schedule == undefined) {
            show_error('حصل خطأ ما أعد المحاولة مرة اخرى');
        } else {
            $('#error').hide();

            $('#step1').hide();
            $('#step2').hide();
            $('#step3').show();

            renderSchedule({});
            renderSchedule2({});
            $("#calendar1").fullCalendar('refetchEvents');
            $("#calendar2").fullCalendar('refetchEvents');

            document.getElementById('calendar1').style.visibility = "visible";
            document.getElementById('calendar1').style.display = "none";

            document.getElementById('calendar2').style.visibility = "visible";
            document.getElementById('calendar2').style.display = "block";

            if ($('#step3 input ').is(":checked")) {
                document.getElementById('calendar2').style.display = "block";
                document.getElementById('calendar1').style.display = "none";
            } else {
                document.getElementById('calendar1').style.display = "block";
                document.getElementById('calendar2').style.display = "none";
            }


        }
        $('#loadingModal').modal('toggle');
    });
}

var renderSchedule = function () {

    $('#calendar1').fullCalendar({
        eventClick: function (calEvent, jsEvent, view) {

            var info = document.getElementById('details1');
            //info.innerHTML = JSON.stringify(calEvent);
            //$(this).css('border-color', 'red');
            //console.log(calEvent);
            info.innerHTML = toTable(calEvent['data'], calEvent['type'], calEvent['day']);

        },
        header: {
            left: 'prev,next',
            right: 'agendaWeek'
        },
        buttonText: {
            week: 'Schedules'
        },
        allDaySlot: false,
        hiddenDays: [5, 6],
        minTime: "08:00:00",
        maxTime: "22:00:00",
        defaultDate: '2014-06-12',
        defaultView: 'agendaWeek',
        editable: false,
        columnFormat: 'ddd',
        //events: coursesADay
        events: scheduleToEvents
    });

};

var renderSchedule2 = function () {

        $('#calendar2').fullCalendar({
            eventClick: function (calEvent, jsEvent, view) {

                var info = document.getElementById('details2');
                //info.innerHTML = JSON.stringify(calEvent);
                //$(this).css('border-color', 'red');
                //console.log(calEvent);
                info.innerHTML = toTable(calEvent['data'], calEvent['type'], calEvent['day']);

            },
            header: {
                left: 'prev,next',
                right: 'agendaWeek'
            },
            buttonText: {
                week: 'Schedules'
            },
            allDaySlot: false,
            hiddenDays: [5, 6],
            minTime: "08:00:00",
            maxTime: "22:00:00",
            defaultDate: '2014-06-12',
            defaultView: 'agendaWeek',
            editable: false,
            columnFormat: 'ddd',
            //events: coursesADay
            events: scheduleToEvents2
        });

    }
    ;
function displaySchedule() {
    //renderSchedule({});
    //renderSchedule2({});
}
function scheduleToEvents(start, end, timezone, callback) {

    var calculatedScheduleTemp = scheduleplanner.calculatedSchedule;
    if (start.unix() >= 1402185600) {
        var weeknumber = ((start.unix() - 1402185600) / 604800) + 1;
        if (weeknumber <= calculatedScheduleTemp.length) {
            var out = [];
            for (var i = 0; i < calculatedScheduleTemp[weeknumber - 1].length; i++) {
                out = out.concat(toScheduleEvent(calculatedScheduleTemp[weeknumber - 1][i][0], weeknumber, calculatedScheduleTemp[weeknumber - 1][i], 1));

            }
            var calendar = $('#calendar1').fullCalendar('getCalendar');
            var m = calendar.moment();
            m.add(7, 'days');
            //console.log(out);
            $('#calendar1 .fc-center').text(weeknumber + " / " + calculatedScheduleTemp.length + " " + ((calculatedScheduleTemp[weeknumber - 1]["available"]) ? "(متاح)" : "(غير متاح)"));
            callback(out);
        } else {
            $('#calendar1').fullCalendar('gotoDate', '2014-06-08');
        }
        //console.log(weeknumber);
    } else {
        $('#calendar1').fullCalendar('gotoDate', '2014-06-08');
    }
    if (calculatedScheduleTemp.length == 0) {
        $('#calendar1 .fc-center').text("لا يوجد")
    }
    ;

    //callback(toScheduleEvent(dataFromPost['data']['courses'][1],2));

}
function scheduleToEvents2(start, end, timezone, callback) {
    var calculatedScheduleTemp = scheduleplanner.availableSelectedCourses;
    if (start.unix() >= 1402185600) {
        var weeknumber = ((start.unix() - 1402185600) / 604800) + 1;
        if (weeknumber <= calculatedScheduleTemp.length) {
            var out = [];
            for (var i = 0; i < calculatedScheduleTemp[weeknumber - 1].length; i++) {
                out = out.concat(toScheduleEvent(calculatedScheduleTemp[weeknumber - 1][i][0], weeknumber, calculatedScheduleTemp[weeknumber - 1][i], 2));

            }
            var calendar = $('#calendar2').fullCalendar('getCalendar');
            var m = calendar.moment();
            m.add(7, 'days');
            //console.log(out);
            $('#calendar2 .fc-center').text(weeknumber + " / " + calculatedScheduleTemp.length + " " + ((calculatedScheduleTemp[weeknumber - 1]["available"]) ? "(متاح)" : "(غير متاح)"));
            callback(out);
        } else {
            $('#calendar2').fullCalendar('gotoDate', '2014-06-08');
        }
        //console.log(weeknumber);
    } else {
        $('#calendar2').fullCalendar('gotoDate', '2014-06-08');
    }
    if (calculatedScheduleTemp.length == 0) {
        $('#calendar2 .fc-center').text("لا يوجد ")
    }
    ;

    //callback(toScheduleEvent(dataFromPost['data']['courses'][1],2));

}
$(document).ready(function () {
    $('#coursesAddList').on('click','.collapse-next',function(e){
        e.preventDefault();
        if($(this).hasClass('active'))
            $(this).removeClass('active');
        else
            $(this).addClass('active');
        $(this).parent().parent().next().collapse('toggle');
    });

    $('#university option:selected').removeAttr('selected');
    $('#university option:eq(0)').prop('selected', true);

    $('#place option:selected').removeAttr('selected');
    $('#place option:eq(0)').prop('selected', true)

    $('#degree option:selected').removeAttr('selected');
    $('#degree option:eq(0)').prop('selected', true)

    $('#department option:selected').removeAttr('selected');
    $('#department option:eq(0)').prop('selected', true)

    $('#university').change(function () {
        var uniID = $('#university')[0].children[$('#university')[0].selectedIndex].id;
        var options = toOptions(allDeps[$('#university')[0].selectedIndex - 1]['Places'], 'PlaceName', 'PlaceID');
        $('#place').html('<option selected disabled>اختر المقر</option>' + options);
    });

    //remove the folwing lines to show all universities
    //start of lines
    $('#university option:eq(1)').prop('selected', true);
    $('#university').change();

    $('#university').parent().hide()
    // end of lines

    $('#place').change(function () {
        var uniID = $('#university')[0].children[$('#university')[0].selectedIndex].id;
        var plaID = $('#place')[0].children[$('#place')[0].selectedIndex].id;
        var options = toOptions(allDeps[$('#university')[0].selectedIndex - 1]['Places'][$('#place')[0].selectedIndex - 1]['Degrees'], 'DegreeName', 'DegreeID');
        $('#degree').html('<option selected disabled>اختر الدرجة</option>' + options);
    });
    $('#degree').change(function () {
        /*
         var uniID = $('#university')[0].children[$('#university')[0].selectedIndex].id;
         var plaID = $('#place')[0].children[$('#place')[0].selectedIndex].id;
         var degID = $('#degree')[0].children[$('#degree')[0].selectedIndex].id;
         */
        var options = toOptions(allDeps[$('#university')[0].selectedIndex - 1]['Places'][$('#place')[0].selectedIndex - 1]['Degrees'][$('#degree')[0].selectedIndex - 1]['Departments'], 'DepartmentName', 'DepartmentID');
        $('#department').html('<option selected disabled>اختر القسم</option>' + options);
    });

    $('#step3 input ').on('change', function () {
        if ($('#step3 input ').is(":checked")) {
            document.getElementById('calendar2').style.display = "block";
            document.getElementById('calendar1').style.display = "none";
        } else {
            document.getElementById('calendar1').style.display = "block";
            document.getElementById('calendar2').style.display = "none";
        }
    });


    $('#loadingModal').modal({
        keyboard: false,
        backdrop: 'static',
        keyboard: false,
        show: false
    });//$('#loadingModal').modal('toggle') to hide and show loading
    $('#step2').hide();
    $('#step3').hide();
    $('#loadingCancel').hide();
    $('#loadingModal').on('shown.bs.modal', function (e) {
        $('#loadingCancel').hide();
        setTimeout(function () {
            $('#loadingCancel').show();
        }, 5000);
    });
    $('#loadingModal').on('hidden.bs.modal', function (e) {
        $('#loadingCancel').hide();
    });


    $(document).on('click', '.btn-add', function (e) {
        e.preventDefault();

        var controlForm = $('.controls form:first '),
            currentEntry = $(this).parents('.entry:first'),
            newEntry = $(currentEntry.clone()).appendTo(controlForm);

        currentEntry.css('margin-bottom', '2%');
        currentEntry.css('margin-top', '0%');
        newEntry.css('margin-top', '5%');


        newEntry.find('input').val('');
        controlForm.find('.entry:not(:last) .btn-add')
            .removeClass('btn-add').addClass('btn-remove')
            .removeClass('btn-success').addClass('btn-danger')
            .html('<span class="glyphicon glyphicon-minus"></span>');

        currentEntry.children().eq(0).after('<span class="input-group-btn"> <a style=" margin-right: 10px" type="button" aria-expanded="false" class="btn btn-default collapse-next"> <span class="glyphicon glyphicon-search"></span> </a> </span>');

        currentEntry.after('<div class="collapse"> <div class="well">  <p >المحاضرين ( أسماء المحاضرين مفترقة بفاصلة مثل: السلمان ، اشرف ،أحمد البدري ) :</p> <div class="row"> <div class="form-group col-md-3"> <select class="form-control filter_type"> <option>يحتوي على</option> <option>لا يحتوي على</option> </select> </div> <div class="form-group col-md-9"> <input type="text" class="form-control filter_content"> </div> </div>  </div> </div>')

    }).on('click', '.btn-remove', function (e) {
        $(this).parents('.entry:first').next().remove();
        $(this).parents('.entry:first').remove();

        if ($('#coursesAddList').children().length == 1) {
            $('#coursesAddList').children().eq(0).css('margin-top', '0%');
        }


        e.preventDefault();
        return false;
    });


    document.getElementById('calendar1').style.visibility = "hidden";
    document.getElementById('calendar2').style.visibility = "hidden";

    $('#step3 input ').on('change', function () {
        if ($('#step3 input ').is(":checked")) {
            document.getElementById('calendar2').style.display = "block";
            document.getElementById('calendar1').style.display = "none";
        } else {
            document.getElementById('calendar1').style.display = "block";
            document.getElementById('calendar2').style.display = "none";
        }
    });



    //for crawlers
    if(/bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)){
        $('#error').parent().remove();
    }
});

function verify_step1() {
    if ($('#university')[0].selectedIndex && $('#place')[0].selectedIndex && $('#degree')[0].selectedIndex && $('#department')[0].selectedIndex) {
//continue
    } else {
        show_error("من فضلك املأ جميع الحقول");
        return false;
    }


    $('#error').hide();
    return true;
}
function verify_step2() {
    var replicat = false;
    var selectedCoursesByIndex = [];
    $('#coursesAddList .entry select').toArray().map(function (selectEle, indexSelect) {
        if (indexSelect != $('#coursesAddList .entry select').length - 1) {
            if (selectedCoursesByIndex.indexOf(selectEle.selectedIndex) > -1) {
                show_error('لا يمكن تكرار اختيار مادة دراسية');
                replicat = true;
            } else {
                console.log(selectEle.selectedIndex);
                selectedCoursesByIndex.push(selectEle.selectedIndex);
            }
        }
    });
    if (replicat) {

        return false;
    }


    if ($('#coursesAddList .entry select').length == 1) {
        show_error("اختر مادة دراسية واحدة على الآقل");
        return false;
    }

    $('#error').hide();
    return true;

}
function show_error(error_message) {
    $('#error').text(error_message);
    $('#error').show();
}

/*

 [
 {
 title: 'All Day Event',
 start: '2014-06-01'
 },
 {
 title: 'Long Event',
 start: '2014-06-07',
 end: '2014-06-10'
 },
 {
 id: 999,
 title: 'Repeating Event',
 start: '2014-06-09T16:00:00'
 },
 {
 id: 999,
 title: 'Repeating Event',
 start: '2014-06-16T16:00:00'
 },
 {
 title: 'Meeting',
 start: '2014-06-12T10:30:00',
 end: '2014-06-12T22:30:00',
 courseData:{}
 },
 {
 title: 'Lunch',
 start: '2014-06-12T12:00:00'
 },
 {
 title: 'Birthday Party',
 start: '2014-06-13T07:00:00'
 },
 {
 title: 'Click for Google',
 url: 'http://google.com/',
 start: '2014-06-28'
 }
 ]

 */