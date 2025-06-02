import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { load } from 'cheerio'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// 读取 tmp.txt 文件
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = join(__dirname, 'tmp.txt')
const htmlContent = readFileSync(filePath, 'utf8')

// 加载 HTML 内容
const $ = load(htmlContent)

// 提取图标名称，假设图标类名格式为 "anticon anticon-xxx"
function extractIconName(element) {
  const classList = $(element).attr('class').split(' ')
  const iconClass = classList.find((cls) => cls.startsWith('anticon-'))
  if (iconClass) {
    let iconName = iconClass.replace('anticon-', '')
    const parts = iconName.split('-')
    for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1)
    }
    iconName = parts.join('') + 'TowTone'
    return iconName
  }
  return null
}

// 根据 ul 标签分组图标
function classifyIconsByUl() {
  const categorizedIcons = {}
  $('ul').each((ulIndex, ulElement) => {
    const groupName = `分组 ${ulIndex + 1}` // 默认分组名称，可根据实际情况调整
    const groupIcons = []
    $(ulElement)
      .find('.anticon')
      .each((iconIndex, iconElement) => {
        const iconName = extractIconName(iconElement)
        if (iconName) {
          groupIcons.push(iconName)
        }
      })
    if (groupIcons.length > 0) {
      categorizedIcons[groupName] = groupIcons
    }
  })
  return categorizedIcons
}

// 执行分类
const categorizedIcons = classifyIconsByUl()

// 输出 JSON 结果
const outputFilePath = join(__dirname, 'icon_groups.json')
writeFileSync(outputFilePath, JSON.stringify(categorizedIcons, null, 2))
console.log(`图标分组结果已保存到 ${outputFilePath}`)
