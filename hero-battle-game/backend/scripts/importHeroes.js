/**
 * 导入英雄数据（宝可梦风格属性系统）
 * 
 * 使用方法：
 * node scripts/importHeroes.js
 */

const { getDB } = require('../database');

// 角色定位定义
const ROLES = {
    '战士': '近战物理输出，高生命和物攻',
    '刺客': '高速度单体物理输出',
    '法师': '魔法输出，高法攻',
    '治疗': '治疗辅助，高法攻和法防',
    '坦克': '高生命和双防，保护队友',
    '射手': '远程物理输出',
    '辅助': '提供增益和减益效果'
};

// 英雄数据（根据历史背景设置属性和定位）
const heroesData = [
    // 刺客类
    {
        name: '荆轲',
        dynasty: '战国',
        title: '第一刺客',
        bio: '战国时期著名刺客，为报燕国太子丹之恩，刺杀秦始皇未遂，留下了"风萧萧兮易水寒"的悲歌。',
        gender: '男',
        element: '暗',
        role: '刺客',
        base_hp: 80,
        base_phys_atk: 120,
        base_magic_atk: 40,
        base_phys_def: 50,
        base_magic_def: 40,
        base_speed: 110
    },
    
    // 治疗类
    {
        name: '扁鹊',
        dynasty: '春秋',
        title: '医祖',
        bio: '春秋时期名医，被尊为"医祖"，创立了望、闻、问、切四诊法，奠定了中医诊断学基础。',
        gender: '男',
        element: '木',
        role: '治疗',
        base_hp: 90,
        base_phys_atk: 40,
        base_magic_atk: 100,
        base_phys_def: 60,
        base_magic_def: 90,
        base_speed: 70
    },
    
    // 战士类
    {
        name: '吕布',
        dynasty: '三国',
        title: '飞将',
        bio: '三国时期名将，以勇武闻名，有"人中吕布，马中赤兔"的美誉，但反复无常。',
        gender: '男',
        element: '格斗',
        role: '战士',
        base_hp: 130,
        base_phys_atk: 140,
        base_magic_atk: 30,
        base_phys_def: 100,
        base_magic_def: 60,
        base_speed: 85
    },
    {
        name: '项羽',
        dynasty: '秦末',
        title: '西楚霸王',
        bio: '秦末农民起义领袖，西楚霸王，力能扛鼎，勇冠三军，但最终败于刘邦。',
        gender: '男',
        element: '格斗',
        role: '战士',
        base_hp: 140,
        base_phys_atk: 135,
        base_magic_atk: 25,
        base_phys_def: 110,
        base_magic_def: 55,
        base_speed: 75
    },
    {
        name: '关羽',
        dynasty: '三国',
        title: '武圣',
        bio: '三国时期蜀汉名将，被尊为"武圣"，忠义无双，武艺超群，是后世忠义的象征。',
        gender: '男',
        element: '钢',
        role: '战士',
        base_hp: 125,
        base_phys_atk: 130,
        base_magic_atk: 35,
        base_phys_def: 95,
        base_magic_def: 70,
        base_speed: 80
    },
    {
        name: '白起',
        dynasty: '战国',
        title: '人屠',
        bio: '战国时期秦国名将，号称"人屠"，一生征战无数，从未败绩，是中国历史上最杰出的军事家之一。',
        gender: '男',
        element: '暗',
        role: '战士',
        base_hp: 120,
        base_phys_atk: 135,
        base_magic_atk: 30,
        base_phys_def: 90,
        base_magic_def: 65,
        base_speed: 90
    },
    
    // 法师类
    {
        name: '诸葛亮',
        dynasty: '三国',
        title: '卧龙',
        bio: '三国时期蜀汉丞相，杰出的政治家、军事家、发明家，被誉为"卧龙"，是智慧的化身。',
        gender: '男',
        element: '超能力',
        role: '法师',
        base_hp: 95,
        base_phys_atk: 45,
        base_magic_atk: 130,
        base_phys_def: 70,
        base_magic_def: 115,
        base_speed: 85
    },
    {
        name: '张良',
        dynasty: '汉朝',
        title: '谋圣',
        bio: '西汉开国功臣，被誉为"谋圣"，运筹帷幄，决胜千里，为汉朝的建立立下大功。',
        gender: '男',
        element: '超能力',
        role: '法师',
        base_hp: 90,
        base_phys_atk: 40,
        base_magic_atk: 125,
        base_phys_def: 65,
        base_magic_def: 110,
        base_speed: 95
    },
    
    // 皇帝类（根据历史地位设置）
    {
        name: '秦始皇',
        dynasty: '秦朝',
        title: '始皇帝',
        bio: '中国历史上第一个皇帝，统一六国，建立中央集权制度，统一文字、货币、度量衡，修筑万里长城。以强大的防御保护帝国。',
        gender: '男',
        element: '龙',
        role: '坦克',
        base_hp: 165,
        base_phys_atk: 100,
        base_magic_atk: 85,
        base_phys_def: 135,
        base_magic_def: 120,
        base_speed: 70
    },
    {
        name: '汉武帝',
        dynasty: '汉朝',
        title: '汉武大帝',
        bio: '西汉第七位皇帝，在位期间开疆拓土，北击匈奴，南平百越，东并朝鲜，西通西域，开创了汉武盛世。',
        gender: '男',
        element: '火',
        role: '战士',
        base_hp: 140,
        base_phys_atk: 130,
        base_magic_atk: 90,
        base_phys_def: 100,
        base_magic_def: 85,
        base_speed: 85
    },
    {
        name: '唐太宗',
        dynasty: '唐朝',
        title: '天可汗',
        bio: '唐朝第二位皇帝，开创贞观之治，被尊为"天可汗"，是中国历史上最杰出的皇帝之一。以仁政治国，保护百姓。',
        gender: '男',
        element: '土',
        role: '坦克',
        base_hp: 160,
        base_phys_atk: 90,
        base_magic_atk: 80,
        base_phys_def: 130,
        base_magic_def: 125,
        base_speed: 75
    },
    {
        name: '成吉思汗',
        dynasty: '蒙古帝国',
        title: '一代天骄',
        bio: '蒙古帝国可汗，世界历史上杰出的军事家、政治家，建立了横跨欧亚大陆的庞大帝国。蒙古骑兵擅长骑射，横扫欧亚。',
        gender: '男',
        element: '龙',
        role: '射手',
        base_hp: 120,
        base_phys_atk: 140,
        base_magic_atk: 50,
        base_phys_def: 80,
        base_magic_def: 65,
        base_speed: 110
    },
    {
        name: '汉高祖',
        dynasty: '汉朝',
        title: '布衣天子',
        bio: '西汉开国皇帝，建立汉朝，是中国历史上第一位布衣出身的皇帝。',
        gender: '男',
        element: '地面',
        role: '战士',
        base_hp: 130,
        base_phys_atk: 110,
        base_magic_atk: 80,
        base_phys_def: 100,
        base_magic_def: 85,
        base_speed: 80
    },
    {
        name: '明太祖',
        dynasty: '明朝',
        title: '洪武大帝',
        bio: '明朝开国皇帝，从农民起义领袖到建立大明王朝，是中国历史上唯一从南到北统一全国的皇帝。',
        gender: '男',
        element: '地面',
        role: '战士',
        base_hp: 135,
        base_phys_atk: 115,
        base_magic_atk: 75,
        base_phys_def: 105,
        base_magic_def: 80,
        base_speed: 75
    },
    {
        name: '康熙帝',
        dynasty: '清朝',
        title: '千古一帝',
        bio: '清朝第四位皇帝，在位61年，是中国历史上在位时间最长的皇帝，开创了康乾盛世。',
        gender: '男',
        element: '冰',
        role: '法师',
        base_hp: 140,
        base_phys_atk: 85,
        base_magic_atk: 110,
        base_phys_def: 100,
        base_magic_def: 120,
        base_speed: 85
    },
    
    // 名将类
    {
        name: '韩信',
        dynasty: '汉朝',
        title: '兵仙',
        bio: '西汉开国功臣，被尊为"兵仙"，用兵如神，为汉朝的建立立下赫赫战功。擅长运筹帷幄，为军队提供战术增益。',
        gender: '男',
        element: '水',
        role: '辅助',
        base_hp: 105,
        base_phys_atk: 70,
        base_magic_atk: 110,
        base_phys_def: 80,
        base_magic_def: 100,
        base_speed: 100
    },
    {
        name: '霍去病',
        dynasty: '汉朝',
        title: '冠军侯',
        bio: '西汉名将，17岁封侯，19岁任骠骑将军，多次大败匈奴，留下了"封狼居胥"的佳话。',
        gender: '男',
        element: '飞行',
        role: '刺客',
        base_hp: 105,
        base_phys_atk: 135,
        base_magic_atk: 50,
        base_phys_def: 70,
        base_magic_def: 60,
        base_speed: 115
    },
    {
        name: '岳飞',
        dynasty: '宋朝',
        title: '精忠报国',
        bio: '南宋抗金名将，民族英雄，精忠报国，率领岳家军多次大败金军，后被奸臣所害。',
        gender: '男',
        element: '钢',
        role: '战士',
        base_hp: 125,
        base_phys_atk: 125,
        base_magic_atk: 70,
        base_phys_def: 105,
        base_magic_def: 85,
        base_speed: 85
    },
    
    // 女将类
    {
        name: '花木兰',
        dynasty: '南北朝',
        title: '巾帼英雄',
        bio: '南北朝时期女英雄，代父从军，英勇善战，是巾帼不让须眉的典范。擅长弓箭，百步穿杨。',
        gender: '女',
        element: '飞行',
        role: '射手',
        base_hp: 95,
        base_phys_atk: 125,
        base_magic_atk: 55,
        base_phys_def: 75,
        base_magic_def: 70,
        base_speed: 105
    },
    {
        name: '穆桂英',
        dynasty: '宋朝',
        title: '杨门女将',
        bio: '宋朝女将，杨门女将之一，武艺高强，智勇双全，是古代女英雄的代表。擅长射箭，箭法精准。',
        gender: '女',
        element: '飞行',
        role: '射手',
        base_hp: 90,
        base_phys_atk: 120,
        base_magic_atk: 60,
        base_phys_def: 80,
        base_magic_def: 65,
        base_speed: 110
    },
    
    // 科学家类
    {
        name: '张衡',
        dynasty: '汉朝',
        title: '科圣',
        bio: '东汉科学家、天文学家，发明了地动仪和浑天仪，在天文学、数学、地理学等领域都有重要贡献。',
        gender: '男',
        element: '岩石',
        role: '法师',
        base_hp: 85,
        base_phys_atk: 50,
        base_magic_atk: 110,
        base_phys_def: 75,
        base_magic_def: 105,
        base_speed: 80
    },
    {
        name: '祖冲之',
        dynasty: '南北朝',
        title: '算圣',
        bio: '南北朝时期杰出的数学家、天文学家，首次将圆周率精确到小数点后七位，领先世界近千年。',
        gender: '男',
        element: '超能力',
        role: '法师',
        base_hp: 80,
        base_phys_atk: 45,
        base_magic_atk: 115,
        base_phys_def: 70,
        base_magic_def: 110,
        base_speed: 85
    },
    {
        name: '李时珍',
        dynasty: '明朝',
        title: '药圣',
        bio: '明代著名医药学家，历时27年编写《本草纲目》，被誉为"药圣"，对中医药学发展做出巨大贡献。',
        gender: '男',
        element: '木',
        role: '治疗',
        base_hp: 100,
        base_phys_atk: 50,
        base_magic_atk: 110,
        base_phys_def: 80,
        base_magic_def: 100,
        base_speed: 75
    },
    
    // ========== 外国名人 ==========
    
    // 军事家类
    {
        name: '亚历山大大帝',
        dynasty: '马其顿',
        title: '征服者',
        bio: '马其顿国王，世界历史上最杰出的军事统帅之一，建立了横跨欧亚非的庞大帝国，从未在战场上失败。',
        gender: '男',
        element: '龙',
        role: '战士',
        base_hp: 155,
        base_phys_atk: 145,
        base_magic_atk: 70,
        base_phys_def: 105,
        base_magic_def: 80,
        base_speed: 100
    },
    {
        name: '拿破仑',
        dynasty: '法国',
        title: '法兰西皇帝',
        bio: '法国军事家、政治家，法兰西第一帝国皇帝，以卓越的军事才能和战略眼光闻名，改变了欧洲历史进程。',
        gender: '男',
        element: '火',
        role: '战士',
        base_hp: 150,
        base_phys_atk: 140,
        base_magic_atk: 85,
        base_phys_def: 110,
        base_magic_def: 90,
        base_speed: 95
    },
    {
        name: '凯撒',
        dynasty: '古罗马',
        title: '独裁者',
        bio: '古罗马军事统帅、政治家，征服高卢，击败庞培，成为罗马独裁官，是罗马从共和国向帝国转变的关键人物。',
        gender: '男',
        element: '钢',
        role: '战士',
        base_hp: 145,
        base_phys_atk: 135,
        base_magic_atk: 80,
        base_phys_def: 115,
        base_magic_def: 85,
        base_speed: 90
    },
    {
        name: '汉尼拔',
        dynasty: '迦太基',
        title: '战略之父',
        bio: '迦太基军事家，第二次布匿战争中的杰出统帅，率领军队翻越阿尔卑斯山，多次大败罗马军队。',
        gender: '男',
        element: '暗',
        role: '刺客',
        base_hp: 110,
        base_phys_atk: 130,
        base_magic_atk: 75,
        base_phys_def: 85,
        base_magic_def: 70,
        base_speed: 110
    },
    {
        name: '斯巴达克斯',
        dynasty: '古罗马',
        title: '角斗士',
        bio: '古罗马角斗士，领导了历史上最著名的奴隶起义，以勇猛和战术智慧对抗强大的罗马军团。',
        gender: '男',
        element: '格斗',
        role: '战士',
        base_hp: 135,
        base_phys_atk: 140,
        base_magic_atk: 60,
        base_phys_def: 100,
        base_magic_def: 65,
        base_speed: 95
    },
    
    // 科学家类
    {
        name: '牛顿',
        dynasty: '英国',
        title: '科学巨匠',
        bio: '英国物理学家、数学家，发现了万有引力定律和三大运动定律，奠定了经典力学基础，被誉为"科学之父"。',
        gender: '男',
        element: '地面',
        role: '法师',
        base_hp: 90,
        base_phys_atk: 45,
        base_magic_atk: 135,
        base_phys_def: 70,
        base_magic_def: 120,
        base_speed: 85
    },
    {
        name: '爱因斯坦',
        dynasty: '德国/美国',
        title: '相对论之父',
        bio: '理论物理学家，提出了相对论和质能方程E=mc²，彻底改变了人类对时空和宇宙的认知，是20世纪最伟大的科学家。',
        gender: '男',
        element: '超能力',
        role: '法师',
        base_hp: 85,
        base_phys_atk: 40,
        base_magic_atk: 140,
        base_phys_def: 65,
        base_magic_def: 125,
        base_speed: 90
    },
    {
        name: '达芬奇',
        dynasty: '意大利',
        title: '文艺复兴全才',
        bio: '意大利文艺复兴时期的全才，既是画家、雕塑家，也是科学家、发明家，留下了《蒙娜丽莎》等传世名作。',
        gender: '男',
        element: '普通',
        role: '辅助',
        base_hp: 100,
        base_phys_atk: 60,
        base_magic_atk: 115,
        base_phys_def: 80,
        base_magic_def: 105,
        base_speed: 95
    },
    {
        name: '伽利略',
        dynasty: '意大利',
        title: '现代科学之父',
        bio: '意大利物理学家、天文学家，改进了望远镜，发现了木星卫星，支持日心说，为现代科学奠定了基础。',
        gender: '男',
        element: '电',
        role: '法师',
        base_hp: 88,
        base_phys_atk: 48,
        base_magic_atk: 128,
        base_phys_def: 72,
        base_magic_def: 118,
        base_speed: 88
    },
    {
        name: '居里夫人',
        dynasty: '波兰/法国',
        title: '镭之母',
        bio: '波兰裔法国物理学家、化学家，发现了镭和钋元素，是第一位获得诺贝尔奖的女性，也是唯一获得两次诺贝尔奖的女性。',
        gender: '女',
        element: '毒',
        role: '法师',
        base_hp: 92,
        base_phys_atk: 42,
        base_magic_atk: 132,
        base_phys_def: 68,
        base_magic_def: 122,
        base_speed: 82
    },
    
    // 政治家类
    {
        name: '华盛顿',
        dynasty: '美国',
        title: '国父',
        bio: '美国第一任总统，领导美国独立战争，建立了美利坚合众国，被誉为"美国国父"。',
        gender: '男',
        element: '钢',
        role: '战士',
        base_hp: 140,
        base_phys_atk: 125,
        base_magic_atk: 85,
        base_phys_def: 110,
        base_magic_def: 95,
        base_speed: 88
    },
    {
        name: '林肯',
        dynasty: '美国',
        title: '解放者',
        bio: '美国第16任总统，领导了南北战争，废除了奴隶制，维护了国家统一，是美国历史上最受尊敬的总统之一。',
        gender: '男',
        element: '钢',
        role: '坦克',
        base_hp: 155,
        base_phys_atk: 100,
        base_magic_atk: 90,
        base_phys_def: 125,
        base_magic_def: 120,
        base_speed: 80
    },
    {
        name: '丘吉尔',
        dynasty: '英国',
        title: '铁血首相',
        bio: '英国首相，在第二次世界大战中领导英国抵抗纳粹德国，以坚定的意志和卓越的领导力闻名。',
        gender: '男',
        element: '岩石',
        role: '坦克',
        base_hp: 150,
        base_phys_atk: 95,
        base_magic_atk: 100,
        base_phys_def: 130,
        base_magic_def: 115,
        base_speed: 75
    },
    {
        name: '甘地',
        dynasty: '印度',
        title: '圣雄',
        bio: '印度民族独立运动领袖，以非暴力不合作运动领导印度独立，被誉为"圣雄"，是和平主义的象征。',
        gender: '男',
        element: '普通',
        role: '辅助',
        base_hp: 120,
        base_phys_atk: 50,
        base_magic_atk: 105,
        base_phys_def: 100,
        base_magic_def: 115,
        base_speed: 85
    },
    
    // 艺术家类
    {
        name: '莎士比亚',
        dynasty: '英国',
        title: '文豪',
        bio: '英国文学史上最杰出的戏剧家和诗人，创作了《哈姆雷特》《罗密欧与朱丽叶》等传世名作，被誉为"文豪"。',
        gender: '男',
        element: '超能力',
        role: '法师',
        base_hp: 95,
        base_phys_atk: 50,
        base_magic_atk: 125,
        base_phys_def: 75,
        base_magic_def: 110,
        base_speed: 90
    },
    {
        name: '米开朗基罗',
        dynasty: '意大利',
        title: '艺术巨匠',
        bio: '意大利文艺复兴时期的雕塑家、画家、建筑师，创作了《大卫》《创世纪》等不朽杰作，是文艺复兴三杰之一。',
        gender: '男',
        element: '岩石',
        role: '法师',
        base_hp: 100,
        base_phys_atk: 70,
        base_magic_atk: 120,
        base_phys_def: 85,
        base_magic_def: 105,
        base_speed: 85
    },
    
    // 探险家类
    {
        name: '哥伦布',
        dynasty: '意大利/西班牙',
        title: '新大陆发现者',
        bio: '意大利航海家，在西班牙王室支持下横渡大西洋，发现了美洲新大陆，开启了地理大发现时代。',
        gender: '男',
        element: '水',
        role: '辅助',
        base_hp: 105,
        base_phys_atk: 75,
        base_magic_atk: 100,
        base_phys_def: 85,
        base_magic_def: 95,
        base_speed: 100
    },
    {
        name: '麦哲伦',
        dynasty: '葡萄牙/西班牙',
        title: '环球航行第一人',
        bio: '葡萄牙航海家，领导了人类历史上第一次环球航行，证明了地球是圆的，开辟了新的航路。',
        gender: '男',
        element: '冰',
        role: '辅助',
        base_hp: 110,
        base_phys_atk: 80,
        base_magic_atk: 95,
        base_phys_def: 90,
        base_magic_def: 90,
        base_speed: 105
    },
    
    // 其他杰出人物
    {
        name: '圣女贞德',
        dynasty: '法国',
        title: '奥尔良少女',
        bio: '法国民族英雄，在百年战争中领导法军抵抗英军，以坚定的信仰和勇气鼓舞了法国人民，最终被俘牺牲。',
        gender: '女',
        element: '火',
        role: '战士',
        base_hp: 125,
        base_phys_atk: 130,
        base_magic_atk: 85,
        base_phys_def: 100,
        base_magic_def: 95,
        base_speed: 100
    },
    {
        name: '南丁格尔',
        dynasty: '英国',
        title: '提灯女神',
        bio: '英国护士，现代护理学的奠基人，在克里米亚战争中改善了医疗条件，被誉为"提灯女神"。',
        gender: '女',
        element: '普通',
        role: '治疗',
        base_hp: 95,
        base_phys_atk: 45,
        base_magic_atk: 115,
        base_phys_def: 70,
        base_magic_def: 105,
        base_speed: 80
    },
    {
        name: '特斯拉',
        dynasty: '塞尔维亚/美国',
        title: '交流电之父',
        bio: '塞尔维亚裔美国发明家，发明了交流电系统，在电磁学领域做出了重大贡献，被誉为"交流电之父"。',
        gender: '男',
        element: '电',
        role: '法师',
        base_hp: 88,
        base_phys_atk: 50,
        base_magic_atk: 138,
        base_phys_def: 75,
        base_magic_def: 118,
        base_speed: 92
    }
];

function importHeroes() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        console.log('==========================================');
        console.log('  开始导入英雄数据（宝可梦风格）');
        console.log('==========================================');
        console.log('');
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        let processedCount = 0;
        const total = heroesData.length;
        
        function processHero(index) {
            if (index >= total) {
                finish();
                return;
            }
            
            const hero = heroesData[index];
            
            // 检查英雄是否已存在
            db.get('SELECT id FROM heroes WHERE name = ?', [hero.name], (err, row) => {
                if (err) {
                    console.error(`❌ 检查英雄 "${hero.name}" 时出错:`, err.message);
                    errorCount++;
                    processedCount++;
                    processHero(index + 1);
                    return;
                }
                
                if (row) {
                    console.log(`⏭️  跳过 "${hero.name}" (已存在)`);
                    skipCount++;
                    processedCount++;
                    processHero(index + 1);
                    return;
                }
                
                // 插入英雄
                db.run(`
                    INSERT INTO heroes (
                        name, dynasty, title, bio, element, role,
                        base_hp, base_phys_atk, base_magic_atk,
                        base_phys_def, base_magic_def, base_speed
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    hero.name,
                    hero.dynasty,
                    hero.title,
                    hero.bio,
                    hero.element,
                    hero.role,
                    hero.base_hp,
                    hero.base_phys_atk,
                    hero.base_magic_atk,
                    hero.base_phys_def,
                    hero.base_magic_def,
                    hero.base_speed
                ], function(insertErr) {
                    if (insertErr) {
                        console.error(`❌ 导入 "${hero.name}" 失败:`, insertErr.message);
                        errorCount++;
                    } else {
                        console.log(`✅ 导入 "${hero.name}" (${hero.title}) - ${hero.element}系 ${hero.role}`);
                        successCount++;
                    }
                    
                    processedCount++;
                    processHero(index + 1);
                });
            });
        }
        
        // 开始处理
        db.serialize(() => {
            processHero(0);
        });
        
        function finish() {
            db.close();
            console.log('');
            console.log('==========================================');
            console.log('  导入完成');
            console.log('==========================================');
            console.log(`✅ 成功导入: ${successCount} 个`);
            console.log(`⏭️  跳过: ${skipCount} 个`);
            console.log(`❌ 失败: ${errorCount} 个`);
            console.log(`📊 总计: ${total} 个`);
            console.log('');
            console.log('角色定位分布：');
            const roleCount = {};
            heroesData.forEach(h => {
                roleCount[h.role] = (roleCount[h.role] || 0) + 1;
            });
            Object.keys(roleCount).forEach(role => {
                console.log(`  ${role}: ${roleCount[role]} 个`);
            });
            console.log('');
            
            if (errorCount === 0) {
                resolve();
            } else {
                reject(new Error(`导入过程中有 ${errorCount} 个错误`));
            }
        }
    });
}

// 执行导入
if (require.main === module) {
    importHeroes()
        .then(() => {
            console.log('✅ 所有英雄数据导入成功！');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ 导入失败:', err);
            process.exit(1);
        });
}

module.exports = { importHeroes, heroesData, ROLES };
