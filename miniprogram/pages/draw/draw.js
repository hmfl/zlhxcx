Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    canvasWidth:'600',
    canvasHeight: 0,
    boldVal:5,
    colors: ['black', 'pink', 'red', 'skyblue', 'greenyellow', '#00FF00', '#0000FF', '#FF00FF','#00FFFF',
      '#FFFF00', '#70DB93', '#5C3317 ', '#9F5F9F', '#B5A642', '#FF7F00','#42426F'],
    curColor:'#000000',
    isEraser:false,
    isSuc:true,
    isTap:true,
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.context = wx.createCanvasContext('canvas');
    this.setData({ canvasHeight: this.data.canvasWidth})
    this.isMouseDown=false
    this.lastLoc={ x: 0, y: 0 }
    this.lastTimestamp = 0;
    this.lastLineWidth = -1;
    this.drawBgColor();
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.setData({context: });
  },
  drawBgColor(){
    this.context.save();
    this.context.setFillStyle('#ffffff');
    this.context.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.context.restore();
    this.context.draw({
      reserve: true
    })
  },
  changeBold:function(e){
    this.setData({boldVal: e.detail.value})
  },
  selectColor:function(e){
    this.setData({ curColor: e.currentTarget.dataset.value })
    this.setData({ isEraser: false })
  },
  beginStroke(event) {
      this.isMouseDown = true
      this.lastLoc = { x: event.touches[0].x, y: event.touches[0].y }
      this.lastTimestamp = event.timeStamp;
      this.setData({ isTap: true })
      // //draw
      this.context.arc(this.lastLoc.x, this.lastLoc.y, this.data.boldVal / 2, 0, 2 * Math.PI)
      this.context.setFillStyle(this.data.curColor);
      this.context.fill();
      wx.drawCanvas({
        canvasId: 'canvas',
        reserve: true,
        actions: this.context.getActions() // 获取绘图动作数组
      })
 
      // if (event.touches.length>1){
      //   var xMove = event.touches[1].x - event.touches[0].x;
      //   var yMove = event.touches[1].y - event.touches[0].y;
      //   this.lastDistance = Math.sqrt(xMove * xMove + yMove * yMove);
 
      // }
     
  },
 
  endStroke(event) {
    // console.log(this.data.isTap)
    // if (this.data.isTap){
    //   this.lastLoc = { x: event.changedTouches[0].x, y: event.changedTouches[0].y }
    //   this.lastTimestamp = event.timeStamp;
    //   //draw
    //   this.context.arc(this.lastLoc.x, this.lastLoc.y, this.data.boldVal / 2, 0, 2 * Math.PI)
    //   this.context.setFillStyle(this.data.curColor);
    //   this.context.fill();
    //   wx.drawCanvas({
    //     canvasId: 'canvas',
    //     reserve: true,
    //     actions: this.context.getActions() // 获取绘图动作数组
    //   })
 
    // }
    this.isMouseDown= false
  },
 
  moveStroke(event) {
    if (this.isMouseDown && event.touches.length == 1) {
      var touch = event.touches[0];
      var context = this.context;
      var curLoc = { x: touch.x, y: touch.y };
      var curTimestamp = event.timeStamp;
      var s = this.calcDistance(curLoc, this.lastLoc)
      var t = curTimestamp - this.lastTimestamp;
      var lineWidth = this.calcLineWidth(t, s)
      //draw
   
      context.setStrokeStyle(this.data.curColor);
      context.setLineWidth(lineWidth);
      context.beginPath()
      context.moveTo(this.lastLoc.x, this.lastLoc.y)
      context.lineTo(curLoc.x, curLoc.y)
 
      // locHistory.push({ x: curLoc.x, y: curLoc.y, with: lineWidth, t: t })
 
 
      context.setLineCap("round")
      context.setLineJoin("round")
      context.stroke();
  
      this.lastLoc=curLoc;
      // this.setData({ lastTimestamp: curTimestamp })
      // this.setData({ lastLineWidth: lineWidth })
 
      wx.drawCanvas({
        canvasId: 'canvas',
        reserve: true,
        actions: this.context.getActions() // 获取绘图动作数组
      })
    
    } else if (event.touches.length > 1){
      this.setData({isTap:false})
 
      var xMove = event.touches[1].x - event.touches[0].x;
      var yMove = event.touches[1].y - event.touches[0].y;
      var newdistance = Math.sqrt(xMove*xMove + yMove*yMove);
      // if (newdistance - this.lastDistance>0){
      //   this.setData({ canvasWidth: this.data.canvasWidth * 1.2 })
      //   this.setData({ canvasHeight: this.data.canvasHeight * 1.2 })
      // }else{
      //   this.setData({ canvasWidth: this.data.canvasWidth * 0.8 })
      //   this.setData({ canvasHeight: this.data.canvasHeight * 0.8})
      // }
 
    }
  },
  calcLineWidth(t, s){
    var v = s / t;
    var resultLineWidth = this.data.boldVal;
    if(v <= 0.1) {
      resultLineWidth = resultLineWidth * 1.2;
    }else if(v >= 10) {
      resultLineWidth = resultLineWidth/1.2
    }else{
      resultLineWidth = resultLineWidth - (v - 0.1) / (10 - 0.1) * (resultLineWidth * 1.2 - resultLineWidth / 1.2)
    }
    return resultLineWidth
  },
 calcDistance(loc1, loc2) {
    return Math.sqrt((loc1.x - loc2.x) * (loc1.x - loc2.x) + (loc1.y - loc2.y) * (loc1.y - loc2.y))
  },
 clearCanvas:function(){
   this.drawBgColor()
   this.setData({ isEraser:false})
  },
 eraser:function () {
   this.setData({ isEraser: !this.data.isEraser})
   this.setData({ curColor:'#ffffff'})
  // this.context.clearActions();
  // this.context.draw()
 },
 saveImg:function(){
   var that = this;
   var keys = wx.getStorageSync('myImg') || [];
   console.log(that.data.keyLength)
   wx.canvasToTempFilePath({
     canvasId: 'canvas',
     success: function (response) {
      console.log(response.tempFilePath)
       keys.unshift(response.tempFilePath)
       wx.setStorage({
         key: 'myImg',
         data: keys,
       })
       wx.saveImageToPhotosAlbum({
        filePath: response.tempFilePath,
        success(res) {
          console.log(99999);
         },
         fail: () => {
          wx.getSetting({
            success: res => {
              let authSetting = res.authSetting
              if (!authSetting['scope.writePhotosAlbum']) {
                wx.showModal({
                  title: '提示',
                  content: '您未开启保存图片到相册的权限，请点击确定去开启权限！',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting()
                    }
                  }
                })
              }
            }
          })

        }

      })
       that.setData({ isSuc: false })
      //  setTimeout(function () {
      //    that.setData({ isSuc: true })
      //    wx.navigateTo({
      //      url: '../index/index',
      //    })
      //  }, 1000)
      
     }
   })
 }
})