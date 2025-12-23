import { axios } from 'unione-base-vue'
import type { UFNode, UFDefine, UFRoute } from 'unione-flow-vue/dist/typing'

/**
 * 加载节点变量,仅获取start，task节点
 * @param flowChart
 * @param currNode
 * @returns
 */
export function loadNodeVar(flowChart: UFDefine, currNode: UFNode) {
  return new Promise((resolve, reject) => {
    const ntypes = ['start', 'task']
    if (ntypes.includes(currNode.types)) {
      resolve(currNode.data?.vars)
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
        reject('存在多个前置节点')
        return
      }
      const preNodeSn = edgeMap[node.sn][0]
      if (!nodeMap[preNodeSn]) {
        return
      }
      if (nodeMap[preNodeSn].data?.vars && ntypes.includes(nodeMap[preNodeSn].types)) {
        return nodeMap[preNodeSn].data.vars
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
 * 加载前置数据加载节点
 * @param flowChart
 * @param currNode
 * @returns
 */
export function loadPreLoadDataNode(flowChart: UFDefine, currNode: UFNode) {
  return new Promise((resolve, reject) => {
    const ntypes = ['data']
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
        reject('存在多个前置节点')
        return
      }
      const preNodeSn = edgeMap[node.sn][0]
      if (!nodeMap[preNodeSn]) {
        return
      }
      if (
        nodeMap[preNodeSn].data?.operation == 'load' &&
        ntypes.includes(nodeMap[preNodeSn].types)
      ) {
        return nodeMap[preNodeSn]
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
 * 加载当前节点绑定的表单或前置表单
 * @param flowChart 流程定义
 * @param currNode 当前节点
 * @returns
 */
export function loadPreForm(flowChart: UFDefine, currNode: UFNode) {
  return new Promise((resolve, reject) => {
    const ntypes = ['start', 'task']
    if (currNode.data?.formType != 1 && ntypes.includes(currNode.types)) {
      // 非动态表单，直接返回
      reject(null)
      return
    }
    if (currNode.data?.formSn && ntypes.includes(currNode.types)) {
      resolve(currNode.data.formSn)
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
      if (nodeMap[preNodeSn].data?.formSn && ntypes.includes(nodeMap[preNodeSn].types)) {
        return nodeMap[preNodeSn].data.formSn
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
 * 同步加载当前节点绑定的表单或前置表单
 * @param flowChart 流程定义
 * @param currNode 当前节点
 * @returns
 */
export function loadPreFormSync(flowChart: UFDefine, currNode: UFNode) {
  const ntypes = ['start', 'task']
  if (currNode.data?.formType != 1 && ntypes.includes(currNode.types)) {
    // 非动态表单，直接返回
    return
  }
  if (currNode.data?.formSn && ntypes.includes(currNode.types)) {
    return currNode.data.formSn
  }
  if (!flowChart.routes?.length || !currNode.sn) {
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
      return
    }
    const preNodeSn = edgeMap[node.sn][0]
    if (!nodeMap[preNodeSn]) {
      return
    }
    if (nodeMap[preNodeSn].data?.formSn && ntypes.includes(nodeMap[preNodeSn].types)) {
      return nodeMap[preNodeSn].data.formSn
    }
    return process(nodeMap[preNodeSn])
  }

  const result = process(currNode)
  if (result) {
    return result
  }
}

/**
 * 加载当前节点绑定的表单字段
 * @param flowChart 流程定义
 * @param currNode 当前节点
 * @param force 是否强制刷新
 * @returns
 */
const formDataModelStore: any = {}
export function loadFormDataModelById(formSn: string, force?: boolean) {
  return new Promise((resolve, reject) => {
    if (formDataModelStore[formSn] && force != true) {
      resolve(formDataModelStore[formSn])
      return
    }
    // 根据formSn加载表单字段列表
    axios
      .form({
        url: '/api/data/define/load/' + formSn,
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
                title,
                name,
                dataType
              }
            })
            formDataModelStore[formSn] = [
              {
                title: res.body.title,
                dsn: formSn,
                vers: res.body.vers,
                group: 'master',
                fields: list
              }
            ]
            resolve(formDataModelStore[formSn])
          }
          if (res.body.types == 'form') {
            const dataModels = (res.body.configs?.form?.dataModels || []).filter(
              (item: any) => item.group != 'sub'
            )
            formDataModelStore[formSn] = dataModels
            dataModels.forEach((item: any) => {
              if (item.group == 'master') {
                const fieldMap: any = {}
                res.body.configs.fields.forEach((field: any) => {
                  fieldMap[field.name] = field.configs?.convert
                })
                item.fields.forEach((field: any) => {
                  if (fieldMap[field.name]) {
                    field.convert = fieldMap[field.name]
                  }
                })
              }
            })
            resolve(dataModels)
          }
        } else {
          reject(res.message)
        }
      })
      .catch((err: any) => {
        reject(err)
      })
  })
}
export function loadFormDataModels(flowChart: any, node: UFNode | UFRoute, force?: boolean) {
  if (!node) {
    // 当前节点为空，获取流程起点
    const startNode = flowChart.getNodes().find((item: any) => item.types === 'start')
    if (!startNode) {
      return Promise.reject(null)
    }
    node = startNode
    //@ts-ignore
  } else if (node.attr?.source) {
    //@ts-ignore
    node = flowChart.getNodes().find((item: any) => item.sn === node.attr.source.cell)
  }

  return new Promise((resolve, reject) => {
    //@ts-ignore
    loadPreForm(flowChart.getJson(), node)
      .then((formSn: any) => {
        loadFormDataModelById(formSn, force)
          .then((res: any) => {
            resolve(res)
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

/**
 * 处理任务状态
 * @param flowChart 流程定义
 * @param overs 已完成任务列表
 * @param runs 正在运行任务列表
 * @returns
 */
export function processTaskStatus(flowChart: any, runs: any[]) {
  if (!runs?.length) {
    return
  }
  const edgeMap: any = {}
  flowChart.routes.forEach((item: any) => {
    if (!edgeMap[item.attr.target.cell]) {
      edgeMap[item.attr.target.cell] = []
    }
    edgeMap[item.attr.target.cell].push(item)
  })
  const nodeMap: any = {}
  flowChart.nodes.forEach((item: any) => {
    if (item.sn) {
      nodeMap[item.sn] = item
    }
  })

  const tasks = runs.sort((a: any, b: any) => {
    return b.id - a.id
  })
  const doprocess = (task: any) => {
    const node = nodeMap[task.sn]
    if (!node || node.dsflag) {
      return
    }
    const preNode = nodeMap[task.preNodeId]
    if (task.status == 1) {
      // 设置前置节点已完成
      if (preNode) {
        preNode.status = 3
        doprocess(preNode)
      }
      node.data.status = 'active'
    } else if (task.status == 2 || task.status == 4) {
      node.data.status = 'running'
    } else if (task.status == 3) {
      node.data.status = 'complete'
    }

    if (preNode) {
      const edge = edgeMap[task.sn]?.find((item: any) => item.attr.source.cell == preNode.sn)
      if (edge) {
        edge.data.status =
          task.status == 2 || task.status == 4
            ? 'running'
            : task.status == 1
              ? 'running'
              : 'complete'
      }
    }

    node.dsflag = true
  }
  tasks.forEach((item: any) => {
    doprocess(item)
  })
}
