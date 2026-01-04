<!-- 高级搜索 -->
<template>
  <div class="Advanced">
    <div class="y-card-title">
      <div class="hl"></div>
      {{ title }}
    </div>
    <div class="Advancedbox">
      <a-form>
        <a-row :gutter="10">
          <a-col :span="6">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <a-input style="width: 100%" v-model:value="formData.name" placeholder="文件/文件夹名称"
                @keyup.enter="queryBtn" />
            </a-form-item>
          </a-col>
          <a-col :span="6" v-if="isFileType">
            <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
              <a-select style="width: 100%" v-model:value="formData.type" placeholder="文件类型" @change="changeSelect">
                <a-select-option v-for="item in fileTypes" :key="item.value" :value="item.value">{{
                  item.name
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <div style="float: left; overflow: hidden; margin: 0 5px">
            <a-form-item :wrapper-col="{ span: 24 }">
              <a-button class="searchBtn" style="width: 100%" @click="queryBtn">
                <template #icon>
                  <SearchOutlined />
                </template>
                查询
              </a-button>
            </a-form-item>
          </div>
          <div style="float: left; overflow: hidden; margin: 0 5px">
            <a-form-item :wrapper-col="{ span: 24 }">
              <a-button style="width: 100%" @click="handleReset">
                <template #icon>
                  <ClearOutlined />
                </template>
                清空</a-button>
            </a-form-item>
          </div>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<script>

export default {
  name: 'DocSearch',
  props: {
    /// 文件类型项 除了全部文件页面外其余页面不需有文件类型选项
    isFileType: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {},
      /** 文件类型 1.图片 2.视频 3.文档 4.音频 5.其他 */
      fileTypes: [
        { value: '0', name: '全部' },
        { value: '1', name: '图片' },
        { value: '2', name: '视频' },
        { value: '3', name: '文档' },
        { value: '4', name: '音频' },
        { value: '5', name: '其他' },
      ],
      title: '高级查询',
    }
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      handler(val) {
        // this.title = val.meta.title
      },
    },
  },
  methods: {
    changeSelect(key) {
      this.$nextTick(() => {
        this.queryBtn()
      })
    },
    queryBtn() {
      this.$emit('queryBtn', this.formData)
    },
    /**
     * [handleReset 清空搜索栏]
     */
    handleReset() {
      this.formData = {}
      this.$emit('onHandleReset', this.formData)
    },
  },
}
</script>
<style lang='less' scoped>
.Advanced {
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 0 10px #c5c5c5;
  background: white;
  border-radius: 5px;
  padding: 10px 20px;

  .y-card-title {
    font-size: 18px;
    font-weight: bold;
    line-height: 32px;
    position: relative;
    padding-left: 15px;
    padding-bottom: 7px;
    border-bottom: 1px #ededed solid;
    overflow: hidden;

    .hl {
      width: 5px;
      display: inline-block;
      background: #1889f1;
      height: 23px;
      position: absolute;
      top: 5px;
      left: 0;
      border-radius: 20px;
    }
  }

  .Advancedbox {
    margin-top: 10px;
  }
}
</style>
