
const app = getApp();

Page({
  data:{
    faceUrl:"../resource/images/noneface.png",
    isMe:true,
    isFollow:false
  },
  onLoad:function(obj){
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
  },
  logout:function(obj){
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待',
    });
    wx.request({
      url: serverUrl+'/logout?userId='+user.id,
      method:"POST",
      header:{
        'content-type': 'application/json'
      },
      success:function(res){
        console.log(res.data);
        wx.hideLoading();
        if(res.data.status == 200){
          wx.showToast({
            title: '注销成功',
            icon:"success",
            duration:2000
          });
          wx.removeStorageSync("userInfo");
          wx.redirectTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  }
})
