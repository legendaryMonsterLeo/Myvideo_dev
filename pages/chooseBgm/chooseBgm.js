// pages/chooseBgm/chooseBgm.js
const app = getApp();
Page({
  data: {
    bgmList: [],
    serverUrl: '',
    videoObj: [],
    imageSrc: '',
    VideoNote: '', //视频描述
    VideoNoteMax: 100, //描述最大长度
    checkValue: '5',
    kinds: [{
        name: '美食',
        value: '1'
      },
      {
        name: '搞笑',
        value: '2'
      },
      {
        name: '科技',
        value: '3'
      },
      {
        name: '舞蹈',
        value: '4'
      },
      {
        name: '短剧',
        value: '5',
        checked: 'true',
      },
      {
        name: '影视',
        value: '6'
      }
    ]
  },
  onLoad: function(params) {
    var me = this;
    console.log(params);
    me.setData({
      videoObj: params
    })
    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "POST",
      header: {
        'content-Type': 'application/json',
        'userId': userInfo.id,
        'userToken': userInfo.session_key
      },
      success: function(res) {
        console.log(res);
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          me.setData({
            bgmList: bgmList,
            serverUrl: serverUrl
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
  },
  upload: function(e) {
    var me = this;
    console.log(e);
    var bgmId = e.detail.value.bgmId;
    var description = e.detail.value.desc;
    var duration = me.data.videoObj.duration;
    var tempheight = me.data.videoObj.tempheight;
    var tempwidth = me.data.videoObj.tempwidth;
    var tempVideoPath = me.data.videoObj.tempVideoPath;
    var tempCoverPath = me.data.videoObj.tempCoverPath;
    var imagePath = me.data.imageSrc;
    var checkValue = me.data.checkValue;
    //上传短视频
    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    wx.uploadFile({
      url: serverUrl + '/video/uploadVideo',
      filePath: tempVideoPath,
      name: 'file',
      formData: {
        userId: userInfo.id,
        bgmId: bgmId,
        videoSeconds: duration,
        videoHeight: tempheight,
        videoWidth: tempwidth,
        description: description,
        checkValue: checkValue
      },
      header: {
        'content-type': 'application/json',
        'userId': userInfo.id,
        'userToken': userInfo.session_key
      },
      success: function(e) {
        var userInfo = app.getGlobalUserInfo();
        var data = JSON.parse(e.data);
        console.log(data);
        if (data.status == 200) {
          if (imagePath != '') {
            tempCoverPath = imagePath;
          }
          if (imagePath != '') {
            wx.uploadFile({
              url: serverUrl + '/video/uploadCover',
              filePath: tempCoverPath,
              name: 'file',
              formData: {
                userId: userInfo.id,
                videoId: data.data
              },
              header: {
                'content-type': 'application/json',
                'userId' : userInfo.userId,
                'userToken' : userInfo.session_key
              },
              success: function() {
                wx.hideLoading();
                me.setData({
                  imageSrc: ''
                })
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          }else{
            wx.hideLoading();
            me.setData({
              imageSrc: ''
            })
            wx.navigateBack({
              delta: 1
            })
          }
        } else if (data.status == 502) {
          wx.showToast({
            title: data.msg,
            duration: 2000,
            icon: 'none'
          });
          wx.redirectTo({
            url: '../start/start',
          })
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'fail'
          })
        }
      }
    })
  },
  chooseCover: function() {
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        me.setData({
          imageSrc: res.tempFilePaths[0]
        })
      }
    })
  },
  radioChange: function(e) {
    var me = this;
    this.setData({
      checkValue: e.detail.value
    })
  }
})