//获取应用实例
const get_index = (_arr,id) => {
  let _num = 0;
  for(let i=0;i<_arr.length;i++){
    if(_arr[i].id==id){
      _num = i;
      break;
    }
  }
  return _num;
}
const getmultiArr = d => {
  let _arr = [];
  for(let i=0;i<d.length;i++){
    _arr[i] = [];
    for(let j=0;j<d[i].length;j++){
      _arr[i].push(d[i][j].name);
    }
  }
  return _arr;
}
const bindRegionChange = (ev,_t) => {
  // console.log('picker发送选择改变，携带值为', ev.detail.value)
  let _val = ev.detail.value;
  _t.setData({
    selectareaIndex: _val
  });
  if(_t.onRegionChange){
    let isOsa = _t.data.objectSelectareaArray;
    _t.onRegionChange([isOsa[0][_val[0]],isOsa[1][_val[1]],isOsa[2][_val[2]]]);
  }
}
const bindColumnChange = (ev,_t) => {
  if(ev.detail.column>1){return}
  let _osa = _t.data.objectSelectareaArray,
      changeCol = ev.detail.column+1,
      curId = _osa[ev.detail.column][ev.detail.value].id;

  _osa[changeCol] = _t.data.selectArea[changeCol][curId];
  if(ev.detail.column==0){
    let _id = _osa[1][0].id
    _osa[2] = _t.data.selectArea[2][_id];
  }
  _t.setData({
      selectareaArray:getmultiArr(_osa),
      objectSelectareaArray:_osa
    })
}
let $selectarea = (_t,app,zdy,idarr) => {
  _t.setData({
    selectareaArray:[],
    objectSelectareaArray:[],
    selectareaIndex:[],
    allArea:{}
  });
  _t.bindRegionChange = ev => {
    bindRegionChange(ev,_t)
  }
  _t.bindColumnChange = ev => {
    bindColumnChange(ev,_t)
  }
  let _idarr = null;
  if(Array.isArray(idarr)){
    _idarr = idarr;
  }
  app.$getArea().then(_d=>{
    let _area = zdy=='lf'?_d.lf:_d.all,
        _data_arr = [],
        _indexArr = [];
    if(_idarr){
      let _sid = _idarr[0],
          shiarr = _area[1][_sid],
          quarr = _area[2][_idarr[1]];
      _indexArr = [get_index(_area[0],_idarr[0]),get_index(shiarr,_idarr[1]),get_index(quarr,_idarr[2])];
      _data_arr = [_area[0],shiarr,quarr];
    }else{
      let _sid = _area[0][0].id,
          shiarr = _area[1][_sid],
          quarr = _area[2][shiarr[0].id];
      _indexArr = [];
      _data_arr = [_area[0],shiarr,quarr];
    }

    _t.setData({
      selectareaArray:getmultiArr(_data_arr),
      objectSelectareaArray:_data_arr,
      selectareaIndex:_indexArr,
      selectArea:_area
    })
  })
}
let $getAreaText = (pid,cid,aid,areadata) => {
  console.log(pid,cid,aid,areadata);
  return "好地方来好风光";
}

module.exports = {
  selectarea:$selectarea,
  getAreaText:$getAreaText
}
