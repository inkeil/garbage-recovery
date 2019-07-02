//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  	blance:"",
  	list:[],
  	tag_type:0,
  	withdraw:1,
  	showTixian:false,
  	tixianCash:"",
    tixianName:"",
    tixianCard:"",
    tixianBank:"",
    cash_max_num:0,
    tixian_tips:""
  },
  onLoad: function () {
    wx.hideShareMenu();
    app.$request("user/profile/finance",{}).then(_d=>{
    	if(_d.code==1){
    		let _list = this.reviseListData(_d.data.list),
            _max_num = _d.data.blance;
        if(_max_num>20000){
          _max_num = 20000;
        }
    		this.setData({
    			blance:_d.data.blance,
    			list:_list,
    			all_list:_list,
    			withdraw:_d.data.withdraw||0,
          cash_max_num:_max_num
    		})
    	}
    }).catch(console.log);
    app.$request("order/transfer/limit").then(_d=>{
      if(_d.code==1){
        this.setData({
          tixian_tips:_d.data.state
        })
      }
    })
  },
  onShow:function(){

  },
  reviseListData:function(_l){
  	let _arr = [];
  	for(let i=0;i<_l.length;i++){
  		let newObj = {
  			id:_l[i].id,
  			money:_l[i].money,
  			type:_l[i].type,
  			create_time:_l[i].create_time,
  			is_title:""
  		};
  		if(_l[i].type=="inc"){
  			newObj.is_title = "出售废品";
  			newObj.money = "+"+newObj.money;
  			newObj.money_class = "orange";
  		}else{
  			newObj.is_title = "提现";
  			newObj.money = "-"+newObj.money;
  			newObj.money_class = "";
  		}
  		_arr[i] = newObj;
  	}
  	console.log(_arr);
  	return _arr;
  },
  changeList:function(ev){
  	let _type = ev.currentTarget.dataset.type,
  		_new_list = [];
  	if(_type==0){
  		_new_list = this.data.all_list;
  	}else if(_type==1){
  		_new_list = this.getNewList('inc');
  	}else{
  		_new_list = this.getNewList('dec');
  	}
  	this.setData({
  		tag_type:_type,
  		list:_new_list
  	})
  },
  getNewList:function(_tp){
	let _arr = [];
	for(let i=0;i<this.data.all_list.length;i++){
		if(this.data.all_list[i].type==_tp){
			_arr.push(this.data.all_list[i]);
		}
	}
	return _arr;
  },
  tixianFunc:function(ev){
  	let _blance = parseInt(Number(this.data.blance)*100);
  	if(_blance<=0){
		wx.showToast({
			title: '提现的金额不够哦!',
			icon: 'none',
			duration: 2000
		})
  	}else if(this.data.withdraw!=1){
  		wx.showToast({
			title:this.data.tixian_tips,
			icon: 'none',
			duration: 2000
		})
  	}else{
	  	this.setData({
	  		showTixian:true
	  	})
  	}
  },
  changeTixianCash:function(ev){
  	this.data.tixianCash = ev.detail.value;
  },
  changeTixianValue(ev){
    this.data[ev.currentTarget.dataset.name] = ev.detail.value;
  },
  cancelTixianFunc:function(ev){
  	this.setData({
  		showTixian:false
  	})
  },
  submitTixianFunc:function(ev){
  	let _tixianCash = Number(this.data.tixianCash),
        tixianName=this.data.tixianName,
        tixianCard=this.data.tixianCard,
        tixianBank=this.data.tixianBank;
  	if(isNaN(_tixianCash)||_tixianCash<=0){
  		this.toastShow("请输入正确的金额!");
  	}else{
  		_tixianCash = parseInt(_tixianCash*100)/100;
      app.$request("order/transfer/user",{
        money:_tixianCash,
        username:tixianName,
        card_no:tixianCard,
        bank:tixianBank
      }).then(_d=>{
        if(_d.code==1){
          this.toastShow(_d.msg,"success");
          this.setData({
            showTixian:false,
            withdraw:-1
          })
        }else{
          this.toastShow(_d.msg);
        }
      })
  		
  	}
  },
  toastShow:function(text){
  	wx.showToast({
  		title: text,
  		icon: 'none',
  		duration: 2000
  	})
  }
})
