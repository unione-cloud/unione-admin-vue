<!-- 权限目标选择 -->
<template>
  <div>
    <template v-for="(item, index) in eValue" :key="item.id">
      <custom-window :isActive="activeWindow == item.id" :id="item.id" :name="item.ownerType" :width="350" :height="450"
        :title="toTitle(item)" @confirm="confirm" @close="confirm" :elIndex="index" @active="onActive">
        <template v-slot:content>
          <select-list :ownerType="item.ownerType" @select="(e) => onSelect(e, { name: item.ownerType, id: item.id })"
            :inList="inList" />
        </template>
      </custom-window>
    </template>
  </div>
</template>

<script>
import CustomWindow from '../customWindow/index.vue'
import SelectList from './selectList.vue'

export default {
  components: { CustomWindow, SelectList },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Array,
    },
    PactiveWindow: {
      type: String,
    },
    /** 存在的目标 */
    inList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      title: null,
      eValue: this.value,
      activeWindow: null,
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.eValue = val
        } else {
          this.listData = []
          this.eValue = []
        }
      },
    },
    PactiveWindow: {
      immediate: true,
      handler(val) {
        if (val) {
          this.activeWindow = val
        }
      },
    },
  },
  //创建完成 访问当前this实例
  created() { },
  //挂载完成 访问DOM元素
  mounted() { },
  //方法集合
  methods: {
    onSelect(record, target) {
      this.$emit('select', { record, target })
      // this.confirm(target)
    },
    confirm(target) {
      let index = this.eValue.findIndex((e) => e.id == target.id)
      if (index > -1) {
        this.eValue.splice(index, 1)
        this.$emit('change', this.eValue)
      }
    },
    toTitle(record) {
      switch (record.ownerType) {
        case 'user':
          return (record.fileData.name ? `${record.fileData.name}的` : '') + '用户权限'
        case 'role':
          return (record.fileData.name ? `${record.fileData.name}的` : '') + '角色权限'
        case 'organ':
          return (record.fileData.name ? `${record.fileData.name}的` : '') + '机构权限'
      }
    },

    /** 激活回调 */
    onActive(target) {
      this.activeWindow = target.id
      // this.$emit('')
    },
  },
}
</script>
<style lang='less' scoped></style>