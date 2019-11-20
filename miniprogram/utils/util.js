const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

let formatString = function (str) {
    if (typeof (str) != "string") {
        console.log('wait what are you doing here give me a string =-=')
        console.log(typeof(str))
        return;
    }
    str = str.replace(/\ +/g, "");
    str = str.replace(/[\r\n]/g, "");
    return str;
}

module.exports = {
    formatTime: formatTime,
    formatString: formatString,
}
