//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    detail_url:""
  },
  onLoad:function(res){
    this.setData({detail_url:res.url});
    console.log(res.url);
  }
})
