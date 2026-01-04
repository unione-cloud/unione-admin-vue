import moment from 'moment'

export default {
  data() {
    return {
      pagination: {
        current: 1,
        total: 0,
        defaultPageSize: 5,
        pageSize: 5,
        showTotal: (total) => `共 ${total} 条数据`,
        showSizeChanger: true,
        pageSizeOptions: ['3', '5', '10', '20', '40'],
        // eslint-disable-next-line no-return-assign
        onShowSizeChange: (current, pageSize) => (this.pageSize = pageSize)
      },
      loading: false,
      // 保存一个对象返回表单显示
      formData: {},
      // 保存搜索栏的数据
      searchData: {},
      // showtype  0显示表格  1显示添加、修改、查看页面
      showtype: 0,
      // type 按钮类型  1:添加 2:修改 3:查看
      type: null,
      // 存储数据
      listData: [],
      // 存储选中的key
      selectedRowKeys: [],
      // 存储选中的数据
      selectedRows: [],
      visible: false
    }
  },
  //方法集合
  methods: {
    moment,
    /**
     * @description: queryBtn 带条件查询
     * @param {Object} param 表单返回来的值
     */
    queryBtn(param) {
      this.pagination.current = 1
      if (param.queryTime && param.queryTime.length > 1) {
        Object.assign(param, {
          startTime: moment(param.queryTime[0]).format('YYYY-MM-DD 00:00:00'),
          endTime: moment(param.queryTime[1]).format('YYYY-MM-DD 23:59:59'),
          queryTime: undefined
        })
      }
      this.searchData = param
      this.doQuery()
    },

    /**
     * @description: emptyBtn 清空搜索栏并查询
     */
    emptyBtn() {
      this.searchData = {}
      this.pagination.current = 1
      this.doQuery()
    },
    // 返回
    returnBtn(is_query) {
      this.showtype = 0
      this.visible = false
      if (is_query) {
        this.doQuery()
      }
    },
    // 表格下一页
    handleTableChange(pagination) {
      this.pagination = pagination
      this.doQuery()
    },
    doQuery() {}
  },
  //监听属性
  computed: {
    rowSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: (record) => {
          return {
            props: {
              name: record.name
              // disabled: record.auditResult && record.auditResult != 1
            }
          }
        }
      }
    }
  }
}
