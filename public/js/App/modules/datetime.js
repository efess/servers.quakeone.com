var GMTToLocalDate = function(dateTime)
{
    localOffset = new Date().getTimezoneOffset() * -60000;
    var utcMs = dateTime.getTime();
    utcMs += localOffset;
    return new Date(utcMs);  
}

var secondsStringToDate = function(seconds){
    var jsDate = new Date(seconds);

    //jsDate.setTime(parseInt(seconds) * 1000);
    //var strDate = jsDate.toLocaleString() + " UTC";
    //var JSDate = new Date(CSharpDateString);
    return jsDate;
}
var cleanNumber = function(value){
    var num = 0;
    if (typeof (value) === "string")
        num = parseInt(value);
    else if (typeof (value) === "number")
        num = value;
    else return null;
    return num;
};
var DateTime = {
    secToBigTimespan: function (seconds) {

        var sec = cleanNumber(seconds);
        if (!sec) return '';

        var minutes = sec / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var weeks = days / 7;
        var years = days / 365;

        minutes = minutes % 60;
        minutes = Math.floor(minutes);
        hours = hours % 24;
        hours = Math.floor(hours);
        days = Math.floor(days);
        weeks = Math.floor(weeks);
        years = Math.floor(years);

        if (weeks > 0)
            return weeks + " weeks";
        if (minutes < 10)
            minutes = "0" + minutes;
        if (days > 0) {
            if (hours < 10)
                hours = "0" + hours;
            return days + ":" + hours + ":" + minutes;
        }
        if (hours > 0) {
            return hours + ":" + minutes;
        }
        return ":" + minutes;
    },
    secToSmallTimespan: function (seconds) {

        var sec = cleanNumber(seconds);
        if (!sec) return '';

        var seconds = sec % 60;
        var minutes = sec / 60;
        var hours = minutes / 60;
        var days = hours / 24;

        minutes = minutes % 60;
        minutes = Math.floor(minutes);
        hours = hours % 24;
        hours = Math.floor(hours);
        days = Math.floor(days);

        if (seconds < 10)
            seconds = "0" + seconds;
        if (days > 0) {
            if (hours < 10)
                hours = "0" + hours;
            if (minutes < 10)
                minutes = "0" + minutes;
            return days + ":" + hours + ":" + minutes;
        }
        if (hours > 0) {
            if (minutes < 10)
                minutes = "0" + minutes;
            return hours + ":" + minutes + ":" + seconds;
        }
        return minutes + ":" + seconds;
    },
    secToSmallDateTime: function (seconds) {

        var dateTime = secondsStringToDate(seconds);
        var today = new Date();
        var yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        var minutes = dateTime.getMinutes() + 1;
        var hours = dateTime.getHours();
        var hourTag = "AM";

        if (minutes < 10)
            minutes = "0" + minutes;
        if (hours > 12) {
            hourTag = "PM";
            hours = hours -= 12;
        } else if (hours == 0) {
            hours = 12;
        }

        var date = '';
        if (dateTime.getFullYear() == today.getFullYear()
            && dateTime.getMonth() == today.getMonth()
            && dateTime.getDate() == today.getDate()) {
            date = "Today ";
        } else if (dateTime.getFullYear() == yesterday.getFullYear()
            && dateTime.getMonth() == yesterday.getMonth()
            && dateTime.getDate() == yesterday.getDate()) {
            date = "Yesterday ";
        } else {
            date = (dateTime.getMonth() + 1) + "/"
            + (dateTime.getDate()) + "/"
            + dateTime.getFullYear() + " ";
        }
        return date + hours + ":"
            + minutes + " "
            + hourTag;
    },

    secToVerySmallTimespan: function (seconds) {
        var sec = cleanNumber(seconds);
        if (!sec) return 'Now';

        var minutes = sec / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var weeks = days / 7;
        var years = days / 365;

        minutes = Math.floor(minutes);
        hours = Math.floor(hours);
        days = Math.floor(days);
        weeks = Math.floor(weeks);
        years = Math.floor(years);
        if (years === 1)
            return "1 year";
        if (years > 1)
            return years.toString() + "years";
        if (weeks === 1)
            return "1 week";
        if (weeks > 1)
            return weeks.toString() + " weeks";
        if (days === 1)
            return "1 day"
        if (days > 0)
            return days.toString() + " days"
        if (hours === 1)
            return "1 hour"
        if (hours > 0)
            return hours.toString() + " hours"
        if (minutes === 1)
            return "1 min"
        if (minutes > 0)
            return minutes.toString() + " mins"
        if (sec === 1)
            return "1 sec"
        if (sec > 0)
            return sec.toString() + " secs"
    },
    secToSecMinHourTimespan: function (seconds) {
        var sec = cleanNumber(seconds);
        if (!sec) return '';

        var minutes = sec / 60;
        var hours = minutes / 60;

        minutes = Math.floor(minutes);
        hours = Math.floor(hours);

        if (hours === 1)
            return "1 hour"
        if (hours > 0)
            return hours.toString() + " hours"
        if (minutes === 1)
            return "1 minute"
        if (minutes > 0)
            return minutes.toString() + " minutes"
        if (sec === 1)
            return "1 second"
        if (sec > 0)
            return sec.toString() + " seconds"
        return '';
    }
}
module.exports = DateTime;
