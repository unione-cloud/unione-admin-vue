<!-- 审批管理 -->
<template>
  <div class="manage">
    <advanced-card>
      <advanced-search @onSearch="queryBtn" :config="searchConfig" />
    </advanced-card>
    <div class="list-table">
      <div class="btns">
        <a-button size="small" :disabled="selectedRowKeys.length <= 0"
          @click="toApproval(selectedRowKeys)">批量审批</a-button>
      </div>
      <div class="table">
        <a-table :columns="columns" :dataSource="listData" :pagination="pagination" :loading="loading"
          @change="handleTableChange" :rowKey="(record, index) => record.sid" :rowSelection="rowSelection"
          class="table-list" size="small">
          <template v-slot:operation="text, record">
            <!-- :disabled="record.auditResult && record.auditResult != 1" -->
            <a-button type="primary" size="small" @click="toApproval(record)"> 审批 </a-button>
          </template>
        </a-table>
      </div>
    </div>

    <a-drawer width="350px" :title="formData.sid ? '审批' : '批量审批'" placement="right" :visible="visible" @close="onClose">
      <div class="content">
        <a-form-model layout="vertical" :model="formData" :rules="rules" ref="approvalForm">
          <a-form-model-item label="审批说明" prop="auditOpinion">
            <a-textarea :rows="5" :maxLength="100" v-model="formData.auditOpinion" placeholder="请输入审批说明" />
          </a-form-model-item>

          <div style="text-align: right">
            <a-button type="primary" size="small" @click="onSubmit(2)"> 通过 </a-button>
            <a-button type="danger" size="small" style="margin-left: 10px" @click="onSubmit(3)"> 拒接 </a-button>
          </div>
        </a-form-model>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import AdvancedCard from '@/components/AdvancedCard/index.vue'
import AdvancedSearch from '@/components/AdvancedSearch/index.vue'
import Mixins from '@/views/approvalManage/mixins'
import { apiPermisToAudit, apiPermisDoAudit } from '@/api/doc-service'

export default {
  name: 'docApproval',
  mixins: [Mixins],
  components: { AdvancedCard, AdvancedSearch },
  data() {
    return {
      queryData: {},
      searchConfig: [
        {
          key: 'auditResult',
          type: 'z-dict-select',
          label: '审核结果',
          dictName: 'DOCFILEAUDITSTS',
        },
      ],
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          align: 'center',
          width: 70,
        },
        {
          title: '文件标题',
          dataIndex: 'fileTitle',
          align: 'center',
        },
        {
          title: '文件类型',
          dataIndex: 'fileType',
          align: 'center',
        },
        {
          title: '权限',
          dataIndex: 'list',
          align: 'center',
          customRender: (text) => {
            let a = text.split(',')
            return a.map((v) => {
              return <a-tag color="#2db7f5">{v == 'view' ? '预览' : '下载'}</a-tag>
            })
          },
        },
        {
          title: '权限拥有者标题',
          dataIndex: 'ownerTitle',
          align: 'center',
        },
        {
          title: '审核结果',
          dataIndex: 'auditResult',
          align: 'center',
          customRender: (text) => {
            switch (text) {
              case '1':
              case 1:
                return <a-tag color="#2db7f5">待审</a-tag>
              case '2':
              case 2:
                return <a-tag color="#0b8235">通过</a-tag>
              case '3':
              case 3:
                return <a-tag color="red">拒绝</a-tag>
              case '4':
              case 4:
                return <a-tag color="#1889f1">变更</a-tag>
              default:
                return ''
            }
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          scopedSlots: { customRender: 'operation' },
          width: 120,
        },
      ],
      rules: {
        auditOpinion: [{ required: true, message: '请填写审批说明', trigger: 'blur' }],
      },
      listData: [],
    }
  },
  //创建完成 访问当前this实例
  created() {
    this.doQuery()
  },
  //挂载完成 访问DOM元素
  mounted() { },
  //方法集合
  methods: {
    doQuery() {
      this.loading = true
      apiPermisToAudit({
        body: {
          ...this.searchData,
        },
        pageSize: this.pagination.pageSize,
        page: this.pagination.current,
      }).then((res) => {
        this.loading = false
        if (res.success) {
          res.body.map((v, i) => {
            Object.assign(v, {
              index: this.pagination.current
                ? (this.pagination.current - 1) * (this.pagination.pageSize ? this.pagination.pageSize : 10) + (i + 1)
                : i + 1,
            })
          })
          this.pagination.total = parseInt(res.total)
          this.listData = res.body
        } else {
          this.$message.error(res.message)
        }
      })
    },
    /** 审核 */
    toApproval(record) {
      // this.record
      this.visible = true
      this.formData = {
        auditOpinion: undefined,
      }
      if (Array.isArray(record)) {
        return false
      }
      this.formData = record
    },

    /** 提交审核结果
     * @param {Number} auditResult 1.待审 2.通过 3.拒绝
     */
    async onSubmit(auditResult) {
      this.$refs.approvalForm.validate((valid, values) => {
        if (valid) {
          let body = {
            auditOpinion: this.formData.auditOpinion,
            ids: this.formData.sid ? [this.formData.sid] : this.selectedRowKeys,
            auditResult,
          }
          // console.log(body)
          // return
          apiPermisDoAudit(body).then((res) => {
            if (res.success) {
              this.visible = false
              this.formData = {}
              this.$message.success('审批成功')
              this.doQuery()
            } else {
              this.$message.error(res.message)
            }
          })
        }
      })
    },

    onClose() {
      this.visible = false
    },
  },
}
</script>
<style lang='less' scoped>
.manage {
  padding: 15px;
}
</style>