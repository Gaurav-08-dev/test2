import Avatar from "../Avatar/Avatar";
import React from 'react';


const formatShiftDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
});

export const getUserNameBasedOnId = (userList, id, type) => {

    if (userList.length > 0) {

        let userName;

        for (let i = 0; i < userList.length; i++) {

            if (userList[i].id === id) {

                if (type === 'detail')
                    userName = userList[i].first_name + ' ' + (userList[i].last_name !== null ? userList[i].last_name : '');

                if (type === 'message_detail')
                    userName = userList[i].first_name;


                break;
            }

        }

        return userName;
    }
}


export const getUserNameImage = (userList, id, isReply ,type) => {

    let user;

    if (userList?.length > 0) {

        for (let i = 0; i < userList.length; i++) {

            if (userList[i].id === id) {

                user = userList[i];

                break;

            }

        }



        if (user) {

            if(type==='detail'){

                return <Avatar imgSrc={user.cover_img_url}
                    firstName={user.first_name}
                    lastName={user.last_name}
                    alt={`${user.first_name}'s pic`}
                    height={20}
                    width={20}
                    fontSize={9}
                    borderRadius='2px'
                />
            }

            if(type==='message_detail'){
            return <div className='chat-avatar'>
                <Avatar imgSrc={user.cover_img_url}
                    firstName={user.first_name}
                    lastName={user.last_name}
                    alt={`${user.first_name}'s pic`}
                    height={30}
                    width={30}
                    fontSize={12} 

                    />
            </div>
            }

        }

    }

}


const getDiffDay = (time) => {

    let dt1 = new Date();

    let dt2 = new Date(time);


    let diff = (dt2.getTime() - (dt1.getTime())) / 1000;

    diff /= 60;

    let timeDiff;
    let min = Math.abs(Math.round(diff));

    if (min < 1) {

        timeDiff = 'Now'

    } else if (min >= 1 && min < 60) {


        min=Math.round(min)
        const suffix=min<2 ? ' Minute':' Minutes'
        timeDiff = min + suffix +' ago'

    } else if (min > 59) {

        let hour = min / 60;

        if (hour < 24) {

            hour=Math.round(hour);
            const suffix=hour<2 ? ' Hour' : ' Hours'
            timeDiff =  hour + suffix +' ago'

        } else {

            let day = hour / 24;


            if (day < 31) {
                day=Math.round(day);
                const suffix=day<2 ? ' Day' : ' Days'
                timeDiff =  day + suffix +' ago'

            } else {

                let month = day / 31;
                month=Math.round(month);
                const suffix=month<2 ? ' Month' : ' Months'
                timeDiff =  month + suffix +' ago'

            }

        }

    }

    return timeDiff;

}
export const getTimeZone = (date, isDateFormat) => { 

    date = date.replace('T', " ").concat(' GMT');

    let d = new Date(date);

    let dateOptions = { year: 'numeric', month: 'long' };

    let timeOptions = { hour12: true, hour: '2-digit', minute: '2-digit',second:'2-digit' };

    let a = `${d.getDate()} ${d.toLocaleDateString('en-us', dateOptions)} ${d.toLocaleTimeString('en-us', timeOptions)}`;
    let time;

    if (!isDateFormat) {

        time = getDiffDay(a);

    } else {


        time = `${d.getDate()} ${d.toLocaleDateString('en-us', dateOptions)} ${d.toLocaleTimeString('en-us', timeOptions)}`;

    }

    return time;

}

export const formatDates=(inputDate, format)=> {


    if (!inputDate || !format) return;
    let month = (+inputDate.getMonth() + 1 < 10 ? ('0' + (+inputDate.getMonth() + 1)) : (+inputDate.getMonth() + 1));
    let date = (+inputDate.getDate() < 10 ? ('0' + (inputDate.getDate())) : (inputDate.getDate()));

    switch (format) {
        case 'yyyy-mm-dd':
            inputDate = inputDate.getFullYear() + '-' + month + '-' + date;
            break;

        case 'dd-mm-yyyy':
            inputDate = date + '-' + month + '-' + inputDate.getFullYear();
            break;

        case 'www-mmm-dd-yyyy':
            inputDate = formatShiftDate.format(inputDate)
            break;
        
        case 'mmm-dd-yyyy':
            inputDate =new Intl.DateTimeFormat('en-US',{dateStyle:'medium'}).format(inputDate)
            break;

        default:
            inputDate = inputDate.getFullYear() + '-' + month + '-' + date;
            break;
    }

    return inputDate;
}