
const modulesFiles: any = import.meta.glob('./modules/*.ts', {
  eager: true
})
const modules = Object.keys(modulesFiles).reduce(
  (modules: { [key: string]: any }, path: string) => {
    const moduleName = path.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')
    modules[moduleName] = modulesFiles[path]?.default
    return modules
  },
  {}
)

export default modules
