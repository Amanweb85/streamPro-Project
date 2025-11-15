// ********* server side helper for SSR **********

// ----------------------------converting views,likes counts in 1.2K and 2.1M formate  ----------------------

export function changeFormate(num) {
    let n = +num;
    if (n <= 999) {
        return `${n}`;
    } else if (n < 999999) {
        return `${parseInt((100 * n) / 1000) / 100}K`;
    } else if (n < 99999999) {
        return `${parseInt((100 * n) / 1000000) / 100}M`;
    } else {
        return `${parseInt((100 * n) / 10000000) / 100}cr`;
    }
}
//-------------------------------converting seconds in min:sec formate (23:03)--------------------------------------

export function changeVidDurationFormat(seconds) {
    function formatData(data) {
        if (data < 10) return `0${data}`;
        else return data;
    }

    const date = new Date(seconds * 1000);
    if (date.getUTCHours()) {
        return `${date.getUTCHours()}:${formatData(
            date.getUTCMinutes()
        )}:${formatData(date.getUTCSeconds())}`;
    } else if (date.getUTCMinutes()) {
        return `${formatData(date.getUTCMinutes())}:${formatData(
            date.getUTCSeconds()
        )}`;
    } else {
        return `00:${formatData(date.getUTCSeconds())}`;
    }
}
//------------------------converting video_published_date in 2 days ago , 3 years ago... formate----------------

export function changeTimeFormate(time) {
    const timePassedObj = new Date(
        new Date().getTime() - new Date(time).getTime()
    );
    const passedYears = timePassedObj.getUTCFullYear() - 1970;
    const passedMonths = timePassedObj.getUTCMonth();
    const passedDays = Math.floor(timePassedObj.getTime() / 1000 / 60 / 60 / 24);
    const passedHours = timePassedObj.getUTCHours();


    if (passedYears) {
        return `${passedYears} years ago`;
    } else if (passedMonths) {
        return `${passedMonths} Month ago`;
    } else if (passedDays) {
        return `${passedDays} Days ago`;
    } else if (passedHours) {
        return `${passedHours} hours ago`;
    } else if (passedHours / 60) {
        return `${passedHours / 60} minutes ago`
    }
    else {
        return `just now`
    }
}