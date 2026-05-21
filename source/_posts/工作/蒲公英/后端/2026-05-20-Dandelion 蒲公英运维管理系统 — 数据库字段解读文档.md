---
title: 蒲公英运维管理系统 — 数据库字段解读文档
categories:
  - 工作
  - 蒲公英
  - 后端
tags:
  - 蒲公英
  - 后端
abbrlink: 806205746
date: 2026-05-20 00:00:00
---

# Dandelion 蒲公英运维管理系统 — 数据库字段解读文档

> 基于 RuoYi-Vue 框架  
> 技术栈: Spring Boot 3.3 / MyBatis-Plus / MySQL 8.0 / Flyway  
> 数据来源: 测试库 dandelion_test（172.16.1.7）

---

## 目录

- [1. 基础框架表](#1-基础框架表)
  - [1.1 sys_user](#11-sys_user--系统用户) / [1.2 sys_role](#12-sys_role--系统角色) / [1.3 sys_menu](#13-sys_menu--系统菜单) / [1.4 sys_dept](#14-sys_dept--部门表)
- [2. 事件工单 (event)](#2-事件工单-event)
  - [2.1 event 主表](#21-event--事件主表) / [2.2 sub_event](#22-sub_event--子事件) / [2.3 todo_list](#23-todo_list--待办列表) / [2.4 time_line](#24-time_line--时间轴) / [2.5 process_relation](#25-process_relation--流程关联关系)
- [3. 变更流程 (change_process)](#3-变更流程-change_process)
- [4. 问题管理 (problem)](#4-问题管理-problem)
- [5. 需求管理 (demand)](#5-需求管理-demand)
- [6. 通知公告 (notice)](#6-通知公告-notice)
- [7. SLA 排班](#7-sla-排班)
  - [7.1 sla_schedule](#71-sla_schedule--班次) / [7.2 group_schedule](#72-group_schedule--小组绑定班次) / [7.3 sla_plan](#73-sla_plan--排班计划) / [7.4 holiday_calendar](#74-holiday_calendar--节假日)
- [8. 日历计划 (calendar)](#8-日历计划-calendar)
- [9. 巡检管理](#9-巡检管理)
- [10. 交接日志 (handover_info)](#10-交接日志-handover_info)
- [11. 资源管理 (resource_info)](#11-资源管理-resource_info)
- [12. 表单系统](#12-表单系统)
- [13. 运维辅助表](#13-运维辅助表)
- [14. CMDB 云资源表](#14-cmdb-云资源表)
- [15. 字典值与枚举对照表](#15-字典值与枚举对照表)
  - [15.1 ProcessStatus](#151-processstatus--状态映射) / [15.2 流程类型](#152-流程类型) / [15.3 流程节点](#153-流程节点) / [15.4 影响度](#154-影响度) / [15.5 事件来源](#155-事件来源映射-eventsourceenum) / [15.6 紧急度/影响度](#156-紧急度影响度映射-eventurgencyenum) / [15.7 级别计算](#157-事件级别计算表) / [15.8 操作类型映射](#158-操作类型映射--团队-1-完整-34-条) / [15.9 维修类别](#159-维修类别映射) / [15.10 字段类型](#1510-字段类型枚举)

---

## 1. 基础框架表

### 1.1 sys_user — 系统用户
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | bigint(20) | 用户ID |
| tenant_id | bigint(20) | 租户ID（多租户隔离） |
| dept_id | bigint(20) | 部门ID |
| account_id | bigint(20) | 账号ID（关联 sys_account） |
| user_name | varchar(30) | 用户登录名 |
| nick_name | varchar(30) | **用户昵称**（事件中显示为处理人名称） |
| user_type | varchar(10) | 用户类型（00:系统用户 01:管理员） |
| email | varchar(50) | 邮箱（加密存储） |
| phonenumber | varchar(11) | 手机号码 |
| sex | char(1) | 性别（0男 1女 2未知） |
| password | varchar(100) | 密码（BCrypt加密） |
| status | char(1) | 状态（0正常 1停用） |
| del_flag | char(1) | 删除标志（0存在 2删除） |
| login_ip | varchar(128) | 最后登录IP |
| login_date | datetime | 最后登录时间 |

### 1.2 sys_role — 系统角色
| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | bigint(20) | 角色ID |
| tenant_id | bigint(20) | 租户ID |
| role_name | varchar(30) | 角色名称 |
| role_key | varchar(100) | 角色权限字符串 |
| role_sort | int(4) | 显示顺序 |
| data_scope | char(1) | 数据范围（1全部 2本部门 3本部门及以下 4仅本人） |
| status / del_flag | char(1) | 状态/删除标志 |

### 1.3 sys_menu — 系统菜单
| 字段 | 类型 | 说明 |
|------|------|------|
| menu_id | bigint(20) | 菜单ID |
| menu_name | varchar(50) | 菜单名称 |
| parent_id | bigint(20) | 父菜单ID |
| path | varchar(200) | 路由地址 |
| component | varchar(255) | 组件路径 |
| perms | varchar(100) | **权限标识**（关联 @PreAuthorize 注解） |
| menu_type | char(1) | 菜单类型（M目录 C菜单 F按钮） |
| visible / status | char(1) | 显示状态/菜单状态 |

### 1.4 sys_dept — 部门表
| 字段 | 类型 | 说明 |
|------|------|------|
| dept_id | bigint(20) | 部门ID |
| parent_id | bigint(20) | 父部门ID |
| ancestors | varchar(50) | 祖级列表 |
| dept_name | varchar(30) | 部门名称 |
| order_num | int(4) | 显示顺序 |
| leader | varchar(20) | 负责人 |
| phone | varchar(11) | 联系电话 |
| status / del_flag | char(1) | 状态/删除标志 |

### 1.5 sys_config — 参数配置
| 字段 | 类型 | 说明 |
|------|------|------|
| config_id | int(5) | 参数主键 |
| config_name | varchar(100) | 参数名称 |
| config_key | varchar(100) | 参数键名 |
| config_value | varchar(500) | **参数键值** |
| config_type | char(1) | 内置（Y是 N否） |

### 1.6 sys_dict_type — 字典类型
| 字段 | 类型 | 说明 |
|------|------|------|
| dict_id | bigint(20) | 字典主键 |
| dict_name | varchar(100) | 字典名称 |
| dict_type | varchar(100) | **字典类型标识** |

### 1.7 sys_dict_data — 字典数据
| 字段 | 类型 | 说明 |
|------|------|------|
| dict_code | bigint(20) | 字典编码 |
| dict_label | varchar(100) | **字典标签**（显示用） |
| dict_value | varchar(100) | **字典键值**（存入数据库的值） |
| dict_type | varchar(100) | **字典类型** |

### 1.8 sys_notice — 通知公告
| 字段 | 类型 | 说明 |
|------|------|------|
| notice_id | int(10) | 公告ID |
| notice_title | varchar(50) | 公告标题 |
| notice_type | char(1) | 公告类型（1通知 2公告） |

### 1.9 sys_oper_log — 操作日志
| 字段 | 类型 | 说明 |
|------|------|------|
| oper_id | bigint(20) | 日志主键 |
| title | varchar(50) | 模块标题 |
| business_type | int(2) | 业务类型（0其它 1新增 2修改 3删除） |
| oper_name | varchar(50) | 操作人员 |
| oper_url | varchar(255) | 请求URL |
| status | int(1) | 操作状态（0正常 1异常） |
| cost_time | bigint(20) | 消耗时间（毫秒） |

### 1.10 sys_logininfor — 登录日志
| 字段 | 类型 | 说明 |
|------|------|------|
| info_id | bigint(20) | 访问ID |
| user_name | varchar(50) | 用户账号 |
| ipaddr | varchar(128) | 登录IP |
| status | char(1) | 登录状态（0成功 1失败） |

### 1.11 sys_file — 文件表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 文件ID |
| name / origin_name | varchar(255) | 显示名/原始名 |
| md5 | varchar(32) | 文件 MD5 |
| size | bigint(20) | 文件大小（字节） |
| bucket / path | varchar(500) | 存储桶/路径 |

### 1.12 tenant — 租户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 租户ID |
| name | varchar(100) | 客户名称 |
| alias_name | varchar(100) | 客户简称 |
| status | char(1) | 状态（0正常 1停用） |
| event_version | varchar(20) | 事件版本（fast极速版/full完整版） |

### 1.13 team / team_user — 团队
| 字段 | 类型 | 说明 |
|------|------|------|
| team.id | bigint(20) | 团队ID |
| team.name | varchar(255) | 团队名称 |
| team_user.user_id | bigint(20) | 成员用户ID |
| team_user.is_leader | tinyint(1) | 是否团队负责人 |

---

## 2. 事件工单 (event)

### 2.1 event — 事件主表
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | bigint(20) | PK | 主键ID |
| instance_id | varchar(255) | 自动 | **工单编号**，格式: I{yyyyMMdd}{当日序号} |
| tenant_id | int(11) | 是 | **租户ID** |
| team_id | int(11) | - | **所属团队ID** |
| requester_name | varchar(255) | - | **需求方姓名** |
| requester_phone | varchar(255) | - | 需求方手机号 |
| requester_email | varchar(255) | - | 需求方邮箱 |
| machine_room_id | int(11) | - | 机房ID |
| machine_room_name | varchar(255) | - | **机房名称** |
| positioning | varchar(255) | - | 打卡定位信息 |
| authorizer | int(11) | - | 授权人（用户ID） |
| **type** | **varchar(255)** | - | **操作类型**（见 15.8 tree_dict 映射） |
| **source** | **varchar(255)** | - | **事件来源**（0=业务需求 1=故障修复 2=功能优化 3=安全加固） |
| expected_time | datetime | - | 期望完成时间 |
| ticket_create_time | datetime | - | **建单时间/开始时间** |
| **urgency** | **int(11)** | - | **紧急度**（1=低 2=中 3=高） |
| **impact** | **int(11)** | - | **影响度**（1=低 2=中 3=高） |
| **level** | **int(11)** | 自动 | **事件等级**（公式: 6-urgency-impact） |
| topic | text | - | **事件标题** |
| description | longtext | - | **事件描述** |
| handle_team_id | int(11) | - | 处理团队ID |
| **handler** | **int(11)** | - | **处理人**（用户ID，不是名字！） |
| **status** | **int(11)** | 自动 | **状态**（见 15.1 ProcessStatus） |
| use_time | int(11) | - | 用时（毫秒） |
| **complete_time** | **datetime** | - | **完成时间/结束时间** |
| notice_type | int(11) | - | 通知类型 |
| notice_nodes | varchar(500) | - | 通知节点 |
| notice_users | varchar(500) | - | 通知用户 |
| extra_notice_users | varchar(500) | - | 额外通知用户 |
| fix_type | varchar(255) | - | 维修类别 |
| assist_users | varchar(500) | - | **协同人**（逗号分隔用户ID） |
| del_flag | tinyint(4) | 0 | 删除标志 |
| create_by | bigint(20) | 是 | **创建人/填报人**（用户ID） |
| create_time | datetime | 是 | **创建时间/填报时间** |
| update_time | datetime | - | **最后操作时间** |

### 2.2 sub_event — 子事件
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| event_id | bigint(20) | 主事件ID |
| handle_team_id | varchar(255) | 处理团队 |
| handler | varchar(255) | 处理人 |
| description | varchar(255) | 处理描述 |

### 2.3 todo_list — 待办列表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| record_id | int(11) | 关联记录ID |
| type | varchar(255) | 类型（event/change/demand） |
| solver | varchar(255) | **执行人**（用户ID） |
| process_node | int(11) | **流程节点**（1申请 2审批 3实施 4测试 5复核 6完成） |

### 2.4 time_line — 时间轴
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| type | varchar(255) | 记录类型（event/change） |
| record_id | int(11) | 关联记录ID |
| assigner | varchar(255) | 操作人 |
| status | int(11) | 操作状态 |
| remark | text | 操作备注 |
| attachment | varchar(255) | 附件路径 |

### 2.5 process_relation — 流程关联关系
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| process_type | varchar(255) | 流程类型（event/change/demand） |
| process_id | int(11) | 流程ID |
| type | varchar(255) | 关联类型（file/demand/order等） |
| source | varchar(255) | 关联数据 |

---

## 3. 变更流程 (change_process)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| instance_id | varchar(255) | 流程编号 |
| tenant_id / team_id | int(11) | 租户ID/团队ID |
| topic | varchar(255) | 主题/标题 |
| urgency / impact | int(11) | 紧急度/影响度 |
| level | int(11) | 变更级别 |
| operation_type | int(11) | 操作分类 |
| source | int(11) | 变更来源 |
| nature | int(11) | 变更性质 |
| env | varchar(255) | 变更环境 |
| start_time / end_time | datetime | 计划实施起止时间 |
| reason_purpose / verity_scheme | longtext | 原因目的/验证方案 |
| operation_step / rollback_scheme | longtext | 操作步骤/回退方案 |
| risk_impact / cooperate_resource | longtext | 风险影响/配合资源 |
| status | int(11) | 状态 |
| promoter / approver | int(11) | 申请人/审批人 |
| implementer / tester / reviewer | int(11) | 实施人/测试人/复核人 |
| notice_type / notice_nodes | - | 通知设置 |

### sub_change_process — 子变更
| 字段 | 类型 | 说明 |
|------|------|------|
| process_id | int(11) | 变更ID |
| operation_type | varchar(255) | 操作分类 |
| content | longtext | 内容 |
| implementer / reviewer | varchar(255) | 实施人/复核人 |

---

## 4. 问题管理 (problem)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| instance_id / tenant_id | - | 流程编号/租户ID |
| topic | varchar(255) | 问题标题 |
| description | longtext | 问题描述 |
| handler | varchar(255) | 处理人 |
| source / status / level | int(11) | 来源/状态/等级 |

---

## 5. 需求管理 (demand)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id / team_id | int(11) | 租户ID/团队ID |
| requester_name / phone / email | - | 需求方信息 |
| expected_time | datetime | 期望完成时间 |
| topic / description | text | 标题/描述 |
| type / status | varchar/ int | 类型/状态 |

---

## 6. 通知公告 (notice)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键 |
| tenant_id | int(11) | 租户ID |
| notice_type | int(11) | 公告类型（0平台 1租户） |
| topic | text | 主题 |
| description | longtext | 内容 |
| notice_tag | varchar(255) | 公告标签 |
| publish_time | datetime | 发布时间 |

### notice_user
| 字段 | 类型 | 说明 |
|------|------|------|
| notice_id | bigint(20) | 公告ID |
| account_id | bigint(20) | 账号ID |

---

## 7. SLA 排班

### 7.1 sla_schedule — 班次
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| name | varchar(128) | 班次名称 |
| start_time / end_time | time | 起止时间 |
| effective_from / to | date | 生效日期范围 |

### 7.2 group_schedule — 小组绑定班次
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| group_id | bigint(20) | 小组ID |
| schedule_id | bigint(20) | 班次ID |
| plan_id | bigint(20) | 计划ID |

### 7.3 sla_plan — 排班计划
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| name | varchar(128) | 计划名称 |
| cycle | int(11) | 循环天数 |
| effective_from / to | date | 计划日期范围 |
| status | int(11) | 状态（0启用 1停用） |

### 7.4 holiday_calendar — 节假日
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| date | date | 日期（唯一） |
| is_workday | tinyint(1) | 是否工作日 |

---

## 8. 日历计划 (calendar)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键 |
| plan_date | date | 计划日期 |
| plan_time | time | 计划时间 |
| address | varchar(255) | 地点 |
| plan_title | varchar(255) | 标题 |
| participants | text | 参与者 |

---

## 9. 巡检管理

### 9.1 inspections — 巡检记录
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| inspection_date | date | 巡检日期 |
| user_id | bigint(20) | 巡检人 |
| machine_room_id | int(11) | 机房编号 |
| device_id | bigint(20) | 设备编号 |
| temperature / humidity | varchar(50) | 温度/湿度 |

### 9.2 motor_room — 电机机房
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| motor_room_name | varchar(500) | 机房名称 |
| address | varchar(500) | 地址 |

### 9.3 motor_devices / inspection_task_config / inspection_motor_task
| 表名 | 说明 |
|------|------|
| motor_devices | 电机设备（device_id, motor_room_id, device_sort） |
| inspection_task_config | 巡检任务配置（config_name, 巡检间隔, 巡检内容） |
| inspection_motor_task | 电机巡检任务（关联配置, 机房, 巡检人, 完成时间） |

### 9.4 on_sit_inspections — 现场巡检
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| task_id | int(11) | 任务ID |
| device_id / device_name | - | 设备 |
| content_data | text | 巡检数据 |

### 9.5 inspection_email — 巡检邮件配置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| email | varchar(255) | 邮箱地址 |

---

## 10. 交接日志 (handover_info)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键 |
| present_user | bigint(20) | **当前用户/交班人** |
| handover | bigint(20) | **接班人** |
| handover_time | datetime | **交接时间** |
| description | longtext | 交接内容 |
| summary | longtext | 工作小结 |

---

## 11. 资源管理 (resource_info)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 资源ID |
| name | varchar(255) | 资源名称 |
| code | varchar(255) | **资源编码**（团队内唯一） |
| family | varchar(255) | 资源类型 |
| owner | varchar(64) | 维护责任人 |
| extra_columns | longtext | **额外字段**（JSON） |

---

## 12. 表单系统

### 12.1 form — 用户自建表单
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 表单ID |
| name | varchar(100) | 表单名称 |
| template_type | varchar(100) | 模板类型（resource/inspection） |

### 12.2 form_column — 表单字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| form_id | bigint(20) | 表单ID |
| label | varchar(255) | 字段名称 |
| value | varchar(255) | **字段标识**（extra_columns 的 key） |
| type | int(11) | **字段类型**（见 15.10） |
| required | char(1) | 必填 |
| options | text | 选项（JSON） |

### 12.3 form_common_column — 公共字段池 / form_template — 模板
| 表 | 说明 |
|----|------|
| form_common_column | 公共字段（template_type, label, value, type, default_options） |
| form_template | 模板定义（name, type 唯一） |

---

## 13. 运维辅助表

### 13.1 work_group / work_group_user — 工作小组
| 字段 | 类型 | 说明 |
|------|------|------|
| group.id | bigint(20) | 小组ID |
| group.name | varchar(64) | 小组名称（租户内唯一） |
| user.user_id | bigint(20) | 成员用户ID |
| user.is_leader | tinyint(4) | 是否组长 |

### 13.2 skill_group — 技能组
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| name / code | varchar(255) | 名称/编码 |
| status | char(1) | 状态 |

### 13.3 requester — 需求方 / user_session — 会话
| 表 | 说明 |
|----|------|
| requester | 需求方(name, phone, email) |
| user_session | 用户会话(user_id, tenant_id, session_id) |

### 13.4 czxy_change — 七宝变更
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| demander | varchar(255) | 需求方 |
| device_sns | varchar(500) | 设备SN列表 |
| device_type | varchar(255) | 设备类型 |
| operate_type | varchar(255) | 操作类型 |
| operate_content | text | 操作内容 |
| issuing_time / closing_time | datetime | 下发/关闭时间 |

### 13.5 rpa / rpa_log — RPA 自动化
| 字段 | 类型 | 说明 |
|------|------|------|
| scene | varchar(255) | 场景 |
| run_count / fail_count | int(11) | 运行/失败次数 |
| fail_reasons | text | 失败原因 |

### 13.6 daily_report / construction_order / asset_overview_config
| 表 | 说明 |
|----|------|
| daily_report | 日报(type, inspection_date, description) |
| construction_order | 施工单(promoter, start_time, end_time) |
| asset_overview_config | 资产概览(room/device/cabinet count) |

---

## 14. CMDB 云资源表

### 14.1 cmdb_asset_main — 资产主表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| asset_id | varchar(255) | **资产ID** |
| asset_type | varchar(255) | **资产类型**（ecs/redis/mysql/elb） |
| asset_name | varchar(255) | 资产名称 |
| cloud_resource_id | varchar(255) | 云资源ID |
| project_id / region / az_name | - | 项目/地域/可用区 |
| status | varchar(50) | 状态 |
| owner / department | - | 所有者/部门 |
| sync_time | datetime | 同步时间 |

### 14.2 cmdb_asset_account — 云账号
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| alias | varchar(255) | 账号别名 |
| ak / sk | varchar(500) | Access Key / Secret Key |
| type | varchar(50) | 类型（ctyun/aliyun） |

### 14.3 cmdb_ecs_instance_detail — ECS 实例
| 字段 | 类型 | 说明 |
|------|------|------|
| instance_id | varchar(255) | 实例ID |
| display_name | varchar(255) | 显示名称 |
| os_type | varchar(255) | 操作系统 |
| instance_status | varchar(255) | 状态 |
| private_ip | varchar(255) | 内网IP |

### 14.4 cmdb_ctyun_redis_details — 天翼云 Redis
| 字段 | 类型 | 说明 |
|------|------|------|
| instance_id | varchar(255) | 实例ID |
| instance_name | varchar(255) | 实例名称 |
| vip / vip_port | - | VIP地址/端口 |
| capacity | int(11) | 容量 |
| engine_version | varchar(255) | 引擎版本 |

### 14.5 cmdb_ctyun_mysql_details — 天翼云 MySQL
| 字段 | 类型 | 说明 |
|------|------|------|
| instance_id | varchar(255) | 实例ID |
| vip / write_port | - | 内网VIP/写端口 |
| machine_spec | varchar(255) | 规格 |
| disk_size | int(11) | 磁盘大小 |

### 14.6 其他 CMDB 表
| 表名 | 说明 |
|------|------|
| cmdb_ctyun_level2_ecs_details | 二级 ECS 详情 |
| cmdb_ctyun_elb_details | ELB 详情 |
| cmdb_ty_cloud_resource_count | 云资源计数 |
| cmdb_asset_property_change_log | 资产变更日志 |
| cmdb_asset_user_mapping | 资产用户映射 |
| cmdb_group / cmdb_group_member | CMDB 分组/成员 |
| cmdb_search_condition | 搜索条件 |
| cmdb_resource_tag | 资源标签 |
| cmdb_table_header | 表格列头 |

---

## 15. 字典值与枚举对照表

> 数据来源: 测试库 dandelion_test 实际查询 + 代码枚举

### 15.1 ProcessStatus — 状态映射
dict_type = 'process_status'

| code | label | 说明 | 事件数 |
|------|-------|------|--------|
| 1 | 起草中 | DRAFT | 209 |
| 2 | 待审核 | APPROVAL | 30 |
| 3 | 待处理 | PENDING_PROCESSING | 443 |
| 4 | 已驳回 | REJECTED | 7 |
| 5 | 处理中 | PROCESSING | 207 |
| 6 | 暂停中 | PAUSING | 36 |
| 7 | 待测试 | PENDING_TESTING | - |
| 8 | 测试中 | TESTING | - |
| 9 | 待复核 | PENDING_REVIEWING | - |
| 10 | 复核中 | REVIEWING | 1 |
| 11 | 处理失败 | FAILED | 26 |
| 12 | 已重开 | REOPENED | - |
| **13** | **已完成** | **CLOSED** | **6173** |
| 14 | 已取消 | CANCELLED | - |

### 15.2 流程类型
| code | label |
|------|-------|
| event | 事件 |
| change | 变更 |
| problem | 问题 |

### 15.3 流程节点
| code | label |
|------|-------|
| 1 | 申请 |
| 2 | 审批 |
| 3 | 实施 |
| 4 | 测试 |
| 5 | 复核 |
| 6 | 完成 |

### 15.4 影响度
| code | label |
|------|-------|
| 1 | 低 |
| 2 | 中 |
| 3 | 高 |

### 15.5 事件来源映射 (EventSourceEnum)
| code | label | 使用量 |
|------|-------|--------|
| **0** | **业务需求** | 2583 |
| **1** | **故障修复** | 1852 |
| 2 | 功能优化 | 124 |
| 3 | 安全加固 | 103 |

### 15.6 紧急度/影响度映射 (EventUrgencyEnum)
| code | label | urgency 使用 | impact 使用 |
|------|-------|-------------|-------------|
| 1 | 低 | 2311 | 3616 |
| 2 | 中 | 1593 | 224 |
| 3 | 高 | 730 | 793 |

### 15.7 事件级别计算表
公式: **level = 6 - (urgency + impact)**

| urgency | impact | sum | level | 级别 |
|---------|--------|-----|-------|------|
| 1(低) | 1(低) | 2 | 4 | P4 |
| 1(低) | 2(中) | 3 | 3 | P3 |
| 2(中) | 1(低) | 3 | 3 | P3 |
| 2(中) | 2(中) | 4 | 2 | P2 |
| 2(中) | 3(高) | 5 | 1 | P1 |
| 3(高) | 2(中) | 5 | 1 | P1 |
| 3(高) | 3(高) | 6 | 0 | P0 |

### 15.8 操作类型映射 — 团队 1 完整 34 条
tree_dict_data: type='event_type', team_id=1

API 调用时 `type` 字段传左侧 code：

| code | 名称 |
|------|------|
| 01 | 客户服务 |
| 0101 | 设备查看 |
| 0102 | 设备上架 |
| 0103 | 设备替换 |
| 0104 | 设备寄出 |
| 0105 | 远程协助 |
| **0106** | **驻场陪同第三方人员随工** |
| 0107 | 陪同信网巡检机房 |
| 0108 | 机房清洁 |
| 0109 | 前台接人员入室 |
| 0110 | 设备下架 |
| 0111 | 设备接收 |
| 02 | 仓库管理 |
| 0201 | 设备入库 |
| 0202 | 设备出库 |
| 0203 | 设备更换 |
| 0204 | 设备寄出 |
| 0205 | 设备接收 |
| 0206 | 耗材线缆入库 |
| 0207 | 耗材线缆出库 |
| 03 | 故障维修 |
| 0301 | 光模块拔插 |
| 0302 | 光模块更换 |
| 0303 | 光模块清洁 |
| 0304 | 网卡拔插 |
| 0305 | 线缆更换 |
| 0306 | 线缆交叉测试 |
| 0307 | 硬盘拔插 |
| 0308 | 测试 |
| 05 | 服务器维修 |
| 06 | 资产管理 |
| QBTS0501 | 同机房放线 |
| QBTS0502 | 跨机房放线 |
| QBTS0503 | 跨楼层放线 |

### 15.9 维修类别映射
tree_dict_data: type='fix_type'

| code | label |
|------|-------|
| 01 | 设备 |
| 02 | 线路 |
| 03 | 人为 |
| 04 | 其他 |

### 15.10 字段类型枚举
form_column.type

| code | 字段类型 |
|------|---------|
| 1 | 文本 |
| 2 | 数字 |
| 3 | 单选框 |
| 4 | 多选框 |
| 5 | 下拉菜单 |
| 6 | 日期 |
| 7 | 人员 |
| 8 | 团队 |
| 9 | 级联菜单 |

---

*文档生成时间: 2026-05-20*  
*数据来源: 测试库 dandelion_test 实际查询 + 代码枚举扫描*
