//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    star_arr:[2,2,2,2,2],
    pop_star_show:false,
    star_isid:null,
    orderData:[],
    order_status:'all'
  },
  onLoad: function (ev) {
    wx.hideShareMenu();
    this.loadOrder();
  },
  loadOrder:function(){
    let _t = this,
        dataFilter = (_list)=>{
          let _status = this.data.order_status;
          if(_status=='all'){
            return _list;
          }else{
            let _arr = [];
            for(let i=0;i<_list.length;i++){
              if(_status==1){
                if(_list[i].status==1||_list[i].status==2){
                  _arr.push(_list[i]);
                }
              }else{
                if(_list[i].status==_status){
                  _arr.push(_list[i]);
                }
              }
            }
            return _arr;
          }
        };
    app.$request("order/orders/my").then(_d=>{
      if(_d.code==1){
        let _list = dataFilter(_d.data.lists);
        
        _t.setData({
          orderData:_t.replaceOrderData(_list)
        })
        console.log(_t.data.orderData);
      }
    }).catch(console.log);
  },
  replaceOrderData:function(_arr){
    // console.log(_arr);
    let _t = this , arr = _arr;
    for(let i=0;i<arr.length;i++){
      let state_text = _t.orderStateText(arr[i].status);
      // console.log(arr[i]);
      arr[i].state_text = state_text[0];
      arr[i].note = state_text[1];
      if(arr[i].item&&arr[i].item.length>0){
        arr[i].res_total = _t.orderResTotal(arr[i].item);
      }

      if(arr[i].is_vote>=0){
        arr[i].is_vote_star = [];
        for(let _i=0;_i<5;_i++){
          if(arr[i].is_vote<=_i){
             arr[i].is_vote_star[_i] = 2;
          }else{
            arr[i].is_vote_star[_i] = 1;
          }
        }
      }
    }
    return arr;
  },
  orderStateText:function(_s){
    // 待接单 0   待收购 1   关闭 -1  完成 3 
    if(_s==3){
      return ["完成",null]
    }else if(_s==0){
      return ["等待接单","收购商还未接单..."]
    }else if(_s==1||_s==2){
      return ["已接单","收购员在路上..."]
    }else if(_s==-1){
      return ["交易关闭","已放弃"]
    }
  },
  orderResTotal:function(_arr){
    let arr = _arr,
        price = 0,
        _num = 0;
    for(let i=0;i<arr.length;i++){
      let _p = parseFloat(arr[i].market_price*arr[i].num),
          _n = parseInt(arr[i].num);
      if(!isNaN(_p)){
        price += _p;
      }
      if(!isNaN(_n)){
        _num += _n;
      }
    }
    return {total:_num,_p:price.toFixed(2)};
  },
  filterOrderFunc:function(ev){
    let _status = ev.currentTarget.dataset.status;
    this.setData({
      order_status:_status
    })
    this.loadOrder();
  },
  gotoDdxq:function(ev){
    let _id = ev.currentTarget.dataset.isid,
        _data = this.getOrderDetail(_id);
    if(_data){
      app.globalData.orderDetail = _data;
      wx.navigateTo({
        url:"../ddxq/index"
      })
    }
    
  },
  showPopStarFunc:function(ev){
    let _id = ev.currentTarget.dataset.orderid,
        _index = ev.currentTarget.dataset.index;
    this.setData({
      star_isid:_id,
      pop_star_show:true,
      star_index:_index,
      star_arr:[2,2,2,2,2]
    })

  },
  submitPingjia:function(ev){
    let _id = this.data.star_isid,
        _index = this.data.star_index,
        _starnum = 0;
    for(let i=0 , arr = this.data.star_arr; i<arr.length; i++){
      if(arr[i]==1){
        _starnum+=1;
      }
    }
    app.$request("order/orders/vote",{id:_id,vote:_starnum}).then(_d=>{
      if(_d.code==1){
        let _list = this.data.orderData;
        _list[_index].is_vote = _starnum;
         _list[_index].is_vote_star = this.getStartNumbArr(_list[_index]);
         this.setData({
          orderData:_list
        })
        this.toastShow("评价成功","success");
        this.cancelPingjia();
      }else{
        this.toastShow(_d.msg);
      }
    });
  },
  getStartNumbArr:function(arr){
    let _arr = [];
    for(let _i=0;_i<5;_i++){
      if(arr.is_vote<=_i){
         _arr[_i] = 2;
      }else{
        _arr[_i] = 1;
      }
    }
    return _arr;
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
  deleteOrderFunc:function(ev){
    let _id = ev.currentTarget.dataset.orderid,
        removeListData = isid=>{
          let _list=this.data.orderData;
          for(let i=0;i<_list.length;i++){
            if(_list[i].id==isid){
              _list.splice(i,1);
              break;
            }
          }
          this.setData({
            orderData:_list
          })
        };
    if(_id&&_id!=""){
      app.$request("order/orders/remove",{id:_id}).then(_d=>{
        if(_d.code==1){
          this.toastShow("删除成功！","success");
          setTimeout(()=>{removeListData(_id);},1500);
        }else{
          this.toastShow(_d.msg);
        }
      })
    }

  },
  fqOrderFunc(ev){
    let _t = this ,
        _id = ev.currentTarget.dataset.isid,
        changeListData = isid=>{
          let _list=_t.data.orderData;
          for(let i=0;i<_list.length;i++){
            if(_list[i].id==isid){
              _list[i].status = -1;
              break;
            }
          }
          _t.setData({
            orderData:_t.replaceOrderData(_list)
          })
        },
        requestGiveup = ()=>{
          app.$request("order/orders/giveup",{id:_id}).then(_d=>{
            if(_d.code==1){
              changeListData(_id);
            }else{
              _t.toastShow(_d.msg);
            }
          })
        };
    if(_id&&_id!=""){
      _t.modalShow({
        _c:'确认要放弃吗？',
        _cb:res=>{
          if(res.confirm){
            requestGiveup()
          }
        }
      })
    }
  },
  callPhoneFunc:function(ev){
    let _phone_numb = parseInt(ev.currentTarget.dataset.mobile);
    if(isNaN(_phone_numb)){return;}else{
      _phone_numb = String(_phone_numb);
    }
    wx.makePhoneCall({
      phoneNumber: _phone_numb
    })

  },
  getOrderDetail:function(_id){
    for(let i=0 , _arr=this.data.orderData;i<_arr.length;i++){
      if(_arr[i].id==_id){
        return _arr[i];
      }
    }
    return null;
  },
  gotoServicePage:function(ev){
    wx.navigateTo({
      url:"../service/index"
    })
  },
  toastShow:function(text,_icon){
    wx.showToast({
      title: text,
      icon: _icon||"none",
      duration: 2000
    })
  },
  modalShow(obj){
    let _tit = obj._t||'提示',
        _con = obj._c||'',
        _cb = obj._cb||(res=>{});
    wx.showModal({
      title: _tit,
      content: _con,
      success(res) {
        _cb(res);
      }
    })
  }
})
