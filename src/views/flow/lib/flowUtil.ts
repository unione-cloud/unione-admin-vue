import type { UFNode, UFDefine } from 'unione-flow-vue/dist/typing'

/**
 * 加载当前节点绑定的表单或前置表单
 * @param flowChart 流程定义
 * @param currNode 当前节点
 * @returns
 */
export function loadPreForm(flowChart: UFDefine, currNode: UFNode) {
  return new Promise((resolve, reject) => {
    if (currNode.data?.formId) {
      resolve(currNode.data.formId)
      return
    }
    if (!flowChart.routes?.length || !currNode.sn) {
      reject(null)
      return
    }
    const edgeMap: any = {}
    flowChart.routes.forEach((item) => {
      if (!edgeMap[item.attr.target.cell]) {
        edgeMap[item.attr.target.cell] = []
      }
      edgeMap[item.attr.target.cell].push(item.attr.source.cell)
    })
    const nodeMap: any = {}
    flowChart.nodes.forEach((item) => {
      if (item.sn) {
        nodeMap[item.sn] = item
      }
    })

    const process = (node: any) => {
      if (!edgeMap[node.sn]?.length) {
        return
      }
      if (edgeMap[node.sn].length > 1) {
        reject('存在多个前置节点，请手动绑定表单')
        return
      }
      const preNodeSn = edgeMap[node.sn][0]
      if (!nodeMap[preNodeSn]) {
        return
      }
      if (nodeMap[preNodeSn].data?.formId) {
        return nodeMap[preNodeSn].data.formId
      }
      return process(nodeMap[preNodeSn])
    }

    const result = process(currNode)
    if (result) {
      resolve(result)
      return
    }
    reject(null)
  })
}
