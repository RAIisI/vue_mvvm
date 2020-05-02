function Vue(options = {}) {
  this.$options = options; // 将所有属性挂在$options
  var data = (this._data = this.$options.data);
  observe(data);

  for (let key in data) {
    Object.defineProperty(this, key, {
      enumerable: true,
      get() {
        return this._data[key];
      },
      set(newVal) {
        this._data[key] = newVal;
      },
    });
  }

  initComputed.call(this);
  new Compile(options.el, this);
}

function initComputed(){
    let vm = this;
    let computed = this.$options.computed;
    Object.keys(computed).forEach((key) =>{
        Object.defineProperty(vm, key,{
            get: typeof computed[key] ==='function' ?  computed[key]: computed[key].get,
            set(){}
        })
    })
}

/**
 * 编译函数
 * @param {*} el 替换的范围
 * @param {*} vm 当前对象
 */
function Compile(el, vm) {
  vm.$el = document.querySelector(el);
  let fragment = document.createDocumentFragment();
  while ((child = vm.$el.firstChild)) {
    // 将app中的内容移入内存中
    fragment.appendChild(child);
  }
  replace(fragment);
  function replace(fragment) {
    Array.from(fragment.childNodes).forEach((node) => {
      // 循环每一层
      var text = node.textContent;
      let reg = /\{\{(.*)\}\}/g;
      if (node.nodeType === 3 && reg.test(text)) { // 文本
        let arr = RegExp.$1.split("."); // people.man name
        let val = null;
        arr.forEach((k) => {
          val = vm[k]; // this.people.man this.name
        });
        new Watcher(vm, RegExp.$1, function (newVal) {
          node.textContent = text.replace(reg, newVal);
        });
        // 替换的逻辑
        node.textContent = text.replace(reg, val);
      }
      if(node.nodeType === 1){ // 元素节点
        let nodeAttrs = node.attributes; // 获取当前dom节点属性
        Array.from(nodeAttrs).forEach(function(attr){
            let name=attr.name; // type='text'
            let exp = attr.value; // v-mode='name'
            if(name.indexOf('v-') == 0){ // v-model
                node.value = vm[exp];
            }
            new Watcher(vm, exp, function(newVal){
                node.value = newVal; // 当watcher触发时，自动赋值
            });
            node.addEventListener('input', function(e){
                let newVal = e.target.value;
                vm[exp] = newVal;
            })
        })

      }
      if (node.childNodes) {
        replace(node);
      }
    });
  }

  vm.$el.appendChild(fragment);
}

function Observe(data) {
  let dep = new Dep();
  for (let key in data) {
    let val = data[key];

    // 如果值是对象则递归为当前对象增加get set属性
    observe(val);

    // 把data属性用objectdefineproperty的方式定义
    Object.defineProperty(data, key, {
      enumerable: true,
      get() {
        Dep.target && dep.addSub(Dep.target); // 监控变更
        return val;
      },
      set(newVal) {
        // 更改值
        if (val === newVal) {
          // 与之前的值相同时
          return;
        }
        val = newVal;
        observe(newVal);
        dep.notify(); // 让所有的watcher的update方法执行
      },
    });
  }
}

// 观察对象给对象增加objectDefineProperty
function observe(data) {
  if (typeof data !== "object") {
    return;
  }
  return new Observe(data);
}

/**发布订阅模式 start */
function Dep() {
  this.subs = [];
}

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

Dep.prototype.notify = function () {
  this.subs.forEach((sub) => sub.update());
};

function Watcher(vm, exp, fn) {
  this.fn = fn;
  this.vm = vm;
  this.exp = exp; // 添加到订阅中
  Dep.target = this;
  let val = vm;
  let arr = exp.split(".");
  arr.forEach(function (k) {
    val = val[k];
  });
  Dep.target = null;
}

Watcher.prototype.update = function () {
  let val = this.vm;
  let arr = this.exp.split(".");
  arr.forEach(function (k) {
    val =   val[k];
  });
  this.fn(val);
};
/**发布订阅模式 end */