//login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {}
  },
  doLogin: function(e) {
   console.log(e.detail.userInfo);
   var user = e.detail.userInfo;
   wx.showLoading({
     title: '正在获取授权',
   })
   wx.login({
     success:function(res){
       console.log(res);
       var serverUrl = app.serverUrl;
       var code = res.code; //获取用户Code
       wx.request({
         url: serverUrl+'/getAuth?code='+code+'&username='+user.nickName+'&avatarUrl='+user.avatarUrl,
         header: {
           'content-type': 'application/json'
         },
         method:"POST",
         success:function(result){
           console.log(result);
           app.setGlobalUserInfo(result.data.data);
           wx.hideLoading();
           wx.switchTab({
             url: '/pages/videoShow/videoShow',
           })
         }
       })
     }
   })
  },

  onLoad: function() {
    var that = this
    let userInfo = wx.getStorageSync('userInfo')
    var serverUrl = app.serverUrl;
    if(userInfo){
      wx.request({
        url: serverUrl +'/user/checkLife',
        header: {
          'content-type': 'application/json',
          'userId': userInfo.id,
          'userToken': userInfo.session_key
        },
        method:"POST",
        success:function(res){
          if (res.data.status == 502){
            wx.removeStorage({
              key: 'userInfo',
              success: function(res) {},
            });
          }else{
            console.log("-----------------------已经有授权-------------------")
            wx.switchTab({
              url: '/pages/videoShow/videoShow',
            })
          }
        }
      })
    }
  },

  onShow: function() {
    let that = this
    let userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo)
  },

  onReady: function() {
    var that = this;
    setTimeout(function() {
      that.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function(res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  }
});