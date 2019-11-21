Page({
  data: {
    userResult: []
  },

  getFriendInfo(e) {

  },

  onLoad: function(option) {
    var that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('eventIdTransfer', function (data) {
      that.queryParticipants(data[data])
    })
  },
  
  queryParticipants(eventId) {
    var that = this
    const db = wx.cloud.database()
    // 查询当前events 所有的参加用户
    db.collection('events').where({
      _id: eventId
    }).get({
      success: res => {
        var participantsData = Object.keys(res.data[0].participants);
        participantsData.forEach(parseUserInfo)

        function parseUserInfo(item, index, arr) {
          var userInfo = item.split('$ep#');
          var icon = userInfo[1];
          var userName = userInfo[0];
          arr[index] = { 'icon': icon, 'alias': userName }
        }

        that.setData({
          userResult: participantsData
        })

        console.log('[数据库] [查询记录] 成功: ', res.data[0])
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
})