<template>
    <div class="message-content">
        <template v-if="roleName == 'user'">
            <div class="content-body">{{ content }}</div>
        </template>
        <template v-else>
            <div v-if="thiking && roleName == 'assistant' && (!thinkList || !thinkList.length)">思考think
                <LoadingOutlined />
            </div>
            <div class="think-item" v-for="(item, i) in thinkList" :key="item">
                <div class="think-title" @click="thinkItem[i] = !thinkItem[i]">
                    思考think<span v-if="thiking && roleName == 'assistant'" style="margin-left: 4px;">{{ thikTotal
                    }}秒</span>
                    <component :is="(thinkItem[i] || thiking) ? 'DownOutlined' : 'RightOutlined'" />
                </div>
                <div class="think-content" v-if="thinkItem[i] || thiking">{{ item }}</div>
            </div>
            <div class="content-body" v-if="contentBody" v-html="renderedContent"></div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
// 导入常用的代码语言支持
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup'; // XML使用markup模块
import 'prismjs/components/prism-bash';

// 配置marked - 在marked v9中使用扩展方式实现代码高亮
marked.setOptions({
    breaks: true  // 将回车转换为<br>
});

// 创建自定义渲染器来实现代码高亮
const renderer = new marked.Renderer();
renderer.code = (code: string, lang: string | undefined, escaped: boolean) => {
    if (lang && Prism.languages[lang as string]) {
        try {
            const highlightedCode = Prism.highlight(code, Prism.languages[lang as string], lang as string);
            return `<pre><code class="language-${lang}">${highlightedCode}</code></pre>`;
        } catch (err) {
            console.error('代码高亮失败:', err);
        }
    }
    // 在marked v9中，escape方法已被移除，使用自定义的转义函数
    const escapeCode = (str: string) => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };
    return `<pre><code>${escaped ? code : escapeCode(code)}</code></pre>`;
};

// 使用自定义渲染器
const markedOptions = {
    renderer,
    breaks: true
};

const props = defineProps({
    thiking: {
        type: Boolean,
        default: false
    },
    thikTotal: {
        type: Number,
        default: 0
    },
    roleName: {
        type: String,
        default: 'user'
    },
    content: {
        type: String,
        default: ''
    }
})

const thinkItem = ref<any>({})
const thinkList = computed<any>(() => {
    if (!props.content || (!props.content.includes('<think>') && !props.content.includes('</think>'))) {
        return []
    }
    const tmp = props.content.split('</think>')
    return tmp.filter(item => item.trim().startsWith('<think>')).map(item => item.trim().substring(7))
})
const contentBody = computed(() => {
    if (!props.content || !props.content.includes('</think>')) {
        return ''
    }
    const tmp = props.content.split('</think>')
    if (tmp[tmp.length - 1].trim().startsWith('</think>')) {
        return ''
    }
    return tmp[tmp.length - 1]
})

// 渲染markdown内容
const renderedContent = computed(() => {
    if (!contentBody.value) return '';
    try {
        return marked.parse(contentBody.value, markedOptions);
    } catch (err) {
        console.error('markdown解析失败:', err);
        return contentBody.value;
    }
});

// 当内容更新后，需要对代码块进行高亮
onMounted(() => {
    // 确保在组件挂载后正确处理代码高亮
    if (renderedContent.value) {
        setTimeout(() => {
            Prism.highlightAll();
        }, 0);
    }
});
</script>

<style lang="less" scoped>
.message-content {
    .think-item {
        .think-title {
            cursor: pointer;
            color: #727272;
        }

        .think-content {
            margin-left: 13px;
            color: #727272;
            border-left: 1px dashed #b9b9b9;
            border-bottom: 1px dashed #b9b9b9;
            padding-left: 4px;
            padding-bottom: 4px;
        }
    }

    // Markdown内容样式
    .content-body {
        line-height: 1.6;
        word-wrap: break-word;

        // 标题样式
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 1em 0 0.5em 0;
            font-weight: 600;
            line-height: 1.25;
        }

        h1 {
            font-size: 1.8em;
            border-bottom: 1px solid #b9b9b9;
            padding-bottom: 0.3em;
        }

        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #b9b9b9;
            padding-bottom: 0.3em;
        }

        h3 {
            font-size: 1.25em;
        }

        h4 {
            font-size: 1em;
        }

        // 段落样式
        p {
            margin: 0.5em 0;
        }

        // 列表样式
        ul,
        ol {
            margin: 0.5em 0 0.5em 1.5em;
        }

        ul {
            list-style-type: disc;
        }

        ol {
            list-style-type: decimal;
        }

        li {
            margin-bottom: 0.25em;
        }

        // 代码样式
        pre {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 16px;
            overflow: auto;
            margin: 1em 0;
        }

        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 0.2em 0.4em;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 85%;
        }

        pre code {
            padding: 0;
            background-color: transparent;
        }

        // 引用样式
        blockquote {
            border-left: 4px solid #dfe2e5;
            padding-left: 1em;
            margin: 1em 0;
            color: #6a737d;
        }

        // 链接样式
        a {
            color: #0366d6;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        // 表格样式
        table {
            border-collapse: collapse;
            border-spacing: 0;
            margin: 1em 0;
            width: 100%;
            display: block;
            overflow: auto;
        }

        th,
        td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }

        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }

        // 水平分割线
        ::v-deep(hr) {
            border: none;
        }
    }
}
</style>