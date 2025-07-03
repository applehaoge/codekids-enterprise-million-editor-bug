export const codeExamples = [
  {
    id: 1,
    title: "Hello World",
    code: 'print("Hello, World!")',
    difficulty: 1
  },
  {
    id: 2,
    title: "简单计算器",
    code: 'a = 5\nb = 3\nprint("Sum:", a + b)\nprint("Difference:", a - b)',
    difficulty: 2
  },
  {
    id: 3,
    title: "猜数字游戏",
    code: 'import random\nnumber = random.randint(1, 10)\nguess = int(input("Guess a number between 1 and 10: "))\nif guess == number:\n    print("You won!")\nelse:\n    print("You lost! The number was", number)',
    difficulty: 3
  }
];

export const teachingMaterials = [
  {
    title: "Python 基础入门",
    pages: [
      {
        type: "text",
        content: "欢迎学习Python编程！Python是一种简单易学但功能强大的编程语言。它被广泛用于网站开发、数据分析、人工智能等领域。"
      },
      {
        type: "image",
        content: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Python%20programming%20basics%20for%20kids%2C%20cartoon%20style&sign=72ac03a2b7c734b8d6a1aa9244b019e0"
      },
      {
        type: "video",
        content: "Python基础教程第一课"
      },
      {
        type: "text",
        content: "让我们开始编写第一个程序吧！在编辑器中输入 print('Hello World') 然后点击运行按钮。print() 是Python中最常用的输出函数，它可以将括号内的内容显示在屏幕上。"
      },
      {
        type: "text",
        content: "本节课你将学习：\n1. 使用print()函数输出内容\n2. 理解Python的基本语法\n3. 运行你的第一个Python程序\n\n完成后你将获得5个能量水晶奖励！"
      }
    ],
    quiz: {
      question: "以下哪个是Python的输出语句？",
      options: [
        "A. print()",
        "B. echo()", 
        "C. output()",
        "D. console.log()"
      ],
      answer: "A",
      reward: 5
    }
  }
];

export const aiInteractions = [
  {
    type: "answer",
    content: "你好！我是你的编程助手，有什么问题可以问我哦~",
    time: "10:30 AM"
  },
  {
    type: "question",
    content: "如何打印变量？",
    time: "10:31 AM"
  },
  {
    type: "answer",
    content: "可以使用 print() 函数打印变量，例如: print(my_variable)",
    time: "10:32 AM"
  },
  {
    type: "question",
    content: "什么是for循环？",
    time: "11:15 AM"
  },
  {
    type: "answer",
    content: "for循环用于重复执行代码块，例如: for i in range(5): print(i)",
    time: "11:16 AM"
  }
];

export const codeCompletions = [
  {
    category: "基础函数",
    items: [
      { keyword: "print()", description: "输出内容到屏幕", translation: "打印输出" },
      { keyword: "input()", description: "获取用户输入", translation: "获取输入" },
      { keyword: "len()", description: "获取对象长度", translation: "获取长度" },
      { keyword: "range()", description: "生成数字序列", translation: "数字序列" },
      { keyword: "type()", description: "返回对象类型", translation: "类型检查" },
      { keyword: "sum()", description: "计算序列总和", translation: "求和" }
    ]
  },
  {
    category: "数据类型",
    items: [
      { keyword: "int", description: "整数类型", translation: "整数" },
      { keyword: "float", description: "浮点数类型", translation: "小数" },
      { keyword: "str", description: "字符串类型", translation: "文本" },
      { keyword: "list", description: "列表类型", translation: "列表" },
      { keyword: "dict", description: "字典类型", translation: "字典" },
      { keyword: "bool", description: "布尔类型", translation: "真假值" }
    ]
  },
  {
    category: "控制结构",
    items: [
      { keyword: "if", description: "条件判断", translation: "如果" },
      { keyword: "else", description: "否则分支", translation: "否则" },
      { keyword: "elif", description: "否则如果", translation: "否则如果" },
      { keyword: "for", description: "循环结构", translation: "循环" },
      { keyword: "while", description: "条件循环", translation: "当循环" },
      { keyword: "break", description: "跳出循环", translation: "跳出" },
      { keyword: "continue", description: "继续下一次循环", translation: "继续" }
    ]
  },
  {
    category: "常用方法",
    items: [
      { keyword: ".append()", description: "向列表添加元素", translation: "添加元素" },
      { keyword: ".split()", description: "分割字符串", translation: "分割文本" },
      { keyword: ".join()", description: "连接字符串", translation: "连接文本" },
      { keyword: ".format()", description: "格式化字符串", translation: "文本格式化" },
      { keyword: ".upper()", description: "转换为大写", translation: "大写转换" },
      { keyword: ".lower()", description: "转换为小写", translation: "小写转换" },
      { keyword: ".strip()", description: "去除两端空格", translation: "去除空格" }
    ]
  },
  {
    category: "数学运算",
    items: [
      { keyword: "+", description: "加法运算", translation: "加" },
      { keyword: "-", description: "减法运算", translation: "减" },
      { keyword: "*", description: "乘法运算", translation: "乘" },
      { keyword: "/", description: "除法运算", translation: "除" },
      { keyword: "**", description: "幂运算", translation: "幂" },
       { keyword: "%", description: "取模运算", translation: "取余" }
    ]
  }
];

export const programmingConcepts = [
  {
    keyword: "循环",
    matches: ["for", "while", "循环"],
    items: [
      {
        title: "数数循环 (for循环)",
        syntax: "for 变量 in 序列:",
        description: "就像数糖果一样，从1数到10，或者把玩具箱里的玩具一个一个拿出来玩。告诉电脑：" +
                   "从第一个开始，做完一个再做下一个，直到全部完成。",
        example: "for i in range(5):\n    print(i)  # 会打印0,1,2,3,4",
        translation: "数数循环"
      },
      {
        title: "条件循环 (while循环)",
        syntax: "while 条件:",
        description: "就像玩游戏时妈妈说'玩到吃饭时间为止'。电脑会一直重复做这件事，" +
                   "直到你告诉它该停止了。",
        example: "i = 0\nwhile i < 5:\n    print(i)\n    i += 1  # 每次i加1，直到i不小于5",
        translation: "条件循环"
      }
    ]
  },
  {
    keyword: "条件",
    matches: ["if", "elif", "else", "条件"],
    items: [
      {
        title: "如果...就... (if语句)",
        syntax: "if 条件:",
        description: "就像做选择题：如果下雨就带伞，否则就不带。电脑会根据条件决定执行哪段代码。",
        example: "if 下雨了:\n    print('带伞')  # 下雨时才执行",
        translation: "如果...就..."
      },
      {
        title: "二选一 (if-else语句)",
        syntax: "if 条件:\n    代码块\nelse:\n    代码块",
        description: "就像红绿灯：如果是绿灯就走，否则就停。电脑会在两种选择中选一个执行。",
        example: "if 是绿灯:\n    print('可以过马路')\nelse:\n    print('请等待')",
        translation: "二选一"
      }
    ]
  },
  {
    keyword: "函数",
    matches: ["def", "函数"],
    items: [
      {
        title: "代码盒子 (函数)",
        syntax: "def 函数名(参数):",
        description: "把一堆代码装进一个盒子里，给盒子起个名字。下次要用时，只要喊盒子名字，" +
                   "它就会自动完成所有操作。就像'刷牙'这个指令包含了挤牙膏、刷牙、漱口等一系列动作。",
        example: "def 问好(名字):\n    print('你好,' + 名字)  # 以后只要写问好('小明')就能打招呼",
        translation: "代码盒子"
      }
    ]
  }
];