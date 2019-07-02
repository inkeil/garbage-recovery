//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showauth:false,
    showPage:0
  },
  onLoad:function(ev){
    wx.hideShareMenu();
    let _gUI = app.getSeting(),
        _t = this;
    _gUI.then(res=>{
      app.login(_t,res);
    }).catch(res=>{
      app.$getuserErr(_t);
    });
  },
  onShow:function(ev){
    let _siteInfo = wx.getStorageSync('siteInfo');
    if(_siteInfo&&this.data.showauth){
      this.setData({
        showauth:false
      })
      // console.log(this.wxuserinfo);
      this.signCall();
    }
    if(this.data.showPage>0){
      this.backPreFunc();
    }
  },
  signCall:function(){
    app.$request("home/index/user_ranking").then(_d=>{
      if(_d.code==1){
        this.setData({
          pageData:this.reformPagedata(_d.data)
        })
        // console.log(_d.data);
      }
    })
    let _siteInfo = wx.getStorageSync('siteInfo');
    this.setData({
      wxuserinfo:_siteInfo.wxuserinfo
    })
    this.showPages();
  },
  reformPagedata(_d){
    let _list = _d.user_rank,
        _mp = _d.my_profile;
    for(let i=0;i<_list.length;i++){
      if(_mp>_list[i].total_money){
        _list[i].rank_text = "比第"+_list[i].rank+"名多：¥"+(_mp-_list[i].total_money).toFixed(2)+"元";
      }else{
        _list[i].rank_text = "比第"+_list[i].rank+"名少：¥"+(_list[i].total_money-_mp).toFixed(2)+"元";
      }
    }
    _d.user_rank = _list;
    return _d;
  },
  showPages:function(){
    this.setData({
      isPageShow:true
    })
  },
  backPreFunc:function(){
    if (getCurrentPages().length != 0) {
        //刷新当前页面的数据
        getCurrentPages()[getCurrentPages().length - 1].onLoad();
    }
  }
})
