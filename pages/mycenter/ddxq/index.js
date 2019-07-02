//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    star_arr:[2,2,2,2,2],
    pop_star_show:false,
    star_isid:null,
    orderData:null
  },
  onLoad: function (ev) {
    wx.hideShareMenu();
    let _detail_data = app.globalData.orderDetail;
    this.setData({
      orderData:app.globalData.orderDetail
    })
  },
  onShow:function(ev){
    if(!this.data.orderData){
      wx.navigateTo({
        url: '../wddd/index',
      });
      return;
    }
    let _od = this.data.orderData;
    if(_od.item){
      _od.item = this.restoreItemData(_od.item);
      this.setData({
        orderData:_od
      })
    }
    console.log(this.data.orderData);
  },
  onUnload:function(){
    app.globalData.orderDetail = null;
  },
  restoreItemData:function(_arr){
    let arr = _arr||[];
    for(let i=0;i<arr.length;i++){
      if(arr[i].level==2){
        arr[i].level_class = "you";
      }else if(arr[i].level==1){
        arr[i].level_class = "zhong";
      }else if(arr[i].level==0){
        arr[i].level_class = "lie";
      }
    }
    return arr;
  },
  callServicePhone:function(ev){
    let _phone_numb = ev.currentTarget.dataset.mobile;
    if(_phone_numb&&_phone_numb!=""){
      wx.makePhoneCall({
        phoneNumber: _phone_numb
      })
    }
  },
  showPopStarFunc:function(ev){
    let _id = ev.currentTarget.dataset.orderid;
    console.log(_id);
    this.setData({
      star_isid:_id,
      pop_star_show:true
    })

  },
  submitPingjia:function(ev){
    let _id = this.data.star_isid,
        _starnum = 0;
    for(let i=0 , arr = this.data.star_arr; i<arr.length; i++){
      if(arr[i]==1){
        _starnum+=1;
      }
    }
    console.log(_id,_starnum);
  },
  cancelPingjia:function(ev){
    this.setData({
      star_isid:null,
      pop_star_show:false
    })
  },
  starTouchStart:function(ev){

    let query = wx.createSelectorQuery(),
        _t = this,
        _c_arr = _t.data.star_arr;
    query.select('.select-bar').boundingClientRect(function (rect) {
        let _X = ev.touches[0].clientX - rect.left,
            _MAX = rect.width;
        if(_X<0){_X=0;}else if(_X>_MAX){_X=_MAX}
        let _bfb = Math.ceil(5*(_X/_MAX));

        for(let i=0;i<5;i++){
          if(i<_bfb){
            _c_arr[i] = 1;
          }else{
            _c_arr[i] = 2;
          }
        }
        _t.setData({
          star_arr:_c_arr
        })
    }).exec();
  },
  starTouchMove:function(ev){
    //创建节点选择器
    let query = wx.createSelectorQuery(),
        _t = this,
        _c_arr = _t.data.star_arr;
    //选择id
    query.select('.select-bar').boundingClientRect(function (rect) {
        let _X = ev.touches[0].clientX - rect.left,
            _MAX = rect.width;
        if(_X<0){_X=0;}else if(_X>_MAX){_X=_MAX}
        let _bfb = Math.round(5*(_X/_MAX));

        for(let i=0;i<5;i++){
          if(i<_bfb){
            _c_arr[i] = 1;
          }else{
            _c_arr[i] = 2;
          }
        }
        _t.setData({
          star_arr:_c_arr
        })
    }).exec();
  },
  gotoServicePage:function(ev){
    wx.navigateTo({
      url:"../service/index"
    })
  }
})
