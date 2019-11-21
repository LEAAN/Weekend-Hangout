// pages/index/index.js
const app = getApp()

import mockArr from './mock.js'
const utils = require('../../utils/util.js')
let winWidth = 414;
let winHeight = 736;
let ratio = 2;
function deepClone(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  let newObj = obj instanceof Array ? [] : {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]
    }
  }
  return newObj
}

Page({
  data: {
    x: winWidth,
    y: winHeight,
    animationA: {},
    list: [],
    doubanData: [],
    distance: '',
    startX: '',
    startY: '',
    eventId: '',
    dataObj: {}
  },

  joinEvent(e) {
    let index = e.currentTarget.dataset.index;
    var item = this.data.list[index];
    this.engageEvent(item)
  },

  fetchParticipants(e) {
    let index = e.currentTarget.dataset.index;
    var item = this.data.list[index];

    wx.navigateTo({
      url: '/pages/participants/index',
      events: {
        eventIdTransfer: function(data) {
          wx.showToast({
            title: '查看感兴趣的好友',
          })
        }
      },
      success: res => {
        res.eventChannel.emit('eventIdTransfer', { data: item.id })
      }
    })
  },

  onLoad: function (options) {
    var that = this;
    var res = wx.getSystemInfoSync();
    winWidth = res.windowWidth;
    winHeight = res.windowHeight;
    ratio = res.pixelRatio
    this.getList()

    // wx.request({
    //     url: 'https://douban.uieee.com/v2/event/list?loc=108288&type=all',
    //     success: function (res) {
    //         that.setData({doubanData: res.data.events})
    //         that.getList()
    //         }
    // })
  },

  touchStart(e) {
    console.log(e, 'start')
    let startX = e.touches[0].clientX;
    let startY = e.touches[0].clientY;
    this.setData({ startX, startY })
  },

  // 拖动结束
  touchEnd(e) {
    var that = this;
    let startX = this.data.startX;
    let startY = this.data.startY;
    let endX = e.changedTouches[0].clientX;
    let endY = e.changedTouches[0].clientY;
    var distance = that.data.distance;
    // 与结束点与图片初始位置距离
    let disX = Math.abs(distance - winWidth)
    // 当前操作，初始点与结束点距离
    let disClientX = Math.abs(endX - startX)
    let disClientY = Math.abs(endY - startY)
    // 当滑动大于 滑块宽度的1/3翻页; was 83.25
    let moveDis = 30;
    if (disX > moveDis && disClientX > moveDis) {
      var list = that.data.list;
      let index = e.currentTarget.dataset.index;
      list[index].x = (endX - startX) > 0 ? winWidth * 2 : -winWidth
      that.setData({
        list: list,
        animationA: null
      });
      // 移出动画结束后 从list内移除
      setTimeout(() => {
        list.splice((list.length - 1), 1);
        that.setData({ list })
        // 列表长度小于4的时候请求服务端
        if (list.length < 4) {
          that.getList()
        }
      }, 300)
    } else if (disClientX < 1 && disClientY < 1) {
      // 点击进入
      console.log('点击进入详情')
    } else {
      var list = that.data.list;
      let index = e.currentTarget.dataset.index;
      list[index].x = winWidth
      list[index].y = 0
      that.setData({ list })
    }
  },
  
  onChange: function (e) {
    var that = this;
    that.setData({
      distance: e.detail.x
    })
  },

    // 模拟获取列表数据
  getList () {
    let list = this.data.list || [];
    // let arr = this.data.doubanData
    let arr = deepClone(mockArr)
    for (let i of arr) {
      i.x = winWidth
      i.y = 0
      list.unshift(i)
    }
    this.setData({ list })
  },

  engageEvent (item) {
    var that = this;
    const db = wx.cloud.database()
    const _ = db.command
    var userInfo = app.globalData.userInfo.nickName + '$ep#' + app.globalData.userInfo.avatarUrl;

    db.collection('events').doc(item.id).get({
      success: res => {
        if (!res.data.participants.hasOwnProperty(userInfo)){
          res.data.participants[userInfo] = true
          db.collection('events').doc(item.id).update({
            data: {
              participants: _.set(res.data.participants)
            },
            success: res => {
              wx.showToast({
                title: '参与活动成功',
              })
              console.log('[数据库] [新增记录] 成功，记录 _id: ', item.id)
              getEvent = true
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '参与活动失败'
              })
              console.error('[数据库] [新增记录] 失败：', err)
            },
          })
        } else {
          wx.showToast({
            title: '已参与此活动',
          })
          getEvent = true
        }
      },
      fail: e => {
        var userSet = {}
        userSet[userInfo] = true
        db.collection('events').add({
          data: {
            _id: item.id,
            event: item,
            participants: userSet
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id
            that.setData({
              eventId: item.id
            })
            wx.showToast({
              title: '参与活动成功',
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', item.id)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '参与活动失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        })
      }
    })
  },

  disengageEvent (eventId) {
    var that = this
    if (eventId) {
      const db = wx.cloud.database()
      var userInfo = app.globalData.userInfo.nickName + '$ep#' + app.globalData.userInfo.avatarUrl;
      db.collection('events').doc(eventId).get({
        success: res => {
          if (res.participants.hasOwnProperty(userInfo)) {
            res.participants[userInfo] = false
            db.collection('events').doc(eventId).update({
              data: {
                participants: _.set(res.data.participants)
              },
              success: res => {
                wx.showToast({
                  title: '取消活动成功',
                })
              }
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '无记录可删，请见创建一个记录',
      })
    }
  },

  queryEvents () {
    var that = this
    const db = wx.cloud.database()
    var userInfo = app.globalData.userInfo.nickName + '$ep#' + app.globalData.userInfo.avatarUrl;

    // 查询当前用户所有的 events
    db.collection('events').where({
      participants: hasOwnProperty(userInfo)
    }).get({
      success: res => {
        that.setData({
          eventResult: JSON.stringify(res.data, null, 2)
        })
        console.log('[数据库] [查询记录] 成功: ', res)
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
