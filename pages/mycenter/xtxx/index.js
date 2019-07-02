//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showauth:false,
    showPage:0,
    listData:[],
    showLoadmore:true,
    cpage:1,
    categoryId:6
  },
  onLoad:function(ev){
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
      this.signCall();
    }
  },
  signCall:function(){
    let _t = this;
    this.loadmoreDataFunc();
  },
  onReachBottom:function(){
    if(this.data.showLoadmore==true){
      this.loadmoreDataFunc();
    }
  },
  loadmoreDataFunc:function(){
    let _t = this;
    _t.setData({
      showLoadmore:false
    })
    app.$request("portal/lists/getCategoryPostLists",{category_id:_t.data.categoryId,page:_t.data.cpage},"GET").then(_d => {
      if(_d.code==1){
        let _bui = _d.data.img_public_baseurl,
            _bua = _d.data.arti_baseurl,
            _list = [];
        if(_d.data.list.length>0){
          for(let i=0;i<_d.data.list.length;i++){
            let _data = _d.data.list[i];
            _data.thumbnail = _bui+_data.thumbnail;
            _data.url = _bua+_data.id;
            _data.status_class = (_data.article_status=="进行中")?"is-state":"is-state_1";
            _list[i] = _data;
          }
          _list = _t.data.listData.concat(_list);
          _t.setData({
            listData:_list,
            cpage:_t.data.cpage+1,
            showLoadmore:true
          })
        }
      }
    }).catch(console.log);
  },
  gotodetail:function(ev){
    let _index = ev.currentTarget.dataset.num;
    console.log(this.data.listData[_index].url);
    wx.navigateTo({
      url:'../../subject/detail/index?url='+this.data.listData[_index].url
    })
  }
})
