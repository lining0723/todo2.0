import Dialog from '../../vant/dialog/dialog';
Page({
  data: {
    addPopup: false, //新增弹框是否显示
    search: '', //搜索框输入
    keyboardHeight: 0, //键盘高度
    showComplete: true, //是否显示已完成
    plan: [],
    complete: [],
    addInput: '', //新增todo输入框
    focus: false, //新增todo是否获取焦点
    showSelLever: false, //新增 选择级别是否显示
    details: {}, //查看/编辑数据存储
    datetimePopup: false, //时间选择是否显示
    minDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'month') {
        return `${value}月`;
      } else if (type === 'day') {
        return `${value}日`;
      }
      return value
    },
    loading: false,
    idEdit: false,
    Prev: {}, //上一个新增的
  },
  onLoad: function () {
    var _this = this
    this.getList()
    this.calculateScrollViewHeight()
  },
  onShow() {
    wx.onKeyboardHeightChange(res => { //监听键盘高度变化
      // this.keyBoardChange(res.height)
      this.setData({
        keyboardHeight: res.height
      })
      // console.log(res)
    })
  },
  clearSearch() {
    this.data.search = ''
    this.getList()
  },
  getList() {
    wx.getOpenid(
      () => {
        wx.http.todoList().then((res) => {
          this.data.list = res.data
          this.updateData()
          console.log(res)
        })
      }
    )
  },
  //数据预处理,渲染
  updateData() {
    let data = this.data.list
    let plan = [],
      complete = [];
    for (let item of data) {
      if (item.status == 0) {
        plan.push(item)
      } else {
        complete.push(item)
      }
    }
    this.setData({
      plan: plan,
      complete: complete,
    })
  },
  //打开新增
  add() {
    this.setData({
      addPopup: true,
      Prev: {},
    })
  },
  //打开级别选择
  openLever() {
    this.setData({
      showSelLever: true
    })
  },
  //新增级别选择
  leverChange(e) {
    this.setData({
      'details.lever': e.detail,
    })
    setTimeout(() => {
      this.setData({
        showSelLever: false
      })
    }, 300)
  },
  //新增todo
  async addConfirm(e) {
    if (this.data.loading) return
    if (!this.data.addInput.trim()) {
      wx.showToast({
        icon: 'none',
        title: '请输入内容!',
      })
      return
    }
    if (!!this.data.details.endTime) {
      wx.requestSubscribeMessage({
        tmplIds: ['RScY5UEMogFbX3c5C5w9cvVJ8Qj8vDEmvpOjAV-O4HU'],
        success: (res) => {
          console.log(res)
        }
      })
    }
    let data = {
      content: this.data.addInput,
      status: 0,
      createTime: new Date(),
      lever: this.data.details.lever,
      endTime: this.data.details.endTime,
      remarks: ''
    }
    this.data.loading = true
    wx.http.create(data).then((res) => {
      console.log(res)
      this.data.Prev.todoId = res.data.id
      this.closePopup()
      this.setData({
        addInput: '',
        details: {},
      })
      this.getList()
      setTimeout(() => {
        this.data.loading = false
      }, 500)
    }, (fail) => {
      setTimeout(() => {
        this.data.loading = false
      }, 500)
    })
  },
  closePopup() {
    this.setData({
      addPopup: false,
      focus: false,
      addInput: '',
      details: {}
    })
  },
  //改变todo状态 1完成 0未完成
  checkChange(e) {
    let item = e.currentTarget.dataset.item
    let status = e.detail == true ? 1 : 0
    let id = item.id
    let list = status ? this.data.plan : this.data.complete
    for (let i in list) {
      if (id == list[i].id) {
        let str = `${status?'plan':'complete'}[${i}].status`
        this.setData({
          [str]: status
        })
        break
      }
      //this.updateData()   //数据预处理
    }
    let data = {
      id,
      status
    }
    wx.http.update(data).then((res) => {
      this.getList()
    })
  },
  //删除
  delTodo(e) {
    let id = e.currentTarget.dataset.item.id
    wx.http.remove({
      id
    }).then((res) => {
      this.getList()
    })
  },
  //显示隐藏已完成
  changeShow() {
    this.setData({
      showComplete: !this.data.showComplete,
    })
  },
  //全屏抽屉
  showModal(e) {
    let item = e.currentTarget.dataset.item
    item.createTimeStr = wx.formatTime(item.createTime, 'Y/M/D h:m:s')
    item.endTimeStr = wx.formatTime(item.endTime, 'M/D')
    this.setData({
      modalName: 'viewModal',
      details: item
    })
    this.data.isEdit = false
    this.data.isEditTime = false
  },
  //关闭抽屉,判断是否有改动,调用编辑
  hideModal(e) {
    if (this.data.isEdit && this.data.details.content) {
      let item = this.data.details
      wx.http.update(item).then((res) => {
        this.getList()
        this.setData({
          modalName: null,
          details: {}
        })
      })
    } else {
      this.setData({
        modalName: null,
        details: {}
      })
    }

  },
  //编辑todo
  editContent(e) {
    this.setData({
      'details.content': e.detail.value
    })
    if (!this.data.isEdit) {
      this.data.isEdit = true
    }
  },
  //打开时间选择
  selTime() {
    this.setData({
      datetimePopup: true
    })
  },
  //时间选择
  datetimeConfirm(e) {
    this.setData({
      'details.endTimeStr': wx.formatTime(e.detail, 'M/D'),
      'details.endTime': e.detail,
      datetimePopup: false
    })
    this.data.isEdit = true
    this.data.isEditTime = true
  },
  datetimeClose() {
    this.setData({
      datetimePopup: false
    })
  },
  //清空截止时间
  delEndTime() {
    this.setData({
      'details.endTime': '',
      'details.endTimeStr': '',
    })
    this.data.isEditTime = true
  },
  //编辑级别选择
  editLeverChange(e) {
    this.setData({
      'details.lever': e.detail,
    })
    if (!this.data.isEdit) {
      this.data.isEdit = true
    }
  },
  //编辑备注
  editRemarks(e) {
    this.setData({
      'details.remarks': e.detail.value
    })
    if (!this.data.isEdit) {
      this.data.isEdit = true
    }
  },
  calculateScrollViewHeight() {
    let that = this;
    let query = wx.createSelectorQuery().in(this)
    query.select('.top').boundingClientRect((res) => {
      that.setData({
        topHeight: res.height
      });
    }).exec()
  },
  //点击弹出版本号
  openDetails() {
    let str = '当前版本:' + wx.getAccountInfoSync().miniProgram.version
    Dialog.alert({
      title: str,
      message: '如有问题或建议请点击右上角•••里的反馈',
    })
  },
  onShareAppMessage() {
    var that = this;
    // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: "便捷的todo待办清单",
      path: '/pages/index/index',
      imageUrl: '../../images/share2.jpg', //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {}
    }
    return shareObj;
  },
})