//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    cityArray: ['Beijing', 'Shanghai', 'Suzhou'],
    cityCode: ['108288', '108296', '118163'],
    interestsArray: ['all', 'music', 'film', 'drama', 'commonweal', 'salon', 'exhibition', 'party', 'sports', 'travel', 'others'],
    cityIndex: 0,
    interestsIndex: 0,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    dataObj: { name: '我是name', extra: '我是extra' }
  },

  // city Change Listener
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      cityIndex: e.detail.value
    })
  },

  // interests Change Listener
  bindPickerInterestsChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      interestsIndex: e.detail.value
    })
  },

  // request data from API
  getDataFromAPI: function (e) {
    var baseDoubanURL = "https://douban.uieee.com/v2/event/list?";
    var realRequestURL = baseDoubanURL + "loc=" + this.data.cityCode[this.data.cityIndex] + "&type=" + this.data.interestsArray[this.data.interestsIndex];
    wx.navigateTo({
      url: '/pages/index/index',
      // url: '/pages/index/index?requestUrl=' + baseDoubanURL + '&type=' + this.data.interestsArray[this.data.interestsIndex]
    })

    var dataObj = { name: '我是name', extra: '我是extraaaaa' };
    //wx.request({
    //  url: realRequestURL,
    //    success: function (res) {
    //        console.log(JSON.stringify(res.data).length)
    //        wx.navigateTo({
    //            url: '/pages/index/index?dataObj=' + JSON.stringify(res.data)
    //            url: '/pages/index/index?dataObj=' + JSON.stringify(res.data.districts[0])
    //            url: '/pages/index/index?dataObj=' + JSON.stringify(dataObj)

    //        })
    //  }
    //})
  },

  //事件处理函数
  getCardView: function () {
    //wx.navigateTo({
    //    url: '/pages/index/index',
    //})
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
})
