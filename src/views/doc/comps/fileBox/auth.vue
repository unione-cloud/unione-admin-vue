<!-- 权限 -->
<template>
  <div class="auth_manage">
    <div class="tabs">
      <div class="tab" v-for="item in authTypes" :key="item.ownerType" @click="onTabs(item)"
        :class="[currentTab.ownerType == item.ownerType && 'active']">
        {{ item.label }}
      </div>
    </div>
    <div class="content">
      <div class="auth">
        <div class="title">
          <!-- {{ currentTab.label }} -->
          <div class="btn pirmaryBtn" v-if="!currentTab.isSelect" @click="add(currentTab)">添加</div>
          <div class="btn pirmaryBtn" v-if="currentTab.isSelect" @click="rem(currentTab)">移除</div>
          <!-- v-show="eValue.permis.filter((e) => e.ownerType == currentTab.ownerType).length > 0" -->
          <div class="btn pirmaryBtn" @click="onMore(currentTab)">
            {{ !currentTab.isSelect ? '更多' : '取消' }}
          </div>
        </div>
        <div class="list common-table">
          <a-table bordered :columns="currentTab.columns" :rowKey="(record, index) => record.key"
            :dataSource="eValue.permis.filter((e) => e.ownerType == currentTab.ownerType)" size="small" :rowSelection="currentTab.isSelect
              ? currentTab.ownerType == 'user'
                ? userSelection
                : currentTab.ownerType == 'role'
                  ? roleSelection
                  : orgSelection
              : null
              " :pagination="{
                pageSize: 5,
              }">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex == 'auth'">
                <unione-radio-box v-model:value="record.list" class="auth_box"
                  :convert="{ types: 'dict', dictName: 'DOCPERMISLIST' }"></unione-radio-box>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    <select-view v-model:value="openAuthSelect" @select="onSelect" :PactiveWindow="activeWindow"
      :inList="eValue.permis" />
  </div>
</template>

<script>
import SelectView from './selectView.vue'
import { USER_COLUMNS, ROLE_COLUMNS, ORG_COLUMNS } from './config'

export default {
  name: 'docAuth',
  components: { SelectView },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Object,
    },
    isPublic: {
      type: Boolean,
    },
    permis: {
      type: Array,
    },
  },
  data() {
    return {
      addVisible: false,
      eValue: this.value,
      authTypes: [
        { label: '用户权限', ownerType: 'user', columns: USER_COLUMNS, isSelect: false },
        { label: '角色权限', ownerType: 'role', columns: ROLE_COLUMNS, isSelect: false },
        { label: '机构权限', ownerType: 'organ', columns: ORG_COLUMNS, isSelect: false },
      ],
      /** 打开选择器集合 */
      openAuthSelect: [],
      activeWindow: null,
      selectedRows: {
        user: [],
        role: [],
        org: [],
      },
      /** 当前权限 */
      currentTab: {
        label: '用户权限',
        ownerType: 'user',
        columns: USER_COLUMNS,
        isSelect: false,
      },
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val) {
        this.eValue = {
          permis: [],
        }
        if (val && val.permis) {
          this.eValue = val
          if (this.eValue.permis) {
            this.eValue.permis.map((v) => {
              Object.assign(v, {
                key: v.id || v.key,
              })
            })
          }
        }
      },
    },
  },
  //创建完成 访问当前this实例
  created() { },
  //挂载完成 访问DOM元素
  mounted() { },
  //监听属性
  computed: {
    userSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows.user = selectedRows
        },
      }
    },
    roleSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows.role = selectedRows
        },
      }
    },
    orgSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows.org = selectedRows
        },
      }
    },
  },
  //方法集合
  methods: {
    onTabs(tab) {
      this.currentTab = tab
    },
    add(record) {
      let index = this.openAuthSelect.findIndex((e) => e.id == `${record.ownerType}_${this.eValue.id}`)
      if (index > -1) {
        this.activeWindow = `${record.ownerType}_${this.eValue.id}`
        return
      }
      this.activeWindow = `${record.ownerType}_${this.eValue.id}`
      this.openAuthSelect.push({
        ...record,
        id: `${record.ownerType}_${this.eValue.id}`,
        fileData: this.eValue,
      })
    },
    /** 移除 */
    rem(record) {
      let remList = this.selectedRows[record.ownerType]
      if (remList.length <= 0) {
        return false
      }
      this.eValue.permis = this.eValue.permis.filter((e) => !remList.map((v) => v.key).includes(e.key))
      this.$emit('change', this.eValue)
    },
    onMore(record) {
      Object.assign(record, {
        isSelect: !record.isSelect,
      })
    },

    onSelect(param) {
      let index = this.eValue.permis.findIndex((e) => e.ownerId == param.record.id)
      if (index > -1) {
        this.eValue.permis.splice(index, 1)
        this.$emit('change', this.eValue)
        return
      }

      let data = {
        ownerId: param.record.id,
        ownerType: param.target.name,
      }
      if (param.target.name == 'user') {
        data.ownerTitle = param.record.realName
        data.ownerName = param.record.username
      } else {
        data.ownerTitle = param.record.name
      }
      if (param.target.name == 'role') {
        data.ownerName = param.record.sn
      }

      let authData = {
        ...data,
        key: this.eValue.permis.length,
        fileId: this.eValue.id,
        fileName: this.eValue.fileName,
        fileTitle: this.eValue.name,
        fileType: this.eValue.fileType,
        list: 'view',
      }
      this.eValue.permis.unshift(authData)
      this.$emit('change', this.eValue)
    },
  },
}
</script>
<style lang='less' scoped>
.auth_manage {

  // padding: 10px;
  .tabs {
    .tab {
      display: inline-block;
      padding: 2px 8px;
      background: #f0f0f0;
      cursor: pointer;

      border-left: 1px #d9d9d9 solid;
      border-top: 1px #d9d9d9 solid;
      border-bottom: 1px #d9d9d9 solid;

      &:last-child {
        border-right: 1px #d9d9d9 solid;
      }

      &:first-child {
        border-left: none;
      }

      &.active {
        background: white;
        border-bottom: 1px white solid;
      }
    }
  }

  .content {
    padding: 10px;

    .auth {
      // padding: 10px 0;
      border-bottom: 1px #e8e8e8 solid;

      &:last-child {
        border: none;
      }

      .title {
        line-height: 28px;
        font-size: 14px;
        position: relative;
        font-weight: bold;
        overflow: hidden;

        .btn {
          display: inline-block;
          // position: absolute;
          float: right;
          // top: 0;
          // right: 0;
          width: 55px;
          text-align: center;
          margin-left: 10px;
          background: #f0f0f0;
          border: 1px #d9d9d9 solid;
          font-size: 14px;
          line-height: 22px;
          font-weight: 600;
          cursor: pointer;
        }
      }

      .list {
        margin-top: 5px;

        .auth_box {
          :deep(.ant-radio-wrapper) {
            margin-inline-end: 0;
          }
        }

      }
    }
  }
}
</style>