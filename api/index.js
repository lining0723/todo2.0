import {
  http
} from '../utils/http';
const api = {
  login(params) { // 登录
    return http('getOpenid', params)
  },
  todoList(params) { // todo列表
    return http('todoList', params)
  },
  create(params) { // 新建todo
    return http('create', params)
  },
  update(params) { // 更新todo
    return http('update', params)
  },
  remove(params) { // 删除todo
    return http('remove', params)
  },
}

export default api