<template>
  <div class="unione-page unione-system-visit">

    <a-row>
      <a-col :span="8">
        <div class="visit-chart country" ref="countryChartDom"></div>
        <div class="visit-chart explorer" ref="explorerChartDom"></div>
      </a-col>
      <a-col :span="16">
        <div class="visit-map" ref="mapDom"></div>
        <div class="rollup" v-if="mapLevel > 1" @click="rollup">
          <UndoOutlined />返回
        </div>
      </a-col>
    </a-row>

  </div>
</template>

<script setup lang="ts">
// 引入 echarts 库
import * as echarts from 'echarts'
import { axios } from 'unione-base-vue';
import { onMounted, ref } from 'vue';

const countryChartDom = ref();
const countryChartInstance = ref();
function loadcountryChart() {
  axios.admin({
    url: '/api/common/visit/stat',
    method: 'post',
    data: {
      dimensions: ['country']
    }
  }).then((res: any) => {
    const option: any = {
      title: {
        text: '地区分布',
        left: 'left'
      },
      legend: {
        top: 'bottom'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{a} {c} (次)'
      },
      series: [
        {
          name: '访客',
          type: 'pie',
          radius: [20, 150],
          roseType: 'area',
          itemStyle: {
            borderRadius: 8
          },
          label: {
            width: 150,
            formatter: '{b} {c} (次)'
          },
          data: res.body.map((item: any) => ({
            value: item.visitCount,
            name: item.country == 'Unknown' ? '未知' : item.country
          }))
        }
      ]
    };
    countryChartInstance.value.setOption(option);
  })
}

const explorerChartDom = ref();
const explorerChartInstance = ref();
function loadExplorerChart() {
  axios.admin({
    url: '/api/common/visit/stat',
    method: 'post',
    data: {
      dimensions: ['explorer', 'osname']
    }
  }).then((res: any) => {

    // 初始化数据累加对象
    const explorerSum: { [key: string]: number } = {};
    const osSum: { [key: string]: number } = {};

    // 遍历数据进行累加
    res.body.forEach((item: any) => {
      // 处理浏览器数据
      const explorerKey = item.explorer === 'Unknown' ? '未知' : item.explorer;
      explorerSum[explorerKey] = (explorerSum[explorerKey] || 0) + item.visitCount;

      // 处理操作系统数据
      const osKey = item.osname === 'Unknown' ? '未知' : item.osname;
      osSum[osKey] = (osSum[osKey] || 0) + item.visitCount;
    });

    // 转换为饼图所需格式
    const browserData = Object.entries(explorerSum).map(([name, value]) => ({
      name, value
    }));
    const osData = Object.entries(osSum).map(([name, value]) => ({
      name, value
    }));

    const option: any = {
      title: {
        text: '设备分布',
        left: 'left'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: 'bottom'
      },
      series: [
        {
          name: '浏览器',
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: browserData
        },
        {
          name: '操作系统',
          type: 'pie',
          radius: ['0%', '35%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: osData
        }
      ]
    };
    explorerChartInstance.value.setOption(option);
  })
}

const mapDom = ref();
const mapInstance = ref();
function loadGeo(name: string) {
  return new Promise((resolve, reject) => {
    if (echarts.getMap(name)) {
      resolve(echarts.getMap(name).geoJson)
    } else {
      axios.root({
        url: '/geo/' + name + '.geoJson',
        method: 'get'
      }).then((res: any) => {
        echarts.registerMap(name, res.data);
        resolve(res.data)
      })
    }
  })
}
const mapName = ref();
const mapLevel = ref(0)
function loadMap(name: string = '100000') {
  mapName.value = name
  mapLevel.value = name.split('/').length
  loadGeo(name).then((data: any) => {
    const nameMap: any = {}
    const mapData = data.features.map((feature: any) => {
      const data = {
        name: feature.properties.name,
        adcode: feature.properties.adcode,
        // value: Math.floor(Math.random() * 50000)
      }
      nameMap[data.name] = data
      return data
    })
    const option = {
      title: {
        text: '全国分布',
        left: 'left'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{a} {c} (次)'
      },
      visualMap: {
        min: 0,
        max: 5000,
        text: ['高', '低'],
        realtime: true,
        calculable: true,
        inRange: {
          color: ['lightskyblue', 'yellow', 'orangered']
        },
        left: 'right'
      },
      series: [
        {
          name: '访客数量',
          type: 'map',
          map: name,
          roam: true,
          label: {
            show: true
          },
          data: mapData
        }
      ]
    }
    mapInstance.value.setOption(option, true);

    axios.admin({
      url: '/api/common/visit/stat',
      method: 'post',
      data: {
        dimensions: [mapLevel.value == 1 ? 'province' : 'city']
      }
    }).then((res: any) => {
      console.log('res', res)
      if (mapLevel.value == 1) {
        res.body.forEach((row: any) => {
          if (nameMap[row.province]) {
            nameMap[row.province].value = row.visitCount
          }
        })
      } else {
        res.body.forEach((row: any) => {
          if (nameMap[row.city]) {
            nameMap[row.city].value = row.visitCount
          }
        })
      }
      mapInstance.value.setOption(option, true);
    })
  });
}

function rollup() {
  if (mapLevel.value > 1) {
    loadMap(mapName.value.substring(0, mapName.value.lastIndexOf('/')))
  }
}


onMounted(() => {
  countryChartInstance.value = echarts.init(countryChartDom.value);
  explorerChartInstance.value = echarts.init(explorerChartDom.value);
  mapInstance.value = echarts.init(mapDom.value);
  mapInstance.value.on('click', (params: any) => {
    if (params.data.adcode && mapLevel.value < 2) {
      loadMap(mapName.value + '/' + params.data.adcode)
    }
  })

  loadcountryChart();
  loadExplorerChart();
  loadMap();
})

</script>
<style scoped lang="less">
.unione-page {
  padding: 0;
  background-color: #f5f5f5;
}

.unione-system-visit {
  .visit-chart {
    min-height: 400px;
  }

  .visit-map {
    height: 100%;
  }

  .rollup {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    font-size: 14px;
    cursor: pointer;
  }
}
</style>
