# vue_mvvm
基于vue2.0的mvvm模式实现

入口：index.html 中id="app"的div标签
实现原理：
    数据变更流程：用Object.defineProperty的get属性监控值的变更、set属性获取变更后的值。
    模板编辑：创建虚拟dom节点，将页面中的dom节点放入创建的虚拟dom中，将虚拟dom中需要替换的内容替换，将此虚拟dom插入至页面中。
