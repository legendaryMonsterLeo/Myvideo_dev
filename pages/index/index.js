const app = getApp();

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false
  },
  onLoad: function(obj) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
  },
  logout: function(obj) {
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    });
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          wx.showToast({
            title: '注销成功',
            icon: "success",
            duration: 2000
          });
          wx.removeStorageSync("userInfo");
          wx.redirectTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },
  upLoadFace: function(obj) {
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function(res) {
        var faceImagePath = res.tempFilePaths;
        console.log(faceImagePath);

        wx.showLoading({
          title: '正在上传...',
        })
        var serverUrl = app.serverUrl;
        var userInfo = app.getGlobalUserInfo();
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userInfo.id,
          filePath: faceImagePath[0],
          name: 'file',
          header: {
            'content-type': 'application/json',
            'headerUserId': userInfo.id
          },
          success: function(res) {
            var data = JSON.parse(res.data);
            console.log(data);
            wx.hideLoading();
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功',
                icon: "success"
              });
              var imageUrl = data.data;
              me.setData({
                faceUrl:serverUrl+imageUrl
              });
            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg
              });
            }else if(res.data.status==502){
              wx.showToast({
                title: res.data.msg,
                duration:2000,
                icon:"none",
                success:function(){
                  wx.redirectTo({
                    url: '../userLogin/login',
                  })
                }
              })
            }
          }
        })
      }
    })
  }
})