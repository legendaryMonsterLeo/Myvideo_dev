//app.js
App({
  globalData: {
    navHeight: 0
  },
  serverUrl:"http://192.168.0.108:8081",
  userInfo:null,
  navHeight: 0,
  setGlobalUserInfo:function(user){
    wx.setStorageSync("userInfo", user);
  },
  getGlobalUserInfo:function(){
    return wx.getStorageSync("userInfo")
  },
  globalData: {
    eyeUrl: 'https://baobab.kaiyanapp.com/',
  },
  onLaunch:function(){
    wx.getSystemInfo({
      success: res => {
        //导航高度
        this.globalData.navHeight = res.statusBarHeight + 45;
      }, fail(err) {
        console.log(err);
      }
    })
  },
  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其它原因"
  ]
})