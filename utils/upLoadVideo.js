function upLoadVideo(obj) {
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
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            "&tempheight=" + tempheight +
            "&tempwidth=" + tempwidth +
            "&tempVideoPath=" + tempVideoPath +
            "&tempCoverPath=" + tempCoverPath,
        })
      }
    }
  })
}

module.exports = {
  upLoadVideo: upLoadVideo
}