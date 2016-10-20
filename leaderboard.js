// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".
import { ReactiveVar } from 'meteor/reactive-var'
//import { Meteor } from 'meteor/meteor';
import { Accounts } from "meteor/accounts-base";
Accounts.config({
  forbidClientAccountCreation : true
});

Students = new Mongo.Collection("MeteorStudents");
Schedule = new Mongo.Collection("MeteorSchedule");
Teachers = new Mongo.Collection("MeteorTeachers");
Rooms = new Mongo.Collection("MeteorRooms");
Subjects = new Mongo.Collection("MeteorSubjects");

function stringifyPeriod(per) {
  if(per < 60) {
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    var periods = ["Before School", "8:30", "9:15", "10:00", "Snack", "10:55", "11:40", "Lunch", "1:10", "1:55", "2:40", "After School"];
    return days[Math.floor(per/12)]+" "+periods[per%12];
  } else {
    return "Lower School Crossover Period";
  }
}

var INFO_FIELDS = [
  {name: "First Name", key: "first"},
  {name: "Middle Name", key: "middle"},
  {name: "Last Name", key: "last"},
  {name: "Street Address", key: "streetAddress"},
  {name: "Street Address 2", key: "streetAddressLine2"},
  {name: "City", key: "city"},
  {name: "State", key: "state"},
  {name: "Zip Code", key: "zipCode"},
  {name: "Phone", key: "homePhoneNumber"},
  {name: "Parent 1", key: "parent1"},
  {name: "Parent 2", key: "parent2"}
];

function clearFields() {
  var i, len;
  for(i=0, len=INFO_FIELDS.length; i<len; i++) {
    //console.log("Clearing "+INFO_FIELDS[i].key)
    Session.set(INFO_FIELDS[i].key, false);
  }
  Session.set("subState", null);
  Session.set("selectedPlayer", null);
  Session.set("selectedCourse", null);
}

if (Meteor.isClient) {
  Template.body.helpers({
    isStudents: function() {console.log(Session.get("pageState"));return Session.equals("pageState","Students")},
    isTeachers: function() {console.log(Session.get("pageState"));return Session.equals("pageState","Teachers")},
    isSubjects: function() {console.log(Session.get("pageState"));return Session.equals("pageState","Subjects")},
    isRooms: function() {console.log(Session.get("pageState"));return Session.equals("pageState","Rooms")},
    isCourse: function() {console.log(Session.get("pageState"));return Session.equals("pageState","Course")},
    isSchedule: function() {
      console.log(Session.get("pageState"));
      return Session.equals("pageState","Schedule")},
    schedule: function() {
      return Session.equals("subState","schedule") ? "Schedule" : "";
    }
  });

  Template.students.helpers({
    students: function () {
      return Students.find({enrollmentStatus: "Enrolled"}, { sort: { last: 1, first: 1 } });
    },
    selectedName: function () {
      var student = Students.findOne(Session.get("selectedPlayer"));
      //console.log("selectedName identifies "+JSON.stringify(student));
      return student && student.name;
    },
    hasSubState: function() {
      return Session.get("subState") ? true : false;
    }
  });

  Template.subjects.helpers({
    subjects: function () {
      console.log("subjects");
      console.log("subjects finds "+Subjects.find({}, { sort: { name: 1 } }).count())
      return Subjects.find({}, { sort: { name: 1 } });
    },
    selectedName: function () {
      console.log("selectedName");
      var subject = Subjects.findOne(Session.get("selectedPlayer"));
       console.log("selectedName identifies "+JSON.stringify(subject));
       var result = subject && subject.name;
       console.log(result);
      return subject && subject.name;
    },
    isSelected: function() {
      console.log("isSelected");
      console.log("isSelected finds "+Session.get("selectedPlayer") ? true : false)
      return Session.get("selectedPlayer") ? true : false;
    }
  });

Template.subject.helpers({
  selected: function () {
    console.log("selected");
    return Session.equals("selectedPlayer", this._id) ? "selected" : '';
  },
  name: function() {
    console.log("name");
    //console.log(this);
    return this.name;
  }
});

Template.subject.events({
  'click': function () {
    Session.set("selectedPlayer", this._id);
  },
});

Template.rooms.helpers({
  rooms: function () {
    //console.log("subjects");
    //console.log("subjects finds "+Rooms.find({}, { sort: { name: 1 } }).count())
    return Rooms.find({}, { sort: { name: 1 } });
  },
  selectedName: function () {
    console.log("selectedName");
    var room = Rooms.findOne(Session.get("selectedPlayer"));
     //console.log("selectedName identifies "+JSON.stringify(subject));
     // var result = room && room.name;
     //console.log(result);
    return room && room.name;
  },
  isSelected: function() {
    //console.log("isSelected");
    //console.log("isSelected finds "+Session.get("selectedPlayer") ? true : false)
    return Session.get("selectedPlayer") ? true : false;
  }
});

Template.room.helpers({
selected: function () {
  //console.log("selected");
  return Session.equals("selectedPlayer", this._id) ? "selected" : '';
},
name: function() {
  //console.log("name");
  //console.log(this);
  return this.name;
}
});

Template.room.events({
'click': function () {
  Session.set("subState", "schedule");
  Session.set("selectedPlayer", this._id);
},
});

  Template.teachers.helpers({
    teachers: function () {
      console.log("Finding Teachers");
      console.log(Teachers.find({employmentStatus: "Current"}, { sort: { last: 1, first: 1 } }));
      return Teachers.find({employmentStatus: "Current"}, { sort: { last: 1, first: 1 } });
    },
    selectedName: function () {
      var teacher = Teachers.findOne(Session.get("selectedPlayer"));
      //console.log("selectedName identifies "+JSON.stringify(student));
      return teacher && teacher.name;
    },
    hasSubState: function() {
      return Session.get("subState") ? true : false;
    }
  });

  Template.studentSubState.helpers({
    name: function() {
      var student = Students.findOne(Session.get("selectedPlayer"));
      //console.log("subState name identifies "+JSON.stringify(student));
      return student ? student.name : "NO STUDENT SELECTED"
    },
    isInfo: function() {
      return Session.equals("subState", "info");
    },
    isSchedule: function() {
      return Session.equals("subState", "schedule");
    },
    isCourses: function() {
      return Session.equals("subState", "courses");
    },
    scheduleRows: function() {
      var i, j, len, len2, arr = [], result = [];
      var times = ["7:45","8:30","9:15","10:00","10:45","10:55","11:40","12:25","1:10","1:55","2:40","3:25"];
      for(i=0; i<times.length; i++) {
        arr = [];
        for(j=0; j<5; j++) {
          arr[j] = (j)*12 + i;
        }
        result.push({
          period: times[i],
          row: arr
        })
      }
      return result;
    }
  });

  Template.scheduleTable.helpers({
    scheduleRows: function() {
      var i, j, len, len2, arr = [], result = [];
      var times = ["7:45","8:30","9:15","10:00","10:45","10:55","11:40","12:25","1:10","1:55","2:40","3:25"];
      for(i=0; i<times.length; i++) {
        arr = [];
        for(j=0; j<5; j++) {
          arr[j] = (j)*12 + i;
        }
        result.push({
          period: times[i],
          row: arr
        })
      }
      return result;
    }
  });

  Template.teacherSubState.helpers({
    name: function() {
      var teacher = Teachers.findOne(Session.get("selectedPlayer"));
      //console.log("subState name identifies "+JSON.stringify(student));
      return teacher ? teacher.name : "NO TEACHER SELECTED"
    },
    isInfo: function() {
      return Session.equals("subState", "info");
    },
    isSchedule: function() {
      return Session.equals("subState", "schedule");
    },
    isCourses: function() {
      return Session.equals("subState", "courses");
    },
    morningRows: function() {
      var i, j, len, len2, arr = [], result = [];
      var times = ["7:45","8:30","9:15","10:00","10:45","10:55","11:40","12:25","1:10","1:55","2:40","3:25"];
      for(i=0; i<1; i++) {
        arr = [];
        for(j=0; j<5; j++) {
          arr[j] = (j)*12 + i;
        }
        result.push({ period: times[i], row: arr})
      }
      return result;
    },
    scheduleRows: function(start, stop) {
      var i, j, len, len2, arr = [], result = [];
      var times = ["7:45","8:30","9:15","10:00","10:45","10:55","11:40","12:25","1:10","1:55","2:40","3:25"];
      for(i=1; i<times.length - 1; i++) {
        arr = [];
        for(j=0; j<5; j++) {
          arr[j] = (j)*12 + i;
        }
        result.push({ period: times[i], row: arr})
      }
      return result;
    },
    afterSchoolRows: function() {
      var i, j, len, len2, arr = [], result = [];
      var times = ["7:45","8:30","9:15","10:00","10:45","10:55","11:40","12:25","1:10","1:55","2:40","3:25"];
      for(i=times.length - 1; i<times.length; i++) {
        arr = [];
        for(j=0; j<5; j++) {
          arr[j] = (j)*12 + i;
        }
        result.push({ period: times[i], row: arr})
      }
      return result;
    },
  });

  Template.scheduleRow.helpers({
    scheduleCells: function() {
      //console.log(this);
      return this.row;
    },
    period: function() {
      return this.period;
    }

  });

  Template.scheduleCell.helpers({
    course: function() {
      var per = parseInt(this);
      if(type == "teacher") {
        var name = Students.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ students: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }]}, { sort: { priority: 1, courseNum: 1 } });
      } else {
        var name = Teachers.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ teachers: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }] }, { sort: { priority: 1, courseNum: 1 } });
      }
      course.name = course.schedName || course.name;
      course.teacher = course.schedTeachers || course.teachers.join(", ");
      course.room = course.meetingRooms[course.meetings.indexOf(parseInt(this))];
      return course;
    },
    name: function(type) {
      var per = parseInt(this);
      var type = Session.get("pageState");
      if(type == "Students") {
        var name = Students.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ students: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }]}, { sort: { priority: 1, courseNum: 1 } });
      } else if(type == "Teachers"){
        var name = Teachers.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ teachers: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }]}, { sort: { priority: 1, courseNum: 1 } });
      } else if(type == "Rooms"){
        var name = Rooms.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { meetings: { $elemMatch: { period: per, room: name } } }, { sort: { priority: 1, courseNum: 1 } });
      }
      if(!course) {return "";}
      if(type == "Students") {
        return (course.schedName || course.name);// + "\n" + (course.schedTeachers || course.teachers.join(", "));
      }
      return course.name;
    },
    teacher: function() {
      var per = parseInt(this);
      var type = Session.get("pageState");
      if(type == "Students") {
        var name = Students.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ students: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }]}, { sort: { priority: 1, courseNum: 1 } });
      } else if(type == "Teachers"){
        var name = Teachers.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ teachers: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }]}, { sort: { priority: 1, courseNum: 1 } });
      } else if(type == "Rooms"){
        var name = Rooms.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { meetings: { $elemMatch: { period: per, room: name } } }, { sort: { priority: 1, courseNum: 1 } });
      }
      if(!course) {return "";}
      return (course.schedTeachers || course.teachers.join(", "));// + "\n" + (course.schedTeachers || course.teachers.join(", "));
    },
    room: function() {
      var per = parseInt(this);
      var type = Session.get("pageState");
      if(type == "Students") {
        var name = Students.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ students: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }]}, { sort: { priority: 1, courseNum: 1 } });
      } else if(type == "Teachers"){
        var name = Teachers.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { $and: [{ teachers: { $all: [name] }}, { meetings: { $elemMatch: { period: per }} }]}, { sort: { priority: 1, courseNum: 1 } });
      } else if(type == "Rooms"){
        var name = Rooms.findOne(Session.get("selectedPlayer")).name;
        var course = Schedule.findOne( { meetings: { $elemMatch: { period: per, room: name } } }, { sort: { priority: 1, courseNum: 1 } });
      }
      if(!course) {return "";}
      var meetings = course.meetings;
      for(i=0, len=meetings.length; i<len; i++) {
        if(meetings[i].period == per) {
          return meetings[i].room;
        }
      }
      //course.meetings.indexOf(parseInt(this));
      //return course.meetingRooms[index];// + "\n" + (course.schedTeachers || course.teachers.join(", "));
    },
    details: function() {
      return Session.get("details");
    }
  });

  Template.scheduleCell.events({
    'click .expand': function() {
      console.log("Clicked schedCell");
      Session.set("details", true);
    },
    'click .collapse': function() {
      console.log("Clicked collapse");
      Session.set("details", false);
    },
    'click .modal': function() {
      var modal = document.getElementById('myModal')
      modal.style.display = "block"
    }
  });

  Template.student.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    },
    isSelected: function() {
      //console.log("Session.get(selectedPlayer) is "+Session.get("selectedPlayer"))
      //console.log("this.name is "+this.name);
      return Session.equals("selectedPlayer", this._id) ? true : false;
    },

  });

  Template.student.events({
    'click': function () {
      Session.set("selectedPlayer", this._id);
    },
  });

  Template.studentSubMenu.events({
    'click .info': function() {
      Session.set("subState","info");
    },
    'click .schedule': function() {
      Session.set("subState", "schedule");
    },
    'click .courses': function() {
      Session.set("subState", "courses");
    },
  });

Template.menu.helpers({
  loggedIn: function() {
    return Session.get("loggedIn") ? true: false;
  }
});

  Template.menu.events({
    'click .students': function() {
      Session.set("pageState","Students");
      clearFields();
    },
    'click .teachers': function() {
      Session.set("pageState","Teachers");
      clearFields();
    },
    'click .rooms': function() {
      Session.set("pageState","Rooms");
      clearFields();
    },
    'click .subjects': function() {
      Session.set("pageState","Subjects");
      clearFields();
    },
    'click .schedule': function() {
      console.log("Clicked Schedule");
      Session.set("pageState","Schedule");
      clearFields();
    },
    'submit .login-form': function() {
      console.log("Running from login-form")
      if(event.target[0].value=='robotsecretary@pierrepontschool.org' &&
      event.target[1].value=='p13rr3p0nt') {
        Session.set('loggedIn',true);
      }
      return false;
    },
    'submit .login-button': function() {
      console.log("Running from login-button")
      if(event.target[0].value=='robotsecretary@pierrepontschool.org' &&
      event.target[1].value=='p13rr3p0nt') {
        Session.set('loggedIn',true);
      }
      return false;
    }
  });

  Template.personalInfoTable.helpers({
    /*first: function() {
      var student = Students.findOne(Session.get("selectedPlayer"));
      //console.log("First is being called");
      return student.first || "--";
    },
    middle: function() {
        var student = Students.findOne(Session.get("selectedPlayer"));
        //console.log("Middle is being called");
      return student.middle || "--";
    },
    last: function() {
        var student = Students.findOne(Session.get("selectedPlayer"));
      //  console.log("Last is being called");
      return student.last || "--";
    },*/
    fields: function() {
      return INFO_FIELDS
    }
  });

  Template.field.helpers({
    name: function() {
      return this.name+":  ";
    },
    value: function() {
      //console.log(Session.get("selectedPlayer"));
      if(Session.get("pageState") == "Students") {
      var student = Students.findOne(Session.get("selectedPlayer"));
    } else {
      var student = Teachers.findOne(Session.get("selectedPlayer"));
    }
      //console.log(student);
      return student[this.key] || "--";
    },
    isEdit: function() {
      var result = Session.get(this.key);
      //console.log(result)
      return result || false;
    }
  });

  Template.field.events({
    'click .value': function( event, template ) {
      //console.log(this);
      Session.set(this.key, true);
      //console.log("Set "+this.name+".edit to true");
    //  console.log(this);
    },
    'submit .editInfo': function(event, template) {
      event.preventDefault();
      const target = event.target;
      const text = target.text.value;
      //console.log(text);
      var obj = {};
      //console.log("setting "+this.key+" to "+text);
      obj[this.key] = text;
      Students.update(Session.get("selectedPlayer"), {
      $set: obj});
      Session.set(this.key, false);
    },
    'click .cancelEdit': function() {
      //console.log("Cancelled Edit")
      Session.set(this.key, false);
    }
  });


Template.schedulePageState.helpers({
  courses: function() {
    return Schedule.find({}, { sort: { courseNum: 1 } });
  }
});

Template.studentCourseList.helpers({
  courses: function() {
    if(Session.get("pageState") == "Students") {
      var name = Students.findOne(Session.get("selectedPlayer")).name;
      var schedule = Schedule.find({ students: { $all: [name] } }, { sort: { priority: 1, courseNum: 1 } });

    } else if(Session.get("pageState") == "Teachers") {
      var name = Teachers.findOne(Session.get("selectedPlayer")).name;
      var schedule = Schedule.find({ teachers: { $all: [name] } }, { sort: { priority: 1, courseNum: 1 } });
    } else if(Session.get("pageState") == "Subjects") {
      var name = Subjects.findOne(Session.get("selectedPlayer")).name;
      var schedule = Schedule.find({ subject: name }, { sort: { priority: 1, courseNum: 1 } });
    }

    return schedule;
  }
});

Template.course.helpers({
  isSelected: function() {
    return Session.equals("selectedCourse", this._id);
  },
  selected: function () {
    return Session.equals("selectedCourse", this._id) ? "selected" : '';
  },
  name: function() {
    console.log(this);
    return this.name;
  },
  oneTeacher: function() {
    return this.teachers.length == 1;
  },
  numStudents: function() {
    var num = this.students.length
    return num+" Student"+(num != 1 ? "s" : "");
  },
  numTeachers: function() {
    var num = this.teachers.length
    return num+" Teacher"+(num != 1 ? "s" : "");
  },
  numMeetings: function() {
    var num = this.meetings.length
    return num+" Meeting"+(num != 1 ? "s" : "");
  },
  students: function() {
    var students = this.students;
    var i, len, arr = [];
    for(i=0, len=students.length; i<len; i++) {
      arr.push({name: students[i]});
    }
    return arr;
  },
  teachers: function() {
    var teachers = this.teachers;
    var i, len, arr = [];
    for(i=0, len=teachers.length; i<len; i++) {
      arr.push({name: teachers[i]});
    }
    return arr;
  },
  meetings: function() {
    var meetings = this.meetings;
    var i, len, arr = [];
    for(i=0, len=meetings.length; i<len; i++) {
      arr.push({name: stringifyPeriod(meetings[i].period)});
    }
    return arr;
  },
  moreOptions: function() {
    return "More Options"
  },
  isStudents: function() {
    return Session.equals("courseSubState", "students");
  },
  isTeachers: function() {
    return Session.equals("courseSubState", "teachers");
  },
  isMeetings: function() {
    return Session.equals("courseSubState", "meetings");
  },
  isMoreOptions: function() {
    return Session.equals("courseSubState", "moreOptions");
  },
});

Template.course.events({
  'click .name': function() {
    Session.set("selectedCourse", this._id)
    Session.set("courseSubState", null);
    /*var meetings =  this.meetings;
    console.log(meetings);
    var rooms = this.meetingRooms;
    var arr = [];
    for(j=0, len2=meetings.length; j<len2; j++) {
      var obj = {period: meetings[j]}
      if(rooms[j]) {
        obj.room = rooms[j];
      }
      arr.push(obj);
    }
    //this.meetings = arr;
    //delete this.meetingRooms;
    console.log(this);
    console.log(arr);
     Schedule.update(this._id, {$set: {meetings: arr}});*/
  },
  'click .teachers': function() {
    Session.set("courseSubState", "teachers");
  },
  'click .students': function() {
    Session.set("courseSubState", "students");
  },
  'click .meetings': function() {
    Session.set("courseSubState", "meetings");
  },
  'click .moreOptions': function() {
    Session.set("courseSubState", "moreOptions");
  },
});

Template.liStudent.helpers({
  student: function() {
    return this.name;
  }
});

Template.liStudent.events({
  'click': function() {
    var student = Students.findOne({name: this.name});
    if(student) {
      var id= student._id;
    console.log("selected "+this.name);
    Session.set("selectedCourse", null);
    Session.set("pageState", "Students");
    Session.set("subState", "None");
    Session.set("selectedPlayer", id);
    }
  }
});

Template.liTeacher.helpers({
  teacher: function() {
    return this.name;
  }
});

Template.liTeacher.events({
  'click': function() {
    var teacher = Teachers.findOne({name: this.name});
    if(teacher) {
      var id= teacher._id;
    console.log("selected "+this.name);
    Session.set("selectedCourse", null);
    Session.set("pageState", "Teachers");
    Session.set("subState", "None");
    Session.set("selectedPlayer", id);
    }
  }
});

Template.liMeeting.helpers({
  meeting: function() {
    return this.name;
  }
});
Template.liOption.helpers({
  option: function() {
    return this.name;
  }
});
}
// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {

    var schedule = Schedule.find();
    var i, len;
    for(i=0, len=schedule.length; i<len; i++) {
      var course = schedule[i];
      var meetings =  course.meetings;
      var rooms = course.meetingRooms;
      var arr = [];
      for(j=0, len2=meetings.length; j<len2; j++) {
        var obj = {period: meetings[j]}
        if(rooms[j]) {
          obj.room = rooms[j];
        }
        arr.push(obj);
      }
      course.meetings = arr;
      delete course.meetingRooms;
      console.log(course);
       Schedule.update(course._id, {$set: course});
    }

  })
}

function initDbs() {
    console.log("Teachers.find().count() is "+Teachers.find().count());
    if (Subjects.find().count() < 2) {
      console.log("Adding New Teachers to DB")
      var i, len;
      var students = [
        {name: "CS"},
        {name: "Math"},
        {name: "Theater"},
        {name: "Music"}
      ];
    for(i=0, len=students.length; i<len; i++) {
        console.log("Inserting teacher "+students[i].name);
        Subjects.insert(students[i]);
      }
    }
    if (Rooms.find().count() < 2) {
      console.log("Adding New Teachers to DB")
      var i, len;
      var students = [
        {name: "1B"},
        {name: "Alcove"},
        {name: "2C"},
        {name: "R2"}
      ];
    for(i=0, len=students.length; i<len; i++) {
        console.log("Inserting teacher "+students[i].name);
        Rooms.insert(students[i]);
      }
    }

}
