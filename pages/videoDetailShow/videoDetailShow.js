var videoUtil = require('../../utils/upLoadVideo.js')
const app = getApp();
Page({
  data: {
    src: '',
    cover: 'fill',
    searchTop: '',
    pixelRatio: 2,
    percent: 1,
    videoInfo:{},
    serverUrl:app.serverUrl,
    userLikeVideo:false,
    publisher:{},
    likeNumber:0,
    isMe:false,
    isfans:false,
    tab:1,

    btnShow: true,
    animationShow: false,//动画显示状态
    isPause: false,
    animation: {},
    animationTwo:{},
    commentsPage: 1,//当前页
    commentsTotalPage: 1,//总页数
    commentsList: [],//评论数据数组
    secondCommentsList: [],//二级评论数据
    commentTotalRecords: 0,//总记录数

    placeholder: "说点什么...",

    hasmoreData: true,
    hiddenloading: true
  },
  videoContext:{},

  onLoad: function(parms) {
    var me = this
    var videoInfo = JSON.parse(parms.videoInfo);
    var tab = parms.tab;
    var cover = "fill";
    var videoHeight = videoInfo.videoHeight;
    var videoWidth = videoInfo.videoWidth;
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    var isMe = false;
    if (videoWidth >= videoHeight) {
      cover = "";
    }
    if(videoInfo.userId == userInfo.id){
      isMe = true;
    }
    me.setData({
      tab:tab
    })
    //请求发布者的信息
    wx.request({
      url: serverUrl + '/video/queryPublisher?loginUserId=' + userInfo.id +'&videoId='+videoInfo.id+
        '&publisherId=' + videoInfo.userId,
      method:"POST",
      success:function(res){
        console.log(res);
        me.setData({
          publisher:res.data.data.publisher,
          userLikeVideo:res.data.data.userLikeVideo,
          isfans:res.data.data.follow
        })
      }
    })


    let menuButtonObject = wx.getMenuButtonBoundingClientRect()
    console.log(menuButtonObject)
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        me.setData({
          pixelRatio: res.pixelRatio
        })
      }
    })
    this.setData({
      searchTop: menuButtonObject.top + 4
    })
    me.setData({
      videoInfo: videoInfo,
      likeNumber: videoInfo.likeCounts,
      cover : cover,
      isMe:isMe
    })
    me.videoContext = wx.createVideoContext(videoInfo.id, this)

    me.initComment();

  },
  
  pause: function () {
    this.videoContext.pause()
    this.setData({
      isPause: true
    })
  },

  play: function () {
    setTimeout(() => {
      this.videoContext.play()
    }, 500)
    this.setData({
      isPause: false
    })
  },

  onReady:function(){
    //评论组件动画
    this.animationTwo = wx.createAnimation({ //评论组件弹出动画
      duration: 400, // 整个动画过程花费的时间，单位为毫秒
      timingFunction: "ease", // 动画的类型
      delay: 0 // 动画延迟参数
    })

  },

  onHide: function () {
    var me = this;
    me.videoContext.pause();
  },
  onShow:function(){
    var me = this;
    me.videoContext.play();
  },

  bindtimeupdate(e) {
    let percent = (e.detail.currentTime / e.detail.duration) * 100
    this.setData({
      percent: percent.toFixed(2)
    })
  },

  backTo:function(){
    var tab = this.data.tab;
    if(tab == 1){
      wx.switchTab({
        url: '../videoShow/videoShow',
      })
    }else if(tab == 1){
      wx.switchTab({
        url: '../index/index',
      })
    }else{
      wx.navigateBack({
        delta:1
      })
    }
  },

  goIndex:function(){
    wx.switchTab({
      url: '../videoShow/videoShow',
    })
  },

  showSearch:function(){
    wx.navigateTo({
      url: '../searchView/searchView',
    })
  },  

  goAddVideo:function(){
    videoUtil.upLoadVideo();
  },
  showMine:function(){
    wx.switchTab({
      url: '../index/index',
    })
  },

  likeVideoOrNot:function(){
    var me = this;
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var userLikeVideo = me.data.userLikeVideo;
    var likeNumber = me.data.likeNumber;
    var likeorNotUrl = "/video/like?userId="+userInfo.id+"&videoId="+videoInfo.id+"&authorId="+videoInfo.userId;
    if(userLikeVideo){
      likeorNotUrl ="/video/unlike?userId=" + userInfo.id + "&videoId=" + videoInfo.id + "&authorId=" + videoInfo.userId;
      likeNumber = likeNumber-1;
    }else{
      likeNumber = likeNumber+1;
    }
    if(likeNumber < 0){
      likeNumber = 0;
    }
    me.setData({
      likeNumber: likeNumber
    })
    wx.request({
      url: serverUrl+likeorNotUrl,
      method:"POST",
      header:{
        'content-type': 'application/json',
        'userId': userInfo.id,
        'userToken': userInfo.session_key
      },
      success:function(res){
        if (res.data.status == 200){
          me.setData({
            userLikeVideo: !userLikeVideo
          })
        }else if(res.data.status == 502) {
          wx.redirectTo({
            url: '../start/start',
          })
        }else{
          wx.showToast({
            title: '服务器错误',
            duration:2000
          })
        }
      }
    })
  },
  goUserHome:function(){
    var me = this;
    var videoInfo = me.data.videoInfo;
    var userInfo = app.getGlobalUserInfo();
    if(userInfo.id == videoInfo.userId){
      wx.switchTab({
        url: '../index/index',
      })
    }else{
      wx.navigateTo({
        url: '../userRoom/userRoom?publisherId=' + videoInfo.userId,
      })
    }
  },
  addFans:function(){
    var me = this;
    var publisherId = me.data.videoInfo.userId;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.id;
    var serverUrl = app.serverUrl;
    var url = "/user/follow?userId=" + publisherId + "&fanId=" + userId
    wx.request({
      url: serverUrl+url,
      method: "POST",
      header: {
        'content-type': 'application/json',
        'userId': userInfo.id,
        'userToken': userInfo.session_key
      },
      success:function(){
        me.setData({
          isfans:true
        })
      }
    })
  },
  deleteFans:function(){
    var me = this;
    var publisherId = me.data.videoInfo.userId;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.id;
    var serverUrl = app.serverUrl;
    var url = "/user/notFollow?userId=" + publisherId + "&fanId=" + userId
    wx.request({
      url: serverUrl + url,
      method: "POST",
      header: {
        'content-type': 'application/json',
        'userId': userInfo.id,
        'userToken': userInfo.session_key
      },
      success: function () {
        me.setData({
          isfans: false
        })
      }
    })
  },
  shareMe:function(){
    var me = this;
    wx.showActionSheet({
      itemList: ['下载到本地','举报用户','分享到朋友圈'],
      success:function(res){
        console.log(res.tapIndex);
        if(res.tapIndex == 0){
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + '/' + me.data.videoInfo.videoUrl,
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        }else if(res.tapIndex == 1){
          //举报
          var publishUserId = me.data.videoInfo.userId;
          var videoId = me.data.videoInfo.id;
          var currentUserId = app.getGlobalUserInfo().id;
          wx.navigateTo({
            url: '../reports/reports?videoId=' + videoId + "&publishUserId=" + publishUserId
          })

        }else{

        }
      }
    })
  },
  onShareAppMessage:function(res){
    var me = this;
    var videoInfo = me.data.videoInfo;
    var tab = me.data.tab;
    return {
      title: '短视频内容分享',
      path: "pages/videoDetailShow/videoDetailShow?tab=2"+"&videoInfo=" + JSON.stringify(videoInfo)
    }
  },




  ///////////////评论/////////////////////////

  initComment() {

    console.log('=================initComment================')
    var me = this
    // debugger
    me.getCommentsList(1);
    // me.setData({
    //   commnetNum: me.data.commentTotalRecords
    // })

  },
  showComments: function () {
    this.showTalks()
  },

  showTalks: function (e) {
    this.videoContext.pause()
    // debugger
    this.setData({
      btnShow: false
    })


    // 设置动画内容为：使用绝对定位显示区域，高度变为100%
    this.animationTwo.bottom("0rpx").height("100%").step()
    this.setData({
      talksAnimationData: this.animationTwo.export(),
      animationShow: true
    })
  },

  hideTalks: function () {

    this.setData({
      btnShow: true
    })
    // 设置动画内容为：使用绝对定位隐藏整个区域，高度变为0
    this.animationTwo.bottom("-100%").height("0rpx").step()
    this.setData({
      // commentList: [],
      talksAnimationData: this.animationTwo.export(),
      animationShow: false,
    })
    // console.log(this.data.playState)
    // if (!this.data.isPause) {

    //   this.videoCtx.play()
    // }
    this.setData({
      placeholder: "说点什么...",
      secondCommentsList: [],
      replyFatherCommentId: '',
      replyToUserId: '',
    });
    if (!this.data.isPause) {

      setTimeout(() => {
        this.videoContext.play()
      }, 500)
    }
  },
  onScrollLoad: function () {

    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage) {
      me.setData({
        hasmoreData: false,
        hiddenloading: true,
      })
      return;
    }
    var page = currentPage + 1;
    me.getCommentsList(page);
    me.setData({
      hasmoreData: true,
      hiddenloading: false,
    })


  },

  leaveComment: function () {
    // this.setData({
    //   commentFocus: true
    // });
  },

  replyFocus: function (e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },

  saveComment: function (e) {
    var me = this;
    var content = e.detail.value;

    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;
    if (fatherCommentId == undefined || fatherCommentId == null) {
      fatherCommentId = ''
    }
    if (toUserId == undefined || toUserId == null) {
      toUserId = me.data.publisher.id
    }

    var user = app.getGlobalUserInfo();
    // var videoInfo = JSON.stringify(me.data.videoInfo);
    // var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.redirectTo({
        url: '../start/start',
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: me.data.videoInfo.id,
          comment: content
        },
        success: function (res) {
          // debugger
          console.log(res.data)
          wx.hideLoading();

          me.setData({
            contentValue: "",
            commentsList: [],
            placeholder: "说点什么..."
          });

          me.getCommentsList(1);
          if (fatherCommentId != '') {

            me.getVideoSecondComments(fatherCommentId)
          }
        }
      })
    }
  },


  getCommentsList: function (page) {
    var me = this;

    var videoId = me.data.videoInfo.id;
    // debugger
    wx.request({
      url: app.serverUrl + '/video/getVideoFirstComments?videoId=' + videoId + "&page=" + page + "&pageSize=5",
      method: "POST",
      success: function (res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = me.data.commentsList;
        if (page == 1) {
          newCommentsList = []
        }

        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total,
          commentTotalRecords: res.data.data.records
        }, () => {
          console.log('=================initComment================', videoId, page, me.data.commentTotalRecords)
        });
      }
    })
  },

  getVideoSecondComments: function (fid, e) {
    var me = this;
    console.log("fid", fid)
    var videoId = me.data.videoInfo.id;
    // debugger
    // debugger
    wx.request({
      url: app.serverUrl + '/video/getVideoSecondComments?videoId=' + videoId + "&fatherCommentId=" + fid,
      method: "POST",
      success: function (res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        // var newCommentsList = me.data.commentsList;

        me.setData({
          secondCommentsList: commentsList,
        }, () => {
          if (e != undefined) {
            var ids = e.currentTarget.dataset.idx

            console.log('ids', ids)
            var num = Number(ids)
            me.data.commentsList[num].second = true
            me.data.commentsList[num].secondList = me.data.secondCommentsList
            // debugger
            me.setData({
              commentsList: me.data.commentsList
            })
          }
        });
      }
    })
  },

  showSecondComments: function (e) {
    this.getVideoSecondComments(e.currentTarget.dataset.ids, e)
  },

  loseSecondComment: function (e) {
    var me = this
    var ids = e.currentTarget.dataset.idx
    // debugger
    console.log('ids', ids)
    var num = Number(ids)
    me.data.commentsList[num].second = false
    me.data.commentsList[num].secondList = []
    // debugger
    me.setData({
      commentsList: me.data.commentsList
    })
  }
})

function throttle(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}