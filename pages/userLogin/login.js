// pages/userLogin/login.js
const app = getApp();
Page({
  doLogin: function (e) {
    var me = this;
    var form = e.detail.value;
    var username = form.username;
    var password = form.password;
    if (username.length == 0 || password == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: "success",
        duration: 3000
      })
    } else {
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '请等待',
      });
      wx.request({
        url: serverUrl + '/login',
        method: "post",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res.data);
          wx.hideLoading();
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
              title: '用户登录成功',
              icon: "none",
              duration: 3000
            }),
              app.setGlobalUserInfo(res.data.data);
            wx.switchTab({
              url: '/pages/videoShow/videoShow',
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: "none",
              duration: 3000
            })
          }
        }
      })
    }
  },
  goRegistPage:function(){
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }
})