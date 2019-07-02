//index.js
//获取应用实例
const app = getApp()
// 引用自定义地址选择
import { selectarea , getAreaText } from '../../utils/selectArea';

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showauth:false,
    showPage:0,
    showTitBar:false
  },
  onLoad:function(res){
    let _gUI = app.getSeting(),
        _t = this;
    _gUI.then(res=>{
      app.login(_t,res);
    }).catch(res=>{
      app.$getuserErr(_t);
    });
    this.initData();
    
    
  },
  onShow:function(res){
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
  initData:function(){
    this.setData({
      address:[],
      showList:false,
      showEdit:false,
      showSuccess:false,
      showSuccessState:false,
      showAllAddress:{
        state:false,
        text:"更多地址"
      },
      editAddressData:{
        edit_index:-1,
        add:[],
        name:"",
        phone:"",
        detailed:"",
        selected:true
      },
      showTitBar:false
    })
  },
  signCall:function(){
    let _t = this;
    const runAddress = (address_data)=>{
      if(address_data.length>0){
        address_data = this.addressSortFun(address_data);
        let _showSuccess = address_data[0];
        _showSuccess.edit_index = 0;
        this.setData({
          address:address_data,
          showList:true,
          showEdit:false,
          showSuccess:false,
          showTitBar:true
        })
      }else{
        this.setData({
          showList:false,
          showEdit:true,
          showSuccess:false,
          showTitBar:true
        });
      }
    },
    addressRequest = _areadata => {
      app.$request("user/profile/address",{},"GET").then(_d => {
        if(_d.code==1){
            // console.log(_d.data.list);
            let address_data = [];
            for(let i=0 , __d = _d.data.list;i<__d.length;i++){
              address_data[i] = {
                id:__d[i].id,
                name:__d[i].username,
                add:[__d[i].province_id, __d[i].city_id, __d[i].area_id],
                detailed:__d[i].address,
                phone:__d[i].mobile,
                allArea:__d[i].address_text,
                selected:(__d[i].is_default==0?false:true)
              }
            }
            runAddress(address_data);
        }
      }).catch(console.log);
    },
    isOrdersStatus = (areaData) => {
      app.$request("order/orders/status",{},"GET").then( (_d) => {
        if(_d.data.count>0){
          this.setData({
            order_sn:_d.data.order_sn,
            showList:false,
            showEdit:false,
            showSuccess:true,
            showSuccessState:true,
            showTitBar:false
          })
        }else{
          addressRequest(areaData);
        }
      })
    };

    // order/orders/status
    app.$getArea().then(_d=>{
      selectarea(_t,app,'lf');
      isOrdersStatus(_d);
    });
    

    
    
    
    
  },
  addressSortFun:function(_arr){
    let selected_data=null;
    for(let i=0;i<_arr.length;i++){
      if(_arr[i].selected==true){
        selected_data = _arr[i];
        _arr.splice(i, 1);
        break;
      }
    }
    if(selected_data){
      _arr.unshift(selected_data);
    }else{
      _arr[0].selected = true;
    }
    return _arr;
  },
  showMoreAddress:function(_t){
    if(this.data.address.length<1){return;}
    if(this.data.showAllAddress.state==true){
      this.setData({
        showAllAddress : {
          state:false,
          text:"更多地址"
        }
      });
    }else{
      this.setData({
        address:this.addressSortFun(this.data.address),
        showAllAddress : {
          state:true,
          text:"收起地址"
        }
      });
    }
    
  },
  changeDefaultAddress:function(_t){
    var _index = _t.target.dataset.numb,
        address_arr = this.data.address,
        cur_data = address_arr[_index];
    if(cur_data){
      for(let i=0;i<address_arr.length;i++){
        if(i==_index){
          address_arr[i].selected = true;
        }else{
           address_arr[i].selected = false;
        }
      }
      cur_data.edit_index = _index;
      console.log(cur_data);
      app.$request('user/profile/bindingAddress',{
        address:cur_data.detailed,
        address_text:cur_data.allArea,
        area_id:cur_data.add[2],
        city_id:cur_data.add[1],
        province_id:cur_data.add[0],
        id:cur_data.id,
        is_default:1,
        mobile:cur_data.phone,
        username:cur_data.name
      }).then(_d=>{
        if(_d.code==1){
          this.setData({
            address:address_arr,
            editAddressData:cur_data
          });
        }
      })
      
    }
  },
  onRegionChange:function(_arr){
    let _ead = this.data.editAddressData,
        _allText = "";
    for(let i=0;i<_arr.length;i++){
      _ead.add[i] = _arr[i].id;
      _allText += _arr[i].name;
    }
    _ead.allArea = _allText;
    this.setData({
      editAddressData:_ead
    })
  },
  editAddress:function(_t){
    let _index = parseInt(_t.target.dataset.numb),
        _address_data = {
          edit_index:-1,
          add:[],
          name:"",
          phone:"",
          detailed:"",
          selected:true
        };
    if(_index>=0&&_index<this.data.address.length){
      _address_data = this.data.address[_index];
      _address_data.edit_index = _index;
      selectarea(this,app,'lf',_address_data.add);
    }else{
      selectarea(this,app,'lf');
    }
      this.setData({
        editAddressData:_address_data,
        showList:false,
        showEdit:true,
        showSuccess:false,
      });
  },
  saveAddressData:function(){
    let _d = this.data.editAddressData;
    if(_d.name==""){
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none',
        duration: 2000
      })
    }else if(_d.phone==""){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
    }else if(isNaN(parseInt(_d.phone))){
      wx.showToast({
        title: '手机号码不正确',
        icon: 'none',
        duration: 2000
      })
    }else if(_d.add.length<2){
      wx.showToast({
        title: '请选择所在地区',
        icon: 'none',
        duration: 2000
      })
    }else if(_d.detailed==""){
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none',
        duration: 2000
      })
    }else{

      let reqData = {
        mobile:_d.phone,
        username:_d.name,
        address:_d.detailed,
        province_id:_d.add[0],
        city_id:_d.add[1],
        area_id:_d.add[2],
        is_default:(_d.selected?1:0),
        address_text:_d.allArea
      }
      if(_d.edit_index>=0){
        if(_d.id){
          reqData.id = _d.id;
        }else{
          wx.showToast({
            title: '找不到id的非法修改',
            icon: 'none',
            duration: 2000
          })
          return;
        }
      }
      
    
      app.$request("user/profile/bindingAddress",reqData).then(_data=>{
        if(_data.code==1){
          if(_d.selected){
            for(let i=0;i<this.data.address.length;i++){
              this.data.address[i].selected = false;
            }
          }
          if(_d.edit_index>=0){
            this.data.address[_d.edit_index] = _d;
          }else{
            _d.id = _data.data.id;
            this.data.address.unshift(_d);
          }
          this.setData({
            address:this.addressSortFun(this.data.address),
            showList:true,
            showEdit:false,
            showSuccess:false,
            showAllAddress : {
              state:false,
              text:"更多地址"
            }
          })
        }else{
          wx.showToast({
            title: _d.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(console.log);
    }
  },
  cancelAddressData:function(ev){
    this.setData({
      address:this.addressSortFun(this.data.address),
      showList:true,
      showEdit:false,
      showSuccess:false,
      showAllAddress : {
        state:false,
        text:"更多地址"
      }
    })
  },
  deleteAddress:function(ev){
    let _index = ev.currentTarget.dataset.numb,
        _t = this;
    if(_index>=0&&_index<_t.data.address.length){
      let _address_data = _t.data.address[_index];
      app.$request("user/profile/removeAddress",{id:_address_data.id}).then(_d=>{
        if(_d.code==1){
          let _newArr = _t.data.address;
          _newArr.splice(_index,1);
          _t.setData({
            address:_newArr
          })
        }else{
          wx.showToast({
            title: _d.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(console.log);

    }
    
  },
  contactBindInput:function(ev){
    this.data.editAddressData.name = ev.detail.value;
  },
  phoneBindInput:function(ev){
    this.data.editAddressData.phone = ev.detail.value;
  },
  addressDetailedBindInput:function(ev){
    this.data.editAddressData.detailed = ev.detail.value;
  },
  setingDefault:function(_t){
    this.data.editAddressData.selected = !_t.target.dataset.val;
    this.setData({
      editAddressData:this.data.editAddressData
    })
  },
  submitAddress:function(){
    let _address = this.getDefaultAddress();
    this.setData({
      order_sn:""
    });
    app.$request("order/orders/save",{address_id:_address.id}).then(_d=>{
      if(_d.code==1){
        let _orderSn = _d.data.order_sn;
        this.setData({
          order_sn:_orderSn,
          showList:false,
          showEdit:false,
          showSuccess:true,
          showSuccessState:true
        })
      }else{
        if(_d.code==1004){
          this.setData({
            order_sn:"",
            showList:false,
            showEdit:false,
            showSuccess:false,
            showSuccessState:true
          })
        }else{
          wx.showToast({
            title: _d.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    }).catch(console.log);
    
    
  },
  getDefaultAddress:function(){
    let _arr = this.data.address,
        selected_data=null;
    for(let i=0;i<_arr.length;i++){
      if(_arr[i].selected==true){
        selected_data = _arr[i];
        break;
      }
    }
    if(selected_data){
      return selected_data;
    }else{
      return _arr[0];
    }
  },
  backPreFunc:function(){
    if (getCurrentPages().length != 0) {
        //刷新当前页面的数据
        getCurrentPages()[getCurrentPages().length - 1].onLoad();
    }
  },
  gotoAllOrders:function(ev){
    wx.navigateTo({
      url:'../mycenter/wddd/index'
    })
  }

})
