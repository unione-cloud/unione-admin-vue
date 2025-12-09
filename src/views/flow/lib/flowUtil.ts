import { axios } from 'unione-base-vue'
import type { UFNode, UFDefine } from 'unione-flow-vue/dist/typing'

/**
 * 加载当前节点绑定的表单或前置表单
 * @param flowChart 流程定义
 * @param currNode 当前节点
 * @returns
 */
export function loadPreForm(flowChart: UFDefine, currNode: UFNode) {
  return new Promise((resolve, reject) => {
    if (currNode.data?.formType != 1) {
      // 非动态表单，直接返回
      reject(null)
      return
    }
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

/**
 * 加载当前节点绑定的表单字段
 * @param flowChart 流程定义
 * @param currNode 当前节点
 * @param force 是否强制刷新
 * @returns
 */
const formFieldListStore: any = {}
export function loadFormFieldList(flowChart: any, currNode: UFNode, force?: boolean) {
  if (!currNode) {
    // 当前节点为空，获取流程起点
    const startNode = flowChart.getNodes().find((item: any) => item.types === 'start')
    if (!startNode) {
      return Promise.reject(null)
    }
    currNode = startNode
  }
  return new Promise((resolve, reject) => {
    loadPreForm(flowChart.getJson(), currNode)
      .then((formId: any) => {
        if (formFieldListStore[formId] && force != true) {
          resolve(formFieldListStore[formId])
          return
        }
        // 根据formId加载表单字段列表
        axios
          .form({
            url: '/api/data/define/load/' + formId,
            method: 'POST'
          })
          .then((res: any) => {
            if (res.success) {
              if (!res.body?.configs) {
                return
              }
              if (res.body.types == 'setting') {
                const list = res.body.configs.fields?.map(({ title, dataType, name }: any) => {
                  return {
                    label: title,
                    value: name,
                    dataType
                  }
                })
                formFieldListStore[formId] = [
                  {
                    label: res.body.title,
                    value: formId,
                    children: list
                  }
                ]
                resolve(formFieldListStore[formId])
              }
              if (res.body.types == 'form') {
                const dataModels = res.body.configs?.form?.dataModels || []
                const list = dataModels.map(({ title, dsn, fields }: any) => {
                  return {
                    label: title,
                    value: dsn,
                    children: fields?.map(({ title, dataType, name }: any) => {
                      return {
                        label: title,
                        value: dsn + '.' + name,
                        dataType
                      }
                    })
                  }
                })
                formFieldListStore[formId] = list
                console.log('list', list)
                resolve(list)
              }
            } else {
              reject(res.message)
            }
          })
          .catch((err: any) => {
            reject(err)
          })
      })
      .catch((err: any) => {
        reject(err)
      })
  })
}
