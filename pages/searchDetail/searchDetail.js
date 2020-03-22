// pages/searchDetail/searchDetail.js
const app = getApp();
Page({
  data: {
    pageNo: 0,
    pageSrc: [],
    page:1,
    totalPage:1,
    searchContent:''
  },

  onLoad: function(parms) {
    var searchContent = parms.search;
    var isSaveRecord = parms.isSaveRecord;
    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }
    this.setData({
      searchContent: searchContent
    })
    this.getVideoList(1, isSaveRecord);
  },

  getVideoList: function(page, isSaveRecord) {
    var me = this;
    var serverUrl = app.serverUrl;
    var currentPage = me.data.currentTab;
    var pageSrc = me.data.pageSrc;
    wx.showLoading({
      title: '正在获取视频...',
    })
    var searchContent = this.data.searchContent
    wx.request({
      url: serverUrl + '/video/getAllVideo?isSaveRecord=' + isSaveRecord + '&page=' + page,
      method: "post",
      data: {
        videoDesc: searchContent
      },
      success: function(res) {
        wx.hideLoading();
        console.log(res);
        //如果是第一页就清空
        if (page == 1) {
          pageSrc = [];
          me.setData({
            pageSrc: pageSrc
          })
        }

        var videoList = res.data.data.rows;
        var pageSrcList = videoList.map(function(_ref) {
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
        var newPageSrcList = me.data.pageSrc;
        pageSrc = newPageSrcList.concat(pageSrcList)
        me.setData({
          page: page,
          totalPage: res.data.data.total,
          pageSrc: pageSrc
        })
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
  },

  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;
    //判断页数是否已经到达总页数
    if (currentPage == totalPage) {
      wx.showToast({
        title: '视频已经被你看完辣~~~',
        icon: "none"
      })
      return;
    }
    var page = currentPage + 1;
    let _pageNo = this.data.pageNo + 1;
    me.setData({
      pageNo: _pageNo
    })
    me.getVideoList(page, 0)
  }

})