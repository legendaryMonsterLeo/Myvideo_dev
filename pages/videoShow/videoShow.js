var API_URL = 'https://api.apiopen.top/musicBroadcasting';
var requires = require('../../requests/request.js');
const app = getApp();
Page({
  data: {
    searchContent: '',
    refreshing: [false, false],
    refreshed: [false, false],
    pageNo: 0,
    pageSrc: [],
    totalPage: 1,
    page: 1,
    currentTab: 0,
    serverUrl: app.serverUrl,
    title: ["推荐", "关注"],
    titleClick: 0, //点击导航条文字点击index
    // windowHeight: 0,
    searchHeight: 50, //搜索图片高度
    swiperHeight: 0, //瀑布流可视高度
    titleWidth: 0, //导航标题
    titleHeight: 0,
    background: [{ //幻灯片图片
      url: '../resource/images/1.jpg'
    }, {
      url: '../resource/images/2.jpg'
    }, {
      url: '../resource/images/3.jpg'
    }],


    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,
  },

  refresh(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      pageNo: 0
    })
    if (index == 0) {
      this.getVideoList(1, 0);
    } else {
      this.getMyFollow(1);
    }
    // 这是做网络请求的时机
    const that = this
    // 成功或者失败之后，将refreshed设为true，收起下拉刷新组件
    setTimeout(() => {
      that.setData({
        [`refreshed[${index}]`]: true,
      })
    }, 200)
  },

  itemTap: function(res) {
    console.log(res);
    var videoDetail = JSON.stringify(res.detail.dataset.item)
    console.log(videoDetail);
    wx.navigateTo({
      url: '../videoDetailShow/videoDetailShow?videoInfo=' + videoDetail + '&tab=1',
    })
  },

  //导航下划线：点击title传入对应的index
  titleClick: function(e) {
    var that = this;
    var clickNum = e.target.dataset.titleclick;
    //console.log(e);
    if (e.target.id !== "") {
      that.setData({
        titleClick: clickNum,
      })
    }
  },

  goToRoom: function(e) {
    console.log(e);
    var index = e.currentTarget.dataset.arrindex;
    var userId = this.data.followVideoList[index].userId;
    var myUserId = app.getGlobalUserInfo().open_id
    wx.navigateTo({
      url: '../userRoom/userRoom?publisherId='+userId,
    })
  },


  //切换tab
  switchTab: function(e) {
    var that = this;
    const current = e.detail.current;
    that.setData({
      titleClick: e.detail.current
    })
    const setDataObj = {}
    for (let i = 0; i < this.data.refreshing.length; i++) {
      if (i === current) {
        setDataObj[`refreshing[${i}]`] = true
      } else {
        setDataObj[`refreshing[${i}]`] = false
      }
    }
    for (let j = 0; j < this.data.refreshed.length; j++) {
      if (j !== current) {
        setDataObj[`refreshed[${j}]`] = true
      }
    }
    this.setData(setDataObj)
  },

  onLoad: function(parms) {
    var that = this;
    wx.getSystemInfo({ //微信小程序API-设备-系统信息
      success: function(res) { //接口调用成功
        var wHeight = res.windowHeight;
        that.setData({
          swiperHeight: wHeight - that.data.searchHeight, //设置Swiper的高度
        });
      }
    })
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

  getMyFollow: function(page) {
    var me = this;
    var serverUrl = app.serverUrl;
    var userId = app.getGlobalUserInfo().open_id;
    wx.showLoading({
      title: '正在获取信息...',
    })
    wx.request({
      url: serverUrl + '/video/observer?page=' + page + '&pageSize=6' + '&userId=' + userId,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res);
        wx.hideLoading();

        if (page == 1) {
          var followVideoList = [];
          me.setData({
            followVideoList: followVideoList
          })
        }

        var followList = res.data.data.rows;
        var newFollowList = me.data.followVideoList;
        newFollowList = newFollowList.concat(followList);

        me.setData({
          followVideoPage: page,
          followVideoList: newFollowList,
          followVideoTotal: res.data.data.total
        })

        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
  },

  //获取视频列表
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

  //请求数据
  loadData: function() {
    var page = this.data.page;
    this.getVideoList(page);
  },

  scrollToLower2: function(e) {
    var me = this;
    var currentPage = me.data.followVideoPage;
    var totalPage = me.data.followVideoTotal;
    //判断页数是否已经到达总页数
    if (currentPage == totalPage) {
      wx.showToast({
        title: '已经被你看完辣~~~',
        icon: "none"
      })
      return;
    }
    var page = currentPage + 1;
    // let _pageNo = this.data.pageNo + 1;
    // me.setData({
    //   pageNo: _pageNo
    // })
    me.getMyFollow(page)
  },

  /* 下拉刷新 */
  scrollToLower: function(e) {
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
  },

  /* 获取指定元素的css高度和宽度 */
  onShow: function(e) {
    var that = this;
    setTimeout(function(e) {
      //获得col的高
      const obj = wx.createSelectorQuery();
      obj.select('.title').boundingClientRect()
      obj.exec(function(rect) {
        that.setData({
          titleWidth: rect[0].width,
          titleHeight: rect[0].height,
        })
      });
    }, 500) //500ms延时需要，不然获取不到数据
  },

  goSearchPage: function(e) {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  //图片加载函数，更改外部api，换成适合的信息
  onImageLoad: function(e) { //在每个图片数据对象中修改数据，更换成可用信息
    //console.log(e.target.id);
    var index = e.target.id;
    var info = '';
    var temData = this.data.flowData;
  }
})

//这个例子返回了一个在指定值之间的随机整数。这个值比min大（如果min不是整数，那就不小于比min大的整数），但小于（但不等于）max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}