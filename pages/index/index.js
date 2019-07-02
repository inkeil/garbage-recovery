//index.js
//获取应用实例
const app = getApp();
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    focusData:[],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    circular:true,
    showauth:false,
    monthrank:null,
    buyprice:[],
    allbuyprice:[],
    showPage:0
    
  },
  onLoad:function(res){
    wx.showShareMenu();
    let _gUI = app.getSeting(),
        _t = this;
    _gUI.then(res=>{
      app.login(_t,res);
    }).catch(res=>{
      app.$getuserErr(_t);
    });
  },
  onShow:function(){
    let _siteInfo = wx.getStorageSync('siteInfo');
    if(_siteInfo&&this.data.showauth){
      this.setData({
        showauth:false
      })
      this.signCall();
    }
    if(this.data.showPage>0){
      this.backPreFunc();
    }
  },
  signCall:function(){
    let _t = this;
    
    
    wx.getLocation( {
      type: 'wgs84',
      success: function( res ) {
        app.$request("/home/index/set_location",{
            longitude: res.longitude,
            attitude: res.latitude
        }).then(_d=>{
          pageAjaxDataFunc({
              longitude: res.longitude,
              latitude: res.latitude
          })
        }).catch(()=>{
          pageAjaxDataFunc();
        });
      },
      fail:function(){
        pageAjaxDataFunc();
      }
    })
    function pageAjaxDataFunc(point){
      point = point||'';
      app.$request("/portal/lists/user_get_article",point,"GET").then(_d => {
        if(_d.code==1){
          let _arr = [];
          for(let i=0;i<_d.data.list.length;i++){
            _arr[i] = {
              imgUrls:_d.data.list[i].thumbnail,
              linkUrl:_d.data.list[i].url,
              id:_d.data.list[i].id
            }
          }
          _t.setData({
            focusData:_arr
          })
        }
      }).catch(console.log);
      app.$request("home/index/user_data",point).then(_d => {
        // console.log(_d);
        if(_d.code==1){
          let _monthrank = {
            area:_d.data.address,
            user_rank:[],
            my_profile:_d.data.my_profile
          },
          _len = (_d.data.user_rank.length<6?_d.data.user_rank.length:5),
          _NoArr = ["","第一名","第二名","第三名","第四名","第五名"];
          for(let i=0;i<_len;i++){
            _monthrank.user_rank[i] = {
              avatar:_d.data.user_rank[i].avatar,
              rank:_d.data.user_rank[i].rank,
              user_nickname:_d.data.user_rank[i].user_nickname,
              total_money:_d.data.user_rank[i].total_money,
              No:_NoArr[_d.data.user_rank[i].rank]
            }
          }
          _t.setData({
            monthrank:_monthrank
          })
        }
      }).catch(console.log);
      app.$request("waste/index/list",point).then(_d => {
        if(_d.code==1){
          _t.setData({
            buyprice:_d.data.list,
            allbuyprice:_d.data.list
          })
        }
      }).catch(console.log);
    }
    
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh()
    this.backPreFunc();
  },
  getLocation:function(){
    wx.getLocation({
     type: 'wgs84',
     success (res) {
       const latitude = res.latitude
       const longitude = res.longitude
       const speed = res.speed
       const accuracy = res.accuracy
       console.log(res);
     }
    })
  },
  gotoDetail:function(_t){
    var _id = _t.target.dataset.item.id,
        _url = _t.target.dataset.item.linkUrl;
        
    wx.navigateTo({
      url:"/pages/subject/detail/index?url="+_url+"&id="+_id
    })
  },
  gotoPaihangPage(){
    wx.navigateTo({
      url:"/pages/wdpaihang/index"
    })
  },
  bindKeyInput:function(ev){
    let val = ev.detail.value,
        newarr = [];
    if(val!=""){
      for(let i=0;i<this.data.allbuyprice.length;i++){
        if(this.data.allbuyprice[i].waste_name.indexOf(val)>-1){
          newarr.push(this.data.allbuyprice[i]);
        }
      }
    }else{
      newarr = this.data.allbuyprice;
    }
    this.setData({
      buyprice:newarr
    })
  },
  backPreFunc:function(){
    if (getCurrentPages().length != 0) {
        //刷新当前页面的数据
        getCurrentPages()[getCurrentPages().length - 1].onLoad();
    }
  }
  
})
