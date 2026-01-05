<!-- 选择列表 -->
<template>
  <div class="slot_content">
    <div class="keyword">
      <a-input-search placeholder="输入关键字" @search="onSearch" />
    </div>
    <a-spin :spinning="spinning">
      <div class="list scrollBar" id="user-list-box">
        <div class="item" v-for="item in listData" :key="item.id">
          <div class="title" :title="item.label">
            {{ item.label }}
          </div>
          <div class="btn" @click="onSelect(item)">
            <a-button :type="inList.findIndex((e) => e.ownerId == item.id) > -1 ? 'danger' : 'primary'" size="small">
              {{inList.findIndex((e) => e.ownerId == item.id) > -1 ? '移除' : '选择'}}
            </a-button>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>

import { useSession } from 'unione-base-vue';
import { systemSysUserFind, systemSysRoleFind, systemSysOrgFind } from '../../api'

export default {
  components: {},
  props: {
    ownerType: {
      type: String,
    },
    inList: { type: Array, default: () => [] },
  },
  data() {
    return {
      listData: [],
      keywords: '',
      spinning: false,
      total: 0,
      page: 1,
    }
  },
  watch: {
    ownerType: {
      immediate: true,
      handler() {
        this.doQuery()
      },
    },
    total: {
      immediate: true,
      handler(val) {
        this.initScroll()
      },
    },
  },
  setup() {
    const session = useSession()

    return {
      session,
    }
  },
  //创建完成 访问当前this实例
  created() { },
  //挂载完成 访问DOM元素
  mounted() { },
  //方法集合
  methods: {
    async doQuery(page) {
      let data = {}
      let param = {
        body: {},
        page: this.page,
        pageSize: 10,
        keywords: this.keywords
      }
      this.spinning = true
      if (this.ownerType == 'user') {
        data = await systemSysUserFind(param)
        const principal = this.session.getPrincipal()
        data.body = data.body.filter((v) => v.id != principal.id)
      } else if (this.ownerType == 'role') {
        data = await systemSysRoleFind(param)
      } else if (this.ownerType == 'organ') {
        data = await systemSysOrgFind(param)
      }
      this.spinning = false
      if (data.success) {
        this.handlerList(data.body)
        this.total = (data.total && parseInt(data.total)) || 0
      } else {
        this.$message.error(data.message)
      }
    },
    /** 处理用户数据 */
    handlerList(listData) {
      if (this.ownerType == 'user') {
        listData.map((v) => {
          Object.assign(v, {
            label: v.realName,
          })
        })
      } else {
        listData.map((v) => {
          Object.assign(v, {
            label: v.name,
          })
        })
      }

      this.$nextTick(() => {
        if (this.page != 1) {
          this.listData.push(...listData)
        } else {
          this.listData = listData
        }
      })
    },
    onSelect(record) {
      this.$emit('select', record)
    },
    onSearch(e) {
      this.keywords = e
      this.page = 1
      this.doQuery()
    },

    /** 设置滚动事件 */
    initScroll() {
      if (this.listData.length >= this.total) {
        return false
      }
      let scrollHeight = document.getElementById('user-list-box').scrollHeight
      let scrollTop = document.getElementById('user-list-box').scrollTop
      let clientHeight = document.getElementById('user-list-box').clientHeight

      if (clientHeight + scrollTop >= scrollHeight || this.listData.length < this.total) {
        this.page += 1
        this.doQuery(this.page)
      }
      document.getElementById('user-list-box').addEventListener('scroll', (event) => {
        let scrollHeight = document.getElementById('user-list-box').scrollHeight
        let scrollTop = document.getElementById('user-list-box').scrollTop
        let clientHeight = document.getElementById('user-list-box').clientHeight
        if (this.listData.length >= this.total) {
          return false
        }
        if (clientHeight + scrollTop >= scrollHeight) {
          this.page += 1
          this.doQuery(this.page)
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
.slot_content {
  background: white;
  height: 100%;
  border: 1px #e8e8e8 solid;
  padding: 3px;
  overflow: hidden;

  .list {
    margin-top: 5px;
    padding-top: 5px;
    height: 270px;
    overflow-y: auto;

    .item {
      overflow: hidden;
      border-bottom: 1px solid #e8e8e8;
      padding-bottom: 5px;

      .title {
        width: calc(100% - 50px);
        float: left;
        font-size: 14px;
        padding-right: 5px;
        line-height: 30px;
        padding-left: 5px;

        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .btn {
        width: 50px;
        float: right;
        margin-top: 6px;
      }
    }
  }
}
</style>