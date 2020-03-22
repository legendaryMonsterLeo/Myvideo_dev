const app = getApp();

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: false,
    isFollow: false,
    publisherId:'',
    fansCount:0,
    first:true,

    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFlag: false,
    myLikeFlag: true,
    myFollowFlag: true
  },

  onLoad: function (obj) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.open_id;
    var publisherId = obj.publisherId;
    wx.showLoading({
      title: '请等待',
    })

    if (publisherId != null && publisherId !='' && publisherId !=undefined){
      me.setData({
        publisherId : publisherId
      })
    }

    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/user/query?userId=' + publisherId+'&fanId='+user.id,
      method: "POST",
      header: {
        'content-type': 'application/json',
        'userId': userId,
        'userToken': user.session_key
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          var userInfo = res.data.data;
          var facepath = '../resource/images/noneface.png';
          if (userInfo.faceImage !== null && userInfo.faceImage != '' && userInfo.faceImage != undefined) {
            facepath = userInfo.faceImage;
          }
          me.setData({
            faceUrl: facepath,
            fansCount: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow:userInfo.follow
          })
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../start/start',
              })
            }
          })
        }
      }
    })
    this.getMyVideoList(1);
  },
  onShow:function(){
    var first = this.data.first;
    if(!first){
      this.getMyVideoList(1);
    }
  },
  onHide:function(){
    var me  =this;
    me.setData({
      first:false
    })
  },
  logout: function (obj) {
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
      success: function (res) {
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
            url: '../start/start',
          })
        }
      }
    })
  },
  upLoadVideo: function (obj) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 120,
      camera: 'back',
      success(obj) {
        console.log(obj.type)
        console.log(obj.tempFiles[0].tempFilePath)

        var res = obj.tempFiles[0];

        var duration = res.duration;
        var tempheight = res.height;
        var tempwidth = res.width;
        var tempVideoPath = res.tempFilePath;
        var tempCoverPath = res.thumbTempFilePath;

        if (duration > 300) {
          wx.showToast({
            title: '视频长度不能超过300秒',
            icon: 'none',
            duration: 2000
          })
        } else if (duration < 6) {
          wx.showToast({
            title: '视频长度不能少于5秒',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration
              + "&tempheight=" + tempheight
              + "&tempwidth=" + tempwidth
              + "&tempVideoPath=" + tempVideoPath
              + "&tempCoverPath=" + tempCoverPath,
          })
        }
      }
    })
  },
  upLoadFace: function (obj) {
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
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
            'userId': userInfo.id,
            'userToken': userInfo.session_key
          },
          success: function (res) {
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
                faceUrl: serverUrl + imageUrl
              });
            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg
              });
            } else if (res.data.status == 502) {
              wx.showToast({
                title: res.data.msg,
                duration: 2000,
                icon: "none",
                success: function () {
                  wx.redirectTo({
                    url: '../start/start',
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  followMe:function(e){
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = me.data.publisherId;
    var serverUrl = app.serverUrl;
    var followType = e.currentTarget.dataset.followtype;
    // 1.关注  0.取消关注
    var url = "";
    if(followType == '1'){
      url = "/user/follow?userId="+publisherId+"&fanId="+userId
    }else{
      url = "/user/notFollow?userId=" + publisherId + "&fanId=" + userId
    }
    wx.showLoading();
    wx.request({
      url: serverUrl+url,
      method:"POST",
      header:{
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.session_key
      },
      success:function(){
        wx.hideLoading();
        if (followType == '1') {
          me.setData({
            isFollow : true,
            fansCount: me.data.fansCount+1
          })
        } else {
          me.setData({
            isFollow: false,
            fansCount: me.data.fansCount-1
          })
        }
      }
    })
  },

  doSelectWork: function () {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFlag: false,
      myLikeFlag: true,
      myFollowFlag: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,
    })
    this.getMyVideoList(1);
  },
  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFlag: true,
      myLikeFlag: false,
      myFollowFlag: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,
    })
    this.getMyLikeList(1);
  },
  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFlag: true,
      myLikeFlag: true,
      myFollowFlag: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,
    })
    this.getMyFollowList(1);
  },

  getMyVideoList: function (page) {
    var me = this;

    wx.showLoading();
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/getAllVideo?page=' + page + '&pageSize=6',
      method: "POST",
      data: {
        userId: me.data.publisherId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var myVideoList = res.data.data.rows;
        myVideoList = myVideoList.map(function (_ref) {
          var faceImage = _ref.faceImage,
            nickname = _ref.nickname,
            videoDesc = _ref.videoDesc,
            imgUrl = serverUrl + _ref.coverPath,
            imgW = _ref.imageWidth,
            imgH = _ref.imageHeight,
            title = _ref.audioId,
            videoUrl = _ref.videoPath,
            id = _ref.id,
            userId = _ref.userId,
            videoWidth = _ref.videoWidth,
            videoHeight = _ref.videoHeight,
            likeCounts = _ref.likeCounts,
            audioId = _ref.audioId;
          return {
            faceImage: faceImage,
            nickname: nickname,
            videoDesc: videoDesc,
            imgUrl: imgUrl,
            imgW: imgW,
            imgH: imgH,
            title: title,
            videoUrl: videoUrl,
            id: id,
            userId: userId,
            videoWidth: videoWidth,
            videoHeight: videoHeight,
            likeCounts: likeCounts,
            audioId: audioId
          };
        });
        wx.hideLoading();
        var newVideoList = me.data.myVideoList;

        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total
        })
      }
    })
  },
  getMyLikeList: function (page) {
    var me = this;
    var publisherId = me.data.publisherId;
    wx.showLoading();
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyLike?page=' + page + '&pageSize=6' + '&userId=' + publisherId,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        likeVideoList = likeVideoList.map(function (_ref) {
          var faceImage = _ref.faceImage,
            nickname = _ref.nickname,
            videoDesc = _ref.videoDesc,
            imgUrl = serverUrl + _ref.coverPath,
            imgW = _ref.imageWidth,
            imgH = _ref.imageHeight,
            title = _ref.audioId,
            videoUrl = _ref.videoPath,
            id = _ref.id,
            userId = _ref.userId,
            videoWidth = _ref.videoWidth,
            videoHeight = _ref.videoHeight,
            likeCounts = _ref.likeCounts,
            audioId = _ref.audioId;
          return {
            faceImage: faceImage,
            nickname: nickname,
            videoDesc: videoDesc,
            imgUrl: imgUrl,
            imgW: imgW,
            imgH: imgH,
            title: title,
            videoUrl: videoUrl,
            id: id,
            userId: userId,
            videoWidth: videoWidth,
            videoHeight: videoHeight,
            likeCounts: likeCounts,
            audioId: audioId
          };
        });
        wx.hideLoading();
        var newVideoList = me.data.likeVideoList;

        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total
        })

      }
    })
  },

  getMyFollowList: function (page) {
    var me = this;
    var publisherId = me.data.publisherId;
    wx.showLoading();
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyFollow?page=' + page + '&pageSize=6' + '&userId=' + publisherId,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        followVideoList = followVideoList.map(function (_ref) {
          var faceImage = _ref.faceImage,
            nickname = _ref.nickname,
            videoDesc = _ref.videoDesc,
            imgUrl = serverUrl + _ref.coverPath,
            imgW = _ref.imageWidth,
            imgH = _ref.imageHeight,
            title = _ref.audioId,
            videoUrl = _ref.videoPath,
            id = _ref.id,
            userId = _ref.userId,
            videoWidth = _ref.videoWidth,
            videoHeight = _ref.videoHeight,
            likeCounts = _ref.likeCounts,
            audioId = _ref.audioId;
          return {
            faceImage: faceImage,
            nickname: nickname,
            videoDesc: videoDesc,
            imgUrl: imgUrl,
            imgW: imgW,
            imgH: imgH,
            title: title,
            videoUrl: videoUrl,
            id: id,
            userId: userId,
            videoWidth: videoWidth,
            videoHeight: videoHeight,
            likeCounts: likeCounts,
            audioId: audioId
          };
        });
        wx.hideLoading();
        var newVideoList = me.data.followVideoList;

        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total
        })
      }
    })
  },

  showVideo: function (e) {
    console.log(e);
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;
    var videoList = {};
    if (!myWorkFlag) {
      videoList = this.data.myVideoList;
    } else if (!myLikeFlag) {
      videoList = this.data.likeVideoList;
    } else {
      videoList = this.data.followVideoList;
    }
    var index = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[index]);
    wx.navigateTo({
      url: '../videoDetailShow/videoDetailShow?videoInfo=' + videoInfo + '&tab=3',
    })
  },

  onReachBottom: function () {
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;

    if (!myWorkFlag) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      if (currentPage == totalPage) {
        wx.showToast({
          title: '已经没有视屏了',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikeFlag) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.likeVideoTotal;
      if (currentPage == totalPage) {
        wx.showToast({
          title: '已经没有视屏了',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikeList(page);
    } else {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      if (currentPage == totalPage) {
        wx.showToast({
          title: '已经没有视屏了',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }
  }
  
})