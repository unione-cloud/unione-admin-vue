<template>
    <div class="unione-pdf-view">
        <div class="head">
            <div class="title">
                <FilePdfOutlined /> {{ titleObj }}
            </div>
            <div class="pages">
                <StepBackwardOutlined class="btn btn-first" @click="currentPage = 1" />
                <LeftOutlined class="btn btn-pre" @click="currentPage > 1 ? currentPage-- : currentPage" />
                {{ currentPage }} / {{ totalPages }}
                <RightOutlined class="btn btn-next" @click="currentPage < totalPages ? currentPage++ : currentPage" />
                <StepForwardOutlined class="btn btn-last" @click="currentPage = totalPages" />
            </div>
            <div class="extra">
                <a-button size="small" @click="download">
                    <DownloadOutlined />下载
                </a-button>
                <a-button size="small" @click="print">
                    <PrinterOutlined />打印
                </a-button>
                <a-button size="small" @click="close">
                    <CloseOutlined />关闭
                </a-button>
            </div>
        </div>
        <VuePdfEmbed :source="source" class="content" :width="900" :page="currentPage" @loaded="pdfLoaded"
            ref="pdfViewRef">
        </VuePdfEmbed>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { useRoute } from 'vue-router';

defineOptions({
    name: 'UnionePdfView'
})

const props = defineProps({
    url: {
        type: String
    },
    title: {
        type: String
    }
})

const emit = defineEmits(['close'])

const route = useRoute()
const pdfViewRef = ref<any>()
const source = computed<string>(() => {
    return props.url || (route.query.url as string) || ''
})
const titleObj = computed<string>(() => {
    return props.title || (route.query.title as string) || ''
})
const currentPage = ref<number>(1)
const totalPages = ref<number>(0)

const pdfLoaded = (e: any) => {
    totalPages.value = e.numPages
}

const close = () => {
    emit('close')
}
const download = () => {
    pdfViewRef.value.download(titleObj.value)
}
const print = () => {
    pdfViewRef.value.print()
}

</script>
<style scoped lang="less">
.unione-pdf-view {
    width: 100%;
    height: 100vh;
    background-color: darkgrey;
    display: flex;
    flex-direction: column;
    align-items: center;

    .head {
        height: 40px;
        margin-bottom: 5px;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        background-color: #d8d5d5;

        .title {
            font-size: 16px;
        }

        .pages {
            font-size: 15px;

            .btn {
                cursor: pointer;
                margin: 0 5px;
            }
        }

        .extra {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            gap: 5px;
        }
    }

    .content {
        height: calc(100vh - 50px);
        margin: 0 auto;
        overflow: auto;
    }
}
</style>
