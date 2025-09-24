import { transformRecordToOption, translateOptions } from '@/utils/common';

export const enableStatusRecord: Record<Api.Common.EnableStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.common.status.enable',
  '1': 'page.manage.common.status.disable'
};

export const enableStatusOptions = transformRecordToOption(enableStatusRecord);


export const gameStatusRecord: Record<Api.SystemManage.GameStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.game.type.disable',
  '1': 'page.manage.game.type.normal',
}

export const gameGenderOptions = transformRecordToOption(gameStatusRecord);

// 数据隔离类型
export const gameUsermergeRecord: Record<Api.SystemManage.Usermerge, App.I18n.I18nKey> = {
  '0': 'page.manage.game.usermerge.dataisolation',
  '1': 'page.manage.game.usermerge.dataaccess',
}

export const gameUsermergeOptions = transformRecordToOption(gameUsermergeRecord);


export const userGenderRecord: Record<Api.SystemManage.UserGender, App.I18n.I18nKey> = {
  '0': 'page.manage.user.gender.male',
  '1': 'page.manage.user.gender.female'
};

export const userGenderOptions = transformRecordToOption(userGenderRecord);

export const menuTypeRecord: Record<Api.SystemManage.MenuType, App.I18n.I18nKey> = {
  'M': 'page.manage.menu.type.directory',
  'C': 'page.manage.menu.type.menu',
  'F': 'page.manage.menu.type.button'
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

export const menuIconTypeRecord: Record<Api.SystemManage.IconType, App.I18n.I18nKey> = {
  '1': 'page.manage.menu.iconType.iconify',
  '2': 'page.manage.menu.iconType.local'
};

export const menuIconTypeOptions = transformRecordToOption(menuIconTypeRecord);

//渠道启用禁用 0:启用 1:禁用
export const channelenableRecord: Record<Api.SystemManage.Channelenable, App.I18n.I18nKey> = {
  '0': 'page.manage.channel.status.enable',
  '1': 'page.manage.channel.status.disable',
};

export const channelenableOptions = transformRecordToOption(channelenableRecord);

//游戏平台单选
export const gamePlatformRecord: Record<Api.SystemManage.ChannelCallback, App.I18n.I18nKey> = {
  'android': 'page.manage.channel.platformgame.android',
  'ios': 'page.manage.channel.platformgame.ios',
}
export const gamePlatformOptions = transformRecordToOption(gamePlatformRecord);

//渠道状态
export const channelStatusRecord: Record<Api.SystemManage.ChannelStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.channel.status.disable',
  '1': 'page.manage.channel.status.normal',
}

export const channelStatusOptions = transformRecordToOption(channelStatusRecord);


// 区服状态
export const serverStatusRecord: Record<Api.SystemManage.serverType, App.I18n.I18nKey> = {
  '0': 'page.manage.serverregion.status.normal',
  '1': 'page.manage.serverregion.status.disable',
}
export const serverStatusOptions = transformRecordToOption(serverStatusRecord);


// 服务器分组
export const serverStatusgroupTest: Record<Api.SystemManage.servergroupTest, App.I18n.I18nKey> = {
  '0': 'page.manage.servergroup.status.Normalgrouping',
  '1': 'page.manage.servergroup.status.Testgrouping',
}
export const servergroupStatusOptions = transformRecordToOption(serverStatusgroupTest);


// 日志服管理
export const serverStatusLog: Record<Api.SystemManage.serverenable, App.I18n.I18nKey> = {
  '0': 'page.manage.log.status.Shutdown',
  '1': 'page.manage.log.status.normal',
}
export const serverLogOptions = transformRecordToOption(serverStatusLog);

export const serverStatusLogsaveEnble: Record<Api.SystemManage.serversaveEnble, App.I18n.I18nKey> = {
  '0': 'page.manage.log.serverenablelog.Nosave',
  '1': 'page.manage.log.serverenablelog.instantlysave',
}
export const serverLogsaveEnbleOptions = transformRecordToOption(serverStatusLogsaveEnble);


// 服务器管理
// INVISIBLE:不可见;WHITE:白名单;VISIBLE:可见
export const serverStatusVisible: Record<Api.SystemManage.serverVisible, App.I18n.I18nKey> = {
  'INVISIBLE': 'page.manage.serveritem.serverVisibles.invisible',
  // 'WHITE': 'page.manage.serveritem.serverVisibles.whitelist',
  'VISIBLE': 'page.manage.serveritem.serverVisibles.visible',
}

export const serverVisibleOptions = transformRecordToOption(serverStatusVisible);

//对外显示的服务器状态：0:正常;1:繁忙;2:爆满3：关闭 4:维护;5:隐藏
export const serverStatusShow: Record<Api.SystemManage.serverStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.serveritem.serverStatusitem.normal',
  '1': 'page.manage.serveritem.serverStatusitem.crowd',
  '2': 'page.manage.serveritem.serverStatusitem.full',
  '3': 'page.manage.serveritem.serverStatusitem.close',
  '4': 'page.manage.serveritem.serverStatusitem.maintain',
  '5': 'page.manage.serveritem.serverStatusitem.invisible',
}
export const serverStatusShowOptions = transformRecordToOption(serverStatusShow);

// 服务器运行状态
export const serverRunStateRecord: Record<Api.SystemManage.serverRunState, App.I18n.I18nKey> = {
  '0': 'page.manage.serveritem.serverRunStateitem.normal',
  '1': 'page.manage.serveritem.serverRunStateitem.warning',
  '2': 'page.manage.serveritem.serverRunStateitem.offline',
  '3': 'page.manage.serveritem.serverRunStateitem.maintenance',
}
export const serverRunStateOptions = transformRecordToOption(serverRunStateRecord);

export const serverStatusShowadd: Record<Api.SystemManage.serverStatusadd, App.I18n.I18nKey> = {
  '0': 'page.manage.serveritem.serverStatusitem.normal',
  '4': 'page.manage.serveritem.serverStatusitem.maintain',
  '5': 'page.manage.serveritem.serverStatusitem.invisible',
}

export const serverStatusaddaddShowOptions = transformRecordToOption(serverStatusShowadd);

// 是否推荐
export const serverStatusRecommend: Record<Api.SystemManage.serverRecommend, App.I18n.I18nKey> = {
  '0': 'page.manage.serveritem.serverRecommenditem.unrecommend',
  '1': 'page.manage.serveritem.serverRecommenditem.recommend',
}
export const serverRecommendOptions = transformRecordToOption(serverStatusRecommend);

// 新服状态
export const serverStatusNew: Record<Api.SystemManage.serverNew, App.I18n.I18nKey> = {
  '0': 'page.manage.serveritem.serverNewitem.oldserver',
  '1': 'page.manage.serveritem.serverNewitem.newserver',
}
export const serverNewOptions = transformRecordToOption(serverStatusNew);

// 白名单管理
export const serverStatusWhite: Record<Api.SystemManage.whiteTypeIp, App.I18n.I18nKey> = {
  '0': 'page.manage.serverwhite.whitetypeIp.userWhite',
  '1': 'page.manage.serverwhite.whitetypeIp.ipWhitelist',
  '2': 'page.manage.serverwhite.whitetypeIp.ipBlacklist',
  '3': 'page.manage.serverwhite.whitetypeIp.ipWhiteListRestricted',
  '4': 'page.manage.serverwhite.whitetypeIp.accountWhiteListRestricted',
}
export const serverWhiteOptions = transformRecordToOption(serverStatusWhite);


// 公告内容 // 0:公告 1:活动 2:节日
export const serverStatusNotice: Record<Api.SystemManage.noticeType, App.I18n.I18nKey> = {
  '0': 'page.manage.norice.NoticeType.announcement',
  '1': 'page.manage.norice.NoticeType.activity',
  "2": 'page.manage.norice.NoticeType.festival'
}
export const serverNoticeOptions = transformRecordToOption(serverStatusNotice);

// 公告标注
export const serverStatusNoticeLabel: Record<Api.SystemManage.noticeExplain, App.I18n.I18nKey> = {
  'null': 'page.manage.norice.NoticeLabel.not',
  '0': 'page.manage.norice.NoticeLabel.hot',
  '1': 'page.manage.norice.NoticeLabel.new',
}
export const serverNoticeLabelOptions = transformRecordToOption(serverStatusNoticeLabel);

// 公告状态
export const serverStatusNoticeStatus: Record<Api.SystemManage.noticeenable, App.I18n.I18nKey> = {
  '0': 'page.manage.norice.NoticeStatus.disable',
  '1': 'page.manage.norice.NoticeStatus.normal',
}
export const serverNoticeStatusOptions = transformRecordToOption(serverStatusNoticeStatus);

// 操作日志业务类型记录 (0其它 1新增 2修改 3删除)
export const operatorTypeRecord: Record<string, App.I18n.I18nKey> = {
  '0': 'page.manage.operlog.operatorTypes.other',
  '1': 'page.manage.operlog.operatorTypes.add',
  '2': 'page.manage.operlog.operatorTypes.edit',
  '3': 'page.manage.operlog.operatorTypes.delete'
};

export const operatorTypeOptions = transformRecordToOption(operatorTypeRecord);

// 操作日志状态记录 (0正常 1异常)
export const operlogStatusRecord: Record<string, App.I18n.I18nKey> = {
  '0': 'page.manage.operlog.statusTypes.normal',
  '1': 'page.manage.operlog.statusTypes.error'
};

export const operlogStatusOptions = transformRecordToOption(operlogStatusRecord);

// 登录日志状态记录 (0成功 1失败)
export const loginlogStatusRecord: Record<string, App.I18n.I18nKey> = {
  '0': 'page.manage.logininfor.statusTypes.success',
  '1': 'page.manage.logininfor.statusTypes.error'
};

export const loginlogStatusOptions = transformRecordToOption(loginlogStatusRecord);


// 商品类型
export const productTypeRecord: Record<Api.SystemManage.productType, App.I18n.I18nKey> = {
  '1': 'page.manage.products.producttype.sdk',
  '2': 'page.manage.products.producttype.web'
};

export const productTypeOptions = transformRecordToOption(productTypeRecord);

// 商品状态
export const productStatusRecord: Record<Api.SystemManage.productStatus, App.I18n.I18nKey> = {
  'true': 'page.manage.products.productstatus.enable',
  'false': 'page.manage.products.productstatus.disable'
};

export const productStatusOptions = translateOptions(transformRecordToOption(productStatusRecord));

// 购买前置条件
export const saleTypeRecord: Record<Api.SystemManage.saleType, App.I18n.I18nKey> = {
  0: 'page.manage.Gems.saletype.none',
  1: 'page.manage.Gems.saletype.serveropen',
  2: 'page.manage.Gems.saletype.characterLevel',
  3: 'page.manage.Gems.saletype.achievement',
  4: 'page.manage.Gems.saletype.quest',
  5: 'page.manage.Gems.saletype.returnDayCount',
  6: 'page.manage.Gems.saletype.uniquePetGain',
  7: 'page.manage.Gems.saletype.epicPetGain',
  8: 'page.manage.Gems.saletype.legendPetGain',
  9: 'page.manage.Gems.saletype.uniqueReflectionGain',
 10: 'page.manage.Gems.saletype.epicReflectionGain',
 11: 'page.manage.Gems.saletype.legendReflectionGain',
 12: 'page.manage.Gems.saletype.heroReflectionGain',
 13: 'page.manage.Gems.saletype.endEnum',
};

export const saleTypeOptions = translateOptions(transformRecordToOption(saleTypeRecord));

// 限购类型
export const limitTypeRecord: Record<Api.SystemManage.limitType, App.I18n.I18nKey> = {
  0: 'page.manage.Gems.limittype.none',
  1: 'page.manage.Gems.limittype.dailyLimit',
  2: 'page.manage.Gems.limittype.weeklyLimit',
  3: 'page.manage.Gems.limittype.monthlyLimit',
  4: 'page.manage.Gems.limittype.account',
  5: 'page.manage.Gems.limittype.server',
  6: 'page.manage.Gems.limittype.character',
  7: 'page.manage.Gems.limittype.accountLimit',
  8: 'page.manage.Gems.limittype.accountDailyLimit',
  9: 'page.manage.Gems.limittype.accountWeeklyLimit',
  10: 'page.manage.Gems.limittype.accountMonthlyLimit',
  11: 'page.manage.Gems.limittype.serverLimit',
  12: 'page.manage.Gems.limittype.serverDailyLimit',
  13: 'page.manage.Gems.limittype.serverWeeklyLimit',
  14: 'page.manage.Gems.limittype.serverMonthlyLimit',
  15: 'page.manage.Gems.limittype.characterLimit',
  16: 'page.manage.Gems.limittype.characterDailyLimit',
  17: 'page.manage.Gems.limittype.characterWeeklyLimit',
  18: 'page.manage.Gems.limittype.characterMonthlyLimit',
  19: 'page.manage.Gems.limittype.exchange1CharacterLimit',
  20: 'page.manage.Gems.limittype.exchange2ServerLimit',
  21: 'page.manage.Gems.limittype.exchange2ServerDailyLimit',
  22: 'page.manage.Gems.limittype.exchange2CharacterLimit',
  23: 'page.manage.Gems.limittype.exchange2CharacterDailyLimit',
  24: 'page.manage.Gems.limittype.scheduleLimit',
  25: 'page.manage.Gems.limittype.endEnum',
};

export const limitTypeOptions = translateOptions(transformRecordToOption(limitTypeRecord));

// 商品上架状态
export const productSaleStatusRecord: Record<Api.SystemManage.HideInClient, App.I18n.I18nKey> = {
  'false': 'page.manage.Gems.productstatus.Visible',     // 显示
  'true': 'page.manage.Gems.productstatus.Hidden',   // 隐藏
};

export const productSaleStatusOptions = translateOptions(transformRecordToOption(productSaleStatusRecord));

// 是否周显示
export const saleWeekTypeRecord: Record<Api.SystemManage.saleWeekType, App.I18n.I18nKey> = {
  true: 'page.manage.Gems.weekdays.yes',
  false: 'page.manage.Gems.weekdays.no',
};

export const saleWeekTypeOptions = translateOptions(transformRecordToOption(saleWeekTypeRecord));

// 是否开启折扣
export const discountRateRecord: Record<Api.SystemManage.discountRate, App.I18n.I18nKey> = {
  '1': 'page.manage.Gems.weekdays.yes',
  '0': 'page.manage.Gems.weekdays.no',
};
export const discountRateOptions = translateOptions(transformRecordToOption(discountRateRecord));

// 服务器类型
export const serverTypeCategoryRecord: Record<Api.SystemManage.ServerTypeCategory, App.I18n.I18nKey> = {
  'NORMAL': 'page.manage.serveritem.serverTypeCategory.normal',
  'CROSS': 'page.manage.serveritem.serverTypeCategory.cross',
  'MERGE': 'page.manage.serveritem.serverTypeCategory.merge',
};
export const serverTypeCategoryOptions = translateOptions(transformRecordToOption(serverTypeCategoryRecord));

// 定义根目录
export const rootDirectoryRecord: Record<Api.SystemManage.RootDirectory, App.I18n.I18nKey> = {
  'table': 'page.manage.serverFile.rootDirectory.table',
  'script': 'page.manage.serverFile.rootDirectory.script',
  'script/cabin': 'page.manage.serverFile.rootDirectory.script_cabin',
  'script/common': 'page.manage.serverFile.rootDirectory.script_common',
  'script/config_tables': 'page.manage.serverFile.rootDirectory.script_config_tables',
  'script/framework': 'page.manage.serverFile.rootDirectory.script_framework',
  'script/header': 'page.manage.serverFile.rootDirectory.script_header',
  'script/hotfix': 'page.manage.serverFile.rootDirectory.script_hotfix',
  'script/proto': 'page.manage.serverFile.rootDirectory.script_proto',
  'script/rebot': 'page.manage.serverFile.rootDirectory.script_rebot',
  'script/scheduler': 'page.manage.serverFile.rootDirectory.script_scheduler',
  'script/test_client': 'page.manage.serverFile.rootDirectory.script_test_client',
  'script/test_server': 'page.manage.serverFile.rootDirectory.script_test_server',
  'script/world': 'page.manage.serverFile.rootDirectory.script_world',
};

export const rootDirectoryOptions = translateOptions(transformRecordToOption(rootDirectoryRecord));

// 订单状态
export const orderStatusRecord: Record<Api.SystemManage.OrderStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.orders.Status.success',     // 支付成功
  '1': 'page.manage.orders.Status.pending',     // 待支付
  '2': 'page.manage.orders.Status.failed',      // 支付失败
  '3': 'page.manage.orders.Status.processing',  // 发货中
  '4': 'page.manage.orders.Status.shipped',     // 已发货
  '5': 'page.manage.orders.Status.cancelled',   // 已完成
  '6': 'page.manage.orders.Status.pendingReplenish',     // 待补单

};
export const orderStatusOptions = translateOptions(transformRecordToOption(orderStatusRecord));

// 订单回调状态
export const callbackStatusRecord: Record<Api.SystemManage.callbackStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.orders.CallbackStatus.success',     // 待处理
  '1': 'page.manage.orders.CallbackStatus.failed',      // 处理成功
  '2': 'page.manage.orders.CallbackStatus.processing',  // 处理失败
};
export const callbackStatusOptions = translateOptions(transformRecordToOption(callbackStatusRecord));

// 区服活动状态
export const serverActivityStatusRecord: Record<Api.SystemManage.serverState, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.serverState.null',
  '1': 'page.manage.serveractivity.serverState.preshow',
  '2': 'page.manage.serveractivity.serverState.showing',
  '3': 'page.manage.serveractivity.serverState.endshow',
  '4': 'page.manage.serveractivity.serverState.preopen',
  '5': 'page.manage.serveractivity.serverState.openning',
  '6': 'page.manage.serveractivity.serverState.endopen',
  '7': 'page.manage.serveractivity.serverState.closed',
  '8': 'page.manage.serveractivity.serverState.remove',
}
export const serverActivityStatusOptions = translateOptions(transformRecordToOption(serverActivityStatusRecord));

// 活动大类型
export const activityBigTypeRecord: Record<Api.SystemManage.activityBigType, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.activitytype.bigtype.null',
  '1': 'page.manage.serveractivity.activitytype.bigtype.system',
  '2': 'page.manage.serveractivity.activitytype.bigtype.rank',
  '3': 'page.manage.serveractivity.activitytype.bigtype.task',
  '4': 'page.manage.serveractivity.activitytype.bigtype.map',
  '5': 'page.manage.serveractivity.activitytype.bigtype.shop',
  '6': 'page.manage.serveractivity.activitytype.bigtype.income',
};
export const activityBigTypeOptions = translateOptions(transformRecordToOption(activityBigTypeRecord));

// 活动小类型 - 排行榜
export const activitySmallTypeRankRecord: Record<Api.SystemManage.activitySmallTypeRank, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.activitytype.smalltype_rank.null',
  '1': 'page.manage.serveractivity.activitytype.smalltype_rank.zhanli',
};
export const activitySmallTypeRankOptions = translateOptions(transformRecordToOption(activitySmallTypeRankRecord));

// 活动小类型 - 任务
export const activitySmallTypeTaskRecord: Record<Api.SystemManage.activitySmallTypeTask, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.activitytype.smalltype_task.null',
  '1': 'page.manage.serveractivity.activitytype.smalltype_task.xinshouqiri',
  '2': 'page.manage.serveractivity.activitytype.smalltype_task.dengjijiangli',
  '3': 'page.manage.serveractivity.activitytype.smalltype_task.renwudacheng',
  '4': 'page.manage.serveractivity.activitytype.smalltype_task.shouchonghuodong',
  '5': 'page.manage.serveractivity.activitytype.smalltype_task.leichonghuodong',
  '6': 'page.manage.serveractivity.activitytype.smalltype_task.tongxinzhen',
};
export const activitySmallTypeTaskOptions = translateOptions(transformRecordToOption(activitySmallTypeTaskRecord));

// 活动小类型 - 地图
export const activitySmallTypeMapRecord: Record<Api.SystemManage.activitySmallTypeMap, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.activitytype.smalltype_map.null',
  '1': 'page.manage.serveractivity.activitytype.smalltype_map.flush_monster',
  '2': 'page.manage.serveractivity.activitytype.smalltype_map.flush_npc',
};
export const activitySmallTypeMapOptions = translateOptions(transformRecordToOption(activitySmallTypeMapRecord));

// 活动小类型 - 商城
export const activitySmallTypeShopRecord: Record<Api.SystemManage.activitySmallTypeShop, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.activitytype.smalltype_shop.null',
  '1': 'page.manage.serveractivity.activitytype.smalltype_shop.monster',
  '2': 'page.manage.serveractivity.activitytype.smalltype_shop.npc',
};
export const activitySmallTypeShopOptions = translateOptions(transformRecordToOption(activitySmallTypeShopRecord));

// 活动小类型 - 收益
export const activitySmallTypeIncomeRecord: Record<Api.SystemManage.activitySmallTypeIncome, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.activitytype.smalltype_income.null',
  '1': 'page.manage.serveractivity.activitytype.smalltype_income.shouyizengjia',
};
export const activitySmallTypeIncomeOptions = translateOptions(transformRecordToOption(activitySmallTypeIncomeRecord));

// 活动小类型 - 活动类型
export const activitySmallTypeSystemRecord: Record<Api.SystemManage.activitySmallTypeShopActivity, App.I18n.I18nKey> = {
  '0': 'page.manage.serveractivity.activitytype.smalltype_system.null',
  '1': 'page.manage.serveractivity.activitytype.smalltype_system.shangcheng',
  '2': 'page.manage.serveractivity.activitytype.smalltype_system.meirixiangou',
};
export const activitySmallTypeActivityOptions = translateOptions(transformRecordToOption(activitySmallTypeSystemRecord));

// 解锁类型
export const unlockTypeRecord: Record<Api.SystemManage.unlockType, App.I18n.I18nKey> = {
  '1': 'page.manage.questionnaire.unlocktype.level',
};
export const unlockTypeOptions = translateOptions(transformRecordToOption(unlockTypeRecord));

// 问卷状态
export const questionnaireStatusRecord: Record<Api.SystemManage.questionnaireStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.questionnaire.questionnaireStatus.close',   //关闭
  '1': 'page.manage.questionnaire.questionnaireStatus.open',   //开启
};
export const questionnaireStatusOptions = translateOptions(transformRecordToOption(questionnaireStatusRecord));

/*礼包活动配置 */
// 礼包类型状态 1是通码 2是专码
export const giftActivityTypeRecord: Record<Api.SystemManage.giftType, App.I18n.I18nKey> = {
  '1': 'page.manage.giftactivity.giftType.common',
  '2': 'page.manage.giftactivity.giftType.special',
};
export const giftActivityTypeOptions = translateOptions(transformRecordToOption(giftActivityTypeRecord));

// 渠道和区服枚举 0是全部 1是列表
export const scopeTypeRecord: Record<Api.SystemManage.scopeType, App.I18n.I18nKey> = {
  '0': 'page.manage.giftactivity.scopeType.all',
  '1': 'page.manage.giftactivity.scopeType.list',
};
export const scopeTypeOptions = translateOptions(transformRecordToOption(scopeTypeRecord));

// 礼包活动状态 状态：1=启用；2=停用；3=归档
export const giftActivityStatusRecord: Record<Api.SystemManage.giftActivityStatus, App.I18n.I18nKey> = {
  '1': 'page.manage.giftactivity.giftActivityStatus.enable',
  '2': 'page.manage.giftactivity.giftActivityStatus.disable',
  '3': 'page.manage.giftactivity.giftActivityStatus.archive',
};
export const giftActivityStatusOptions = translateOptions(transformRecordToOption(giftActivityStatusRecord));

// 批次状态
export const giftBatchStatusRecord: Record<Api.SystemManage.giftBatchStatus, App.I18n.I18nKey> = {
  '0': 'page.manage.gitcodeBachController.giftBatchStatus.initial',
  '1': 'page.manage.gitcodeBachController.giftBatchStatus.generating',
  '2': 'page.manage.gitcodeBachController.giftBatchStatus.completed',
  '3': 'page.manage.gitcodeBachController.giftBatchStatus.cancelled',
};
export const giftBatchStatusOptions = translateOptions(transformRecordToOption(giftBatchStatusRecord));


