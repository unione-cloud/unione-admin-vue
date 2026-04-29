<template>
    <div class="unione-page license-page">
        <div class="lic-expire" v-if="!licenseCtx && viewType != 'install'">License未安装或已过期<a class="link"
                @click="licInstaller.toInstall">点击安装</a>
        </div>
        <div class="lic-form" v-if="viewType == 'install'">
            <div class="title">
                License安装
            </div>
            <a-form-item label="MAC" help="复制mac给销售人员，申请License，然后点击下方按钮导入License完成安装。">{{ licInstaller.macVar
            }}</a-form-item>
            <div class="btns">
                <a-upload accept=".lic" :before-upload="licInstaller.doInstall">
                    <a-button>
                        <upload-outlined></upload-outlined>
                        导入License
                    </a-button>
                </a-upload>
            </div>
        </div>
        <div class="lic-view" v-if="licenseCtx && viewType == 'view'">
            <div class="title">
                License信息
            </div>
            <div class="info">
                <a-form-item label="持有者" :label-col="{ span: 5 }" class="value-box">
                    {{ licenseCtx.holder.name }}
                </a-form-item>
                <a-form-item label="有效期" :label-col="{ span: 5 }" class="value-box">
                    <div class="value">{{ licenseCtx.notBefore.substring(0, 10) }} - {{ licenseCtx.notAfter.substring(0,
                        10) }}</div>
                </a-form-item>
                <a-form-item label="发行人" :label-col="{ span: 5 }" class="value-box">
                    {{ licenseCtx.issuer.name }}
                </a-form-item>
                <a-form-item label="发行时间" :label-col="{ span: 5 }" class="value-box">
                    {{ licenseCtx.issued.substring(0, 10) }}
                </a-form-item>
                <a-form-item label="授权MAC" :label-col="{ span: 5 }" class="value-box">
                    {{ licenseCtx.extra.mac }}
                </a-form-item>
                <a-form-item label="会话数量" :label-col="{ span: 5 }" help="最大同时在线用户数量">
                    <div class="value">{{ licenseCtx.extra.umount }}</div>
                </a-form-item>
                <a-form-item label="授权网段" :label-col="{ span: 5 }" help="授权网段可以访问系统">
                    <div class="value">{{ licenseCtx.extra.netSeg }}</div>
                </a-form-item>
                <a-form-item label="授权信息" :label-col="{ span: 5 }">
                    <div class="value">{{ licenseCtx.info }}</div>
                </a-form-item>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue';
import { onMounted, ref } from 'vue';

const dialog = useDialog()
defineOptions({
    name: 'LicenseIndex'
})

const licenseCtx = ref<any>()
function loadLicenseCtx() {
    axios.admin({
        url: '/api/lic/info',
        method: 'get'
    }).then((res: any) => {
        licenseCtx.value = res.body
    })
}

const viewType = ref('view')
const licInstaller = ref<any>({
    macVar: '',
    loading: false,
    toInstall: () => {
        viewType.value = 'install'
        axios.admin({
            url: '/api/lic/mac',
            method: 'get'
        }).then((res: any) => {
            licInstaller.value.macVar = res.body
        })
    },
    doInstall: (file: any) => {
        if (!file || file.size < 100) {
            dialog.error('请选择License文件')
            return false
        }
        licInstaller.value.loading = true
        const data = new FormData()
        data.append('file', file)
        axios.admin({
            url: '/api/lic/install',
            method: 'post',
            data
        }).then((res: any) => {
            if (res.success) {
                dialog.success('License安装成功')
                viewType.value = 'view'
                loadLicenseCtx()
            } else {
                dialog.error(res.message)
            }
        }).finally(() => {
            licInstaller.value.loading = false
        })
        return false
    }
})

onMounted(() => {
    loadLicenseCtx()
})

</script>
<style lang="less" scoped>
.license-page {
    padding-top: 150px;

    .lic-expire {
        margin: 0 auto;
        font-size: 20px;
        color: red;
        font-weight: bold;

        .link {
            color: #4096ff;
            cursor: pointer;
            margin-left: 5px;
        }
    }

    .lic-form {
        margin: 0 auto;

        .title {
            color: #134ce4;
            font-size: 30px;
            font-weight: bold;
            text-align: center;
            user-select: none;
            margin-bottom: 30px;
        }

        .btns {
            display: flex;
        }
    }

    .lic-view {
        width: 500px;
        margin: 0 auto;
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

        &:hover {
            background-color: #e6f7ff;
            cursor: pointer;
            box-shadow: 10px 10px 10px #134ce430;
        }

        .title {
            color: #134ce4;
            font-size: 30px;
            font-weight: bold;
            text-align: center;
            user-select: none;
            margin-bottom: 30px;
        }

        :deep(.ant-form-item) {
            margin-bottom: 0;
        }

        .info {
            .value-box {
                :deep(.ant-form-item-control) {
                    width: calc(100% - 210px);
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
            }
        }
    }
}
</style>