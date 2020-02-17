// pages/chooseBgm/chooseBgm.js
const app = getApp();
Page({
  data: {
    bgmList:[],
    serverUrl:app.serverUrl,
    VideoNote: '', //视频描述
    VideoNoteMax: 100 //描述最大长度
  },
  onLoad:function(){
    var me = this;
    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl +'/bgm/list',
      method:"POST",
      header:{
        'content-Type':'application/json'
      },
      success:function(res){
        console.log(res);
        wx.hideLoading();
        if(res.data.status==200){
          var bgmList = res.data.data;
          me.setData({
            bgmList:bgmList
          });
        }
      }
    })
  },
  inputs: function(e) {
    // 获取输入框的内容
    var value = e.detail.value;
    this.setData({ //更新备注内容到vue缓存
      VideoNote: e.detail.value
    })
    // 获取输入框内容的长度
    var len = parseInt(value.length);

    //最多字数限制
    if (len > this.data.VideoNoteMax) return;
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      currentWordNumber: len //当前字数
    });
  }
})