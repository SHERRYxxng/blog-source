---
title: Dandelion 蒲公英运维管理系统 — 数据库字段解读文档
categories:
  - 工作
tags:
  - 工作
  - 蒲公英
  - 后端
abbrlink: 107684859
date: 2026-05-20 00:00:00
---

# Dandelion 蒲公英运维管理系统 — 数据库字段解读文档

> 基于 RuoYi-Vue 框架二次开发  
> 技术栈: Spring Boot 3.3 / MyBatis-Plus / MySQL 8.0 / Flyway  
> 版本: 0.1.4

---

## 目录

1. [基础框架表](#1-基础框架表)
2. [事件工单 (event)](#2-事件工单-event)
3. [变更流程 (change_process)](#3-变更流程-change_process)
4. [问题管理 (problem)](#4-问题管理-problem)
5. [需求管理 (demand)](#5-需求管理-demand)
6. [通知公告 (notice)](#6-通知公告-notice)
7. [SLA 排班](#7-sla-排班)
8. [日历计划 (calendar)](#8-日历计划-calendar)
9. [巡检管理](#9-巡检管理)
10. [交接日志 (handover_info)](#10-交接日志-handover_info)
11. [资源管理 (resource_info)](#11-资源管理-resource_info)
12. [表单系统](#12-表单系统)
13. [运维辅助表](#13-运维辅助表)
14. [CMDB 云资源表](#14-cmdb-云资源表)
15. [字典类型与系统配置](#15-字典类型与系统配置)
16. [常用枚举值对照表](#16-常用枚举值对照表)

---

## 1. 基础框架表

> 以下表来自 RuoYi 框架基础，由 `sql/dandelion20240924.sql` 初始化。

### 1.1 sys_user — 系统用户

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | bigint(20) | 用户ID |
| tenant_id | bigint(20) | **租户ID**（多租户隔离） |
| dept_id | bigint(20) | 部门ID |
| account_id | bigint(20) | 账号ID（关联 sys_account） |
| user_name | varchar(30) | 用户登录名 |
| nick_name | varchar(30) | **用户昵称**（在事件中显示为处理人名称） |
| user_type | varchar(10) | 用户类型（00:系统用户, 01:管理员） |
| email | varchar(50) | 邮箱（加密存储） |
| encrypt_email | varchar(50) | 邮箱哈希 |
| phonenumber | varchar(11) | 手机号码 |
| sex | char(1) | 性别（0男 1女 2未知） |
| avatar | varchar(100) | 头像路径 |
| password | varchar(100) | 密码（BCrypt加密） |
| status | char(1) | 状态（0正常 1停用） |
| del_flag | char(1) | 删除标志（0存在 2删除） |
| login_ip | varchar(128) | 最后登录IP |
| login_date | datetime | 最后登录时间 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(500) | 备注 |

### 1.2 sys_role — 系统角色

| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | bigint(20) | 角色ID |
| tenant_id | bigint(20) | 租户ID |
| role_name | varchar(30) | 角色名称 |
| role_key | varchar(100) | 角色权限字符串 |
| role_sort | int(4) | 显示顺序 |
| data_scope | char(1) | 数据范围（1全部 2本部门 3本部门及以下 4仅本人） |
| status | char(1) | 状态（0正常 1停用） |
| del_flag | char(1) | 删除标志 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(500) | 备注 |

### 1.3 sys_menu — 系统菜单

| 字段 | 类型 | 说明 |
|------|------|------|
| menu_id | bigint(20) | 菜单ID |
| menu_name | varchar(50) | 菜单名称 |
| parent_id | bigint(20) | 父菜单ID |
| order_num | int(4) | 显示顺序 |
| path | varchar(200) | 路由地址 |
| component | varchar(255) | 组件路径 |
| query | varchar(255) | 路由参数 |
| route_name | varchar(50) | 路由名称 |
| perms | varchar(100) | **权限标识**（关联 @PreAuthorize 注解） |
| icon | varchar(100) | 菜单图标 |
| menu_type | char(1) | 菜单类型（M目录 C菜单 F按钮） |
| visible | char(1) | 显示状态（0显示 1隐藏） |
| status | char(1) | 菜单状态（0正常 1停用） |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(500) | 备注 |

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
| email | varchar(50) | 邮箱 |
| status | char(1) | 状态（0正常 1停用） |
| del_flag | char(1) | 删除标志 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

### 1.5 sys_config — 系统参数配置

| 字段 | 类型 | 说明 |
|------|------|------|
| config_id | int(5) | 参数主键 |
| config_name | varchar(100) | 参数名称 |
| config_key | varchar(100) | 参数键名 |
| config_value | varchar(500) | 参数键值 |
| config_type | char(1) | 系统内置（Y是 N否） |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(500) | 备注 |

### 1.6 sys_dict_type — 字典类型

| 字段 | 类型 | 说明 |
|------|------|------|
| dict_id | bigint(20) | 字典主键 |
| dict_name | varchar(100) | 字典名称 |
| dict_type | varchar(100) | **字典类型**（如 process_status, process_type） |
| status | char(1) | 状态（0正常 1停用） |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(500) | 备注 |

### 1.7 sys_dict_data — 字典数据

| 字段 | 类型 | 说明 |
|------|------|------|
| dict_code | bigint(20) | 字典编码 |
| dict_sort | int(4) | 字典排序 |
| dict_label | varchar(100) | **字典标签**（显示用） |
| dict_value | varchar(100) | **字典键值**（存到数据库的值） |
| dict_type | varchar(100) | **字典类型**（关联 sys_dict_type） |
| css_class | varchar(100) | 样式属性 |
| list_class | varchar(100) | 表格回显样式 |
| is_default | char(1) | 是否默认（Y是 N否） |
| status | char(1) | 状态（0正常 1停用） |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(500) | 备注 |

### 1.8 sys_post — 岗位表

| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | bigint(20) | 岗位ID |
| post_code | varchar(64) | 岗位编码 |
| post_name | varchar(50) | 岗位名称 |
| post_sort | int(4) | 显示顺序 |
| status | char(1) | 状态（0正常 1停用） |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(500) | 备注 |

### 1.9 sys_notice — 通知公告

| 字段 | 类型 | 说明 |
|------|------|------|
| notice_id | int(10) | 公告ID |
| notice_title | varchar(50) | 公告标题 |
| notice_type | char(1) | 公告类型（1通知 2公告） |
| notice_content | longblob | 公告内容 |
| status | char(1) | 状态（0正常 1关闭） |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |
| remark | varchar(255) | 备注 |

### 1.10 sys_user_role — 用户角色关联

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | bigint(20) | 用户ID |
| role_id | bigint(20) | 角色ID |

### 1.11 sys_role_menu — 角色菜单关联

| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | bigint(20) | 角色ID |
| menu_id | bigint(20) | 菜单ID |

### 1.12 sys_role_dept — 角色部门关联

| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | bigint(20) | 角色ID |
| dept_id | bigint(20) | 部门ID |

### 1.13 sys_user_post — 用户岗位关联

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | bigint(20) | 用户ID |
| post_id | bigint(20) | 岗位ID |

### 1.14 sys_oper_log — 操作日志

| 字段 | 类型 | 说明 |
|------|------|------|
| oper_id | bigint(20) | 日志主键 |
| title | varchar(50) | 模块标题 |
| business_type | int(2) | 业务类型（0其它 1新增 2修改 3删除） |
| method | varchar(100) | 方法名称 |
| request_method | varchar(10) | 请求方式 |
| operator_type | int(1) | 操作类别（0其它 1后台 2手机端） |
| oper_name | varchar(50) | 操作人员 |
| dept_name | varchar(50) | 部门名称 |
| oper_url | varchar(255) | 请求URL |
| oper_ip | varchar(128) | 主机地址 |
| oper_location | varchar(255) | 操作地点 |
| oper_param | varchar(2000) | 请求参数 |
| json_result | varchar(2000) | 返回参数 |
| status | int(1) | 操作状态（0正常 1异常） |
| error_msg | varchar(2000) | 错误消息 |
| oper_time | datetime | 操作时间 |
| cost_time | bigint(20) | 消耗时间 |

### 1.15 sys_logininfor — 登录日志

| 字段 | 类型 | 说明 |
|------|------|------|
| info_id | bigint(20) | 访问ID |
| user_name | varchar(50) | 用户账号 |
| ipaddr | varchar(128) | 登录IP地址 |
| login_location | varchar(255) | 登录地点 |
| browser | varchar(50) | 浏览器类型 |
| os | varchar(50) | 操作系统 |
| status | char(1) | 登录状态（0成功 1失败） |
| msg | varchar(255) | 提示消息 |
| login_time | datetime | 登录时间 |

### 1.16 sys_file — 文件表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 文件ID |
| name | varchar(255) | 显示名称 |
| origin_name | varchar(255) | 原始名称 |
| md5 | varchar(32) | 文件 MD5 |
| size | bigint(20) | 文件大小（字节） |
| type | varchar(50) | 文件类型 |
| bucket | varchar(50) | 存储桶 |
| path | varchar(500) | 存储路径 |
| create_by | bigint(20) | 创建用户 |
| create_time | datetime | 创建时间 |

### 1.17 tenant — 租户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 租户ID |
| name | varchar(100) | 客户名称 |
| alias_name | varchar(100) | 客户简称 |
| code | varchar(100) | 客户编码 |
| logo | varchar(255) | Logo |
| industry | varchar(50) | 行业 |
| industry_label | varchar(50) | 行业 |
| district | varchar(50) | 地区 |
| district_label | varchar(50) | 地区 |
| address | varchar(255) | 地址 |
| phone | varchar(50) | 联系电话 |
| official_website | varchar(255) | 网址 |
| remark | varchar(500) | 说明 |
| status | char(1) | 状态（0正常 1停用） |
| event_version | varchar(20) | 事件版本（fast/full） |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 1.18 team — 团队表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 团队ID |
| tenant_id | bigint(20) | 租户ID |
| name | varchar(255) | 团队名称 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 1.19 team_user — 团队成员关联

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| team_id | bigint(20) | 团队ID |
| user_id | bigint(20) | 用户ID |
| is_leader | tinyint(1) | 是否团队负责人 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |

---

## 2. 事件工单 (event)

> 核心业务表，用于记录 IT 服务事件。

### 2.1 event — 事件主表

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | bigint(20) | 是 | 主键ID |
| instance_id | varchar(255) | 自动 | **工单编号**，格式: I{yyyyMMdd}{序号} |
| tenant_id | int(11) | 是 | **租户ID** |
| team_id | int(11) | - | **所属团队ID** |
| requester_name | varchar(255) | - | **需求方姓名** |
| requester_phone | varchar(255) | - | 需求方手机号 |
| requester_email | varchar(255) | - | 需求方邮箱 |
| machine_room_id | int(11) | - | **机房ID/Value**（tree_dict 的 value） |
| machine_room_name | varchar(255) | - | **机房名称** |
| position | varchar(255) | - | 定位信息 |
| authorizer | int(11) | - | 授权人（用户ID） |
| type | varchar(255) | - | **操作类型**（tree_dict_data 的 value，如"0206"） |
| source | varchar(255) | - | **事件来源**（0业务需求 1故障修复 2功能优化 3安全加固） |
| expected_time | datetime | - | 期望完成时间 |
| ticket_create_time | datetime | - | **建单时间**（用户可自定义的事件开始时间） |
| sla_last_start_time | datetime | - | SLA 排班最后开始时间 |
| urgency | int(11) | - | **紧急度**（1低 2中 3高） |
| impact | int(11) | - | **影响度**（1低 2中 3高） |
| level | int(11) | 自动 | **事件等级**（自动计算: 6 - urgency - impact） |
| topic | text | - | **事件标题** |
| description | longtext | - | **事件描述** |
| handle_team_id | int(11) | - | **处理团队ID** |
| handler | int(11) | - | **处理人**（用户ID） |
| status | int(11) | 自动 | **状态**（见 ProcessStatus 枚举） |
| use_time | int(11) | - | 用时（毫秒） |
| complete_time | datetime | - | **完成时间** |
| notice_type | int(11) | - | 通知类型 |
| notice_nodes | varchar(500) | - | 通知节点（逗号分隔,ListToVarchar） |
| notice_users | varchar(500) | - | 通知用户 |
| extra_notice_users | varchar(500) | - | 额外通知用户 |
| fix_type | varchar(255) | - | 维修类别（松江定制） |
| assist_users | varchar(500) | - | **协同人**（逗号分隔用户ID,ListToVarchar） |
| del_flag | tinyint(4) | 0 | 删除标志（0存在 1删除） |
| create_by | bigint(20) | 是 | **创建人**（事件填报人,用户ID） |
| create_time | datetime | 是 | **创建时间/填报时间** |
| update_by | bigint(20) | - | 更新人 |
| update_time | datetime | - | **最后操作时间** |

### 2.2 sub_event — 子事件表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| event_id | bigint(20) | 主事件ID |
| handle_team_id | varchar(255) | 事件处理团队 |
| handler | varchar(255) | 事件处理人 |
| description | varchar(255) | 事件处理描述 |
| create_by | varchar(255) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | varchar(255) | 更新用户 |
| update_time | datetime | 更新时间 |

### 2.3 todo_list — 待办列表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| record_id | int(11) | 关联流程记录ID（event/change/demand 的ID） |
| instance_id | varchar(255) | 流程编号 |
| type | varchar(255) | **待办类型**（event/change/demand） |
| solver | varchar(255) | **执行人**（用户ID） |
| status | int(11) | 状态 |
| process_node | int(11) | **流程节点**（1申请 2审批 3实施 4测试 5复核） |
| create_by | varchar(255) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | varchar(255) | 更新用户 |
| update_time | datetime | 更新时间 |

### 2.4 time_line — 时间轴

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| type | varchar(255) | **记录类型**（event/change） |
| record_id | int(11) | **关联记录ID** |
| assigner | varchar(255) | 处理人 |
| status | int(11) | **状态**（见 ProcessStatus） |
| remark | text | 操作备注 |
| attachment | varchar(255) | 附件 |
| create_by | varchar(255) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | varchar(255) | 更新用户 |
| update_time | datetime | 更新时间 |

### 2.5 process_relation — 流程关联关系

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| process_type | varchar(255) | **流程类型**（event/change/demand） |
| process_id | int(11) | **流程ID** |
| type | varchar(255) | **关联类型**（file/demand/order等） |
| source | varchar(255) | 关联数据/来源ID |
| create_by | varchar(255) | 创建用户 |
| create_time | datetime | 创建时间 |

### 2.6 ProcessStatus 状态枚举

| 编码 | 描述 | 说明 |
|------|------|------|
| 1 | 起草中 | 新建事件的初始状态 |
| 2 | 待审核 | 提交后等待审批 |
| 3 | 待处理 | 审批通过，等待处理人开始处理 |
| 4 | 已驳回 | 审批未通过 |
| 5 | 处理中 | 处理人正在处理 |
| 6 | 暂停中 | 事件暂停处理 |
| 7 | 待测试 | 处理完成，等待测试 |
| 8 | 测试中 | 正在测试 |
| 9 | 待复核 | 测试完成，等待复核 |
| 10 | 复核中 | 正在复核 |
| 11 | 处理失败 | 处理失败 |
| 12 | 已重开 | 重新打开 |
| 13 | 已完成 | 事件完成 |
| 14 | 已取消 | 取消 |
| 15 | 转派 | 处理人已转派 |

---

## 3. 变更流程 (change_process)

### 3.1 change_process — 变更主表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| instance_id | varchar(255) | 流程编号 |
| tenant_id | int(11) | 租户ID |
| team_id | int(11) | 所属团队ID |
| topic | varchar(255) | 主题/标题 |
| urgency | int(11) | 紧急度（1低 2中 3高） |
| impact | int(11) | 影响度（1低 2中 3高） |
| level | int(11) | 变更级别（自动计算） |
| operation_type | int(11) | 操作分类 |
| source | int(11) | 变更来源 |
| nature | int(11) | 变更性质 |
| env | varchar(255) | 变更环境 |
| implement_type | int(11) | 实施方式 |
| start_time | datetime | 计划实施开始时间 |
| end_time | datetime | 计划实施结束时间 |
| user_auth | tinyint(4) | 用户授权 |
| reason_purpose | longtext | 原因和目的 |
| verity_scheme | longtext | 验证方案 |
| operation_step | longtext | 操作步骤 |
| rollback_scheme | longtext | 回退方案 |
| risk_impact | longtext | 风险及影响 |
| cooperate_resource | longtext | 配合资源 |
| status | int(11) | 状态 |
| promoter | int(11) | 申请人 |
| approver | int(11) | 审批人 |
| implementer | int(11) | 实施人 |
| tester | int(11) | 测试人 |
| reviewer | int(11) | 复核人 |
| notice_type | int(11) | 通知类型 |
| notice_nodes | varchar(500) | 通知节点 |
| notice_users | varchar(500) | 通知用户 |
| extra_notice_users | varchar(500) | 额外通知用户 |
| del_flag | tinyint(4) | 逻辑删除（0存在 1删除） |
| create_by | varchar(255) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | varchar(255) | 更新用户 |
| update_time | datetime | 更新时间 |

### 3.2 sub_change_process — 子变更信息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| process_id | int(11) | 变更ID |
| operation_type | varchar(255) | 操作分类 |
| content | longtext | 内容 |
| start_time | datetime | 实施开始时间 |
| end_time | datetime | 实施结束时间 |
| implementer | varchar(255) | 实施人 |
| reviewer | varchar(255) | 复核人 |
| create_by | varchar(255) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | varchar(255) | 更新用户 |
| update_time | datetime | 更新时间 |

---

## 4. 问题管理 (problem)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| instance_id | varchar(255) | 流程编号 |
| tenant_id | int(11) | 租户ID |
| team_id | int(11) | 所属团队 |
| topic | varchar(255) | 问题标题 |
| description | longtext | 问题描述 |
| handler | varchar(255) | 处理人 |
| source | int(11) | 问题来源 |
| type | varchar(255) | 问题类型 |
| status | int(11) | 状态 |
| urgency | int(11) | 紧急度 |
| impact | int(11) | 影响度 |
| level | int(11) | 问题等级 |
| create_by | bigint(20) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新用户 |
| update_time | datetime | 更新时间 |

> 注意：problem 表不是通过 Flyway 迁移创建，可能是基表或通过 `sql/dandelion20240924.sql` 创建。

---

## 5. 需求管理 (demand)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 唯一ID |
| tenant_id | int(11) | 租户ID |
| team_id | int(11) | 所属团队 |
| instance_id | varchar(255) | 需求编号 |
| requester_name | varchar(255) | 需求方名称 |
| requester_phone | varchar(255) | 需求方手机号 |
| requester_email | varchar(255) | 需求方邮箱 |
| expected_time | datetime | 期望完成时间 |
| topic | text | 标题 |
| type | varchar(255) | 类型 |
| description | longtext | 描述 |
| status | int(11) | 状态 |
| del_flag | tinyint(4) | 是否删除 |
| create_by | bigint(20) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新用户 |
| update_time | datetime | 更新时间 |

---

## 6. 通知公告 (notice)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键ID |
| tenant_id | int(11) | 租户ID |
| notice_type | int(11) | 公告类型（0:平台公告 1:租户公告） |
| topic | text | 主题/标题 |
| description | longtext | 描述/内容 |
| notice_tag | varchar(255) | 公告标签 |
| status | int(11) | 状态 |
| publish_time | datetime | 发布时间 |
| create_by | bigint(20) | 创建人 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 修改人 |
| update_time | datetime | 修改时间 |

### notice_user — 通知用户关联

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键ID |
| notice_id | bigint(20) | 公告ID |
| account_id | bigint(20) | 账号ID |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

---

## 7. SLA 排班

### 7.1 sla_schedule — 班次定义

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| name | varchar(128) | 班次名称 |
| type | int(11) | 类型 |
| start_time | time | 开始时间 |
| end_time | time | 结束时间 |
| effective_from | date | 生效开始日期 |
| effective_to | date | 生效结束日期 |
| workday_rule | int(11) | 工作日规则 |
| status | int(11) | 状态（0启用 1停用） |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 7.2 group_schedule — 小组绑定班次

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| group_id | bigint(20) | 小组ID（work_group.id） |
| schedule_id | bigint(20) | 班次ID（sla_schedule.id） |
| plan_id | bigint(20) | 所属计划ID（sla_plan.id） |
| effective_from | date | 生效开始日期 |
| effective_to | date | 生效截止日期 |
| status | tinyint(1) | 状态（0启用 1停用） |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 7.3 sla_plan — 排班计划

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| name | varchar(128) | 计划名称 |
| cycle | int(11) | 循环天数 |
| effective_from | date | 计划开始日期 |
| effective_to | date | 计划结束日期 |
| status | int(11) | 状态（0启用 1停用） |
| remark | varchar(255) | 备注 |
| del_flag | int(11) | 删除标志 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 7.4 holiday_calendar — 法定节假日表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| date | date | 日期 |
| is_workday | tinyint(1) | 是否工作日（1是 0否） |
| remark | varchar(255) | 备注 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

---

## 8. 日历计划 (calendar)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键ID |
| team_id | int(11) | 团队ID |
| tenant_id | int(11) | 租户ID |
| plan_date | date | 计划日期 |
| plan_time | time | 计划时间 |
| address | varchar(255) | 地点 |
| plan_title | varchar(255) | 标题 |
| participants | text | 参与者 |
| start_time | datetime | 开始时间 |
| end_time | datetime | 结束时间 |
| create_by | int(11) | 创建人 |
| create_time | datetime | 创建时间 |
| update_by | int(11) | 修改人 |
| update_time | datetime | 修改时间 |

---

## 9. 巡检管理

### 9.1 inspections — 巡检记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键ID |
| inspection_date | date | 巡检日期 |
| inspection_time | datetime | 巡检时间 |
| user_id | bigint(20) | 巡检人 |
| type | varchar(255) | 巡检类型 |
| machine_room_id | int(11) | 机房编号 |
| device_id | bigint(20) | 设备编号 |
| temperature | varchar(50) | 温度 |
| humidity | varchar(50) | 湿度 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 9.2 motor_room — 电机机房表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 机房编号 |
| tenant_id | int(11) | 客户ID |
| team_id | int(11) | 团队ID |
| motor_room_name | varchar(500) | 机房名称 |
| address | varchar(500) | 机房所在地址 |
| status | tinyint(1) | 机房状态（0正常 1停用） |
| del_flag | tinyint(1) | 删除标志 |
| create_by | bigint(20) | 创建用户 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新用户 |
| update_time | datetime | 更新时间 |

### 9.3 motor_devices — 电机设备表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| device_id | varchar(255) | 设备ID |
| motor_room_id | varchar(255) | 机房编号 |
| device_sort | int(11) | 设备排序 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 9.4 inspection_task_config — 巡检任务配置

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| team_id | bigint(20) | 所属团队 |
| tenant_id | bigint(20) | 租户ID |
| motor_room_id | varchar(255) | 机房ID |
| config_name | varchar(255) | 配置名称 |
| inspections_time | int(11) | 巡检间隔时间 |
| inspections_time_unit | varchar(50) | 间隔时间单位 |
| inspections_content | text | 巡检内容 |
| start_time | datetime | 有效开始时间 |
| end_time | datetime | 有效结束时间 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 9.5 inspection_motor_task — 电机巡检任务

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| team_id | bigint(20) | 所属团队 |
| tenant_id | bigint(20) | 租户ID |
| motor_room_id | varchar(255) | 机房ID |
| motor_room_name | varchar(255) | 机房名称 |
| config_id | bigint(20) | 关联配置ID |
| inspections_time | int(11) | 巡检间隔 |
| inspections_time_unit | varchar(50) | 间隔单位 |
| inspections_content | text | 巡检内容 |
| start_time | datetime | 计划开始时间 |
| end_time | datetime | 计划结束时间 |
| complete_time | datetime | 实际完成时间 |
| inspections_user | varchar(255) | 巡检人 |
| check_write | text | 巡检填写内容 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 9.6 on_sit_inspections — 现场巡检

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| task_id | int(11) | 任务ID |
| device_id | int(11) | 设备ID |
| device_name | varchar(255) | 设备名称 |
| device_sort | int(11) | 设备排序 |
| content_data | text | 巡检数据 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 9.7 inspection_email — 巡检邮件配置

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| team_id | bigint(20) | 团队ID |
| email | varchar(255) | 邮箱地址 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

---

## 10. 交接日志 (handover_info)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键ID |
| tenant_id | int(11) | 租户ID |
| team_id | int(11) | 团队ID |
| present_user | bigint(20) | **当前用户**（交班人，用户ID） |
| handover | bigint(20) | **接班人**（用户ID） |
| handover_time | datetime | **交接时间** |
| description | longtext | 交接内容 |
| attachment | longtext | 附件 |
| summary | longtext | 工作小结 |
| create_by | bigint(20) | 创建人 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 修改人 |
| update_time | datetime | 修改时间 |

---

## 11. 资源管理 (resource_info)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 资源唯一ID |
| form_id | bigint(20) | 用户自建表单ID |
| tenant_id | bigint(20) | 租户ID |
| team_id | bigint(20) | 归属团队 |
| name | varchar(255) | 资源名称 |
| code | varchar(255) | **资源编码**（团队内唯一） |
| family | varchar(255) | 资源类型/分类 |
| owner | varchar(64) | 维护责任人 |
| extra_columns | longtext | **额外字段**（JSON，来自自定义表单） |
| del_flag | tinyint(4) | 逻辑删除 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

> **唯一索引**: (team_id, code) — 团队内资源编码唯一

---

## 12. 表单系统

### 12.1 form — 用户自建表单

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 表单ID |
| tenant_id | int(11) | 租户ID |
| name | varchar(100) | 表单名称 |
| template_type | varchar(100) | 模板类型（resource/inspection） |
| description | varchar(255) | 说明 |
| status | char(1) | 状态（0正常 1停用） |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

### 12.2 form_column — 表单字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | int(11) | 租户ID |
| form_id | bigint(20) | 表单ID |
| label | varchar(255) | 字段名称 |
| value | varchar(255) | **字段标识**（对应 extra_columns 中的 key） |
| type | int(11) | **字段类型**（1文本 2数字 3单选框 4多选框 5下拉菜单 6日期 7人员 8团队 9级联菜单） |
| required | char(1) | 必填（0非必填 1必填） |
| enabled | char(1) | 启用（0停用 1启用） |
| sort | int(11) | 排序 |
| options | text | 选项（JSON） |
| description | varchar(255) | 说明 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

### 12.3 form_common_column — 公共字段池

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| template_type | varchar(255) | 模板类型（resource/inspection/tenant） |
| category | int(11) | 字段类目（1基本字段 2扩展字段） |
| label | varchar(255) | 字段名称 |
| value | varchar(255) | 字段标识 |
| type | int(11) | 字段类型（同上） |
| required | char(1) | 必填 |
| enabled | char(1) | 启用 |
| sort | int(11) | 排序 |
| default_options_type | varchar(255) | 选项类型（对应字典类型） |
| default_options | text | 默认选项（JSON） |
| description | varchar(255) | 说明 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

> **唯一索引**: (template_type, value)

### 12.4 form_template — 公共表单模板

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| name | varchar(100) | 模板名称 |
| type | varchar(100) | 模板类型（唯一索引） |
| icon | varchar(255) | 对应图标 |
| description | varchar(255) | 说明 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

---

## 13. 运维辅助表

### 13.1 work_group — 工作小组

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| name | varchar(64) | **小组名称** |
| remark | varchar(512) | 备注 |
| del_flag | tinyint(4) | 删除标志 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

> **唯一索引**: (tenant_id, name)

### 13.2 work_group_user — 小组成员

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| group_id | bigint(20) | 小组ID |
| user_id | bigint(20) | 用户ID |
| is_leader | tinyint(4) | 是否组长 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |

> **唯一索引**: (group_id, user_id)

### 13.3 skill_group — 技能组

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| team_id | bigint(20) | 所属团队 |
| name | varchar(255) | 技能组名称 |
| code | varchar(255) | 技能组编码 |
| status | char(1) | 状态（0正常 1停用） |
| sort_num | int(11) | 排序号 |
| remark | varchar(500) | 备注 |
| del_flag | char(1) | 删除标志 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.4 requester — 需求方

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| team_id | bigint(20) | 团队ID |
| name | varchar(255) | 需求方名称 |
| phone | varchar(255) | 手机号 |
| email | varchar(255) | 邮箱 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.5 user_session — 用户会话表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| user_id | bigint(20) | 用户ID |
| tenant_id | bigint(20) | 租户ID |
| session_id | varchar(255) | 会话ID |
| status | char(1) | 状态 |
| remark | varchar(500) | 备注 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.6 asset_overview_config — 资产概览配置

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| team_id | bigint(20) | 团队ID |
| tenant_id | bigint(20) | 租户ID |
| room_count | int(11) | 机房数量 |
| device_count | int(11) | 设备数量 |
| cabinet_count | int(11) | 机柜数量 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.7 rpa — RPA 自动化

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| scene | varchar(255) | 场景 |
| detection_content | varchar(255) | 检测内容 |
| run_count | int(11) | 运行次数 |
| fail_count | int(11) | 失败次数 |
| fail_reasons | text | 失败原因 |
| handling_method | varchar(255) | 处理方式 |
| status | char(1) | 状态 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.8 rpa_log — RPA 日志

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键（自动递增） |
| record_date | datetime | 记录日期 |
| scene | varchar(255) | 场景 |
| success_count | int(11) | 成功次数 |
| fail_count | int(11) | 失败次数 |
| original_timestamp | varchar(50) | 原始时间戳 |
| search_value | varchar(255) | 搜索值 |
| remark | varchar(500) | 备注 |
| del_flag | char(1) | 删除标志 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.9 daily_report — 日报

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| type | varchar(255) | 日报类型 |
| inspection_date | date | 巡检日期 |
| description | text | 日报内容 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.10 construction_order — 施工单

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| inspection_date | date | 检查日期 |
| promoter | varchar(255) | 申请人 |
| description | text | 描述 |
| start_time | datetime | 开始时间 |
| end_time | datetime | 结束时间 |
| duration | bigint(20) | 持续时长 |
| handle_user | varchar(255) | 处理人 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.11 czxy_change — 七宝运维变更

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| demander | varchar(255) | 需求方 |
| machine_room | varchar(255) | 机房 |
| device_sns | varchar(500) | 设备SN列表 |
| device_type | varchar(255) | 设备类型 |
| location | varchar(255) | 位置 |
| operate_type | varchar(255) | 操作类型 |
| sla_hour | int(11) | SLA小时数 |
| sla_target | datetime | SLA目标时间 |
| sla_pass | tinyint(1) | SLA是否通过 |
| device_host_name | varchar(255) | 设备主机名 |
| operate_content | text | 操作内容 |
| recipient | varchar(255) | 接收人 |
| completer | varchar(255) | 完成人 |
| issuing_time | datetime | 下发时间 |
| sla_score | int(11) | SLA评分 |
| collection_time | datetime | 采集时间 |
| closing_time | datetime | 关闭时间 |
| entry_approval_write_link | text | 录入审批链路 |
| entry_approval_link | text | 录入直接链路 |
| fault_slot | varchar(255) | 故障槽位 |
| exchange_info | text | 更换信息 |
| remark | varchar(500) | 备注 |
| del_flag | char(1) | 删除标志 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.12 rag_flow — 知识库

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键（自动递增） |
| name | varchar(255) | 名称 |
| question | text | 问题 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.13 tree_dict_data — 租户字典树数据

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| team_id | bigint(20) | 团队ID |
| type | varchar(50) | **字典类型**（event_type/fix_type/resource_type） |
| parent_id | bigint(20) | 父级ID |
| level | int(11) | 层级 |
| label | varchar(50) | **显示标签**（如"驻场陪同第三方人员随工"） |
| value | varchar(50) | **存储值**（如"0206"） |
| sort | int(11) | 排序 |
| status | char(1) | 状态（0正常 1停用） |
| del_flag | char(1) | 删除标志 |
| description | varchar(500) | 描述 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

### 13.14 tree_dict_type — 租户字典类型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| team_id | bigint(20) | 团队ID |
| name | varchar(50) | 字典名称 |
| type | varchar(50) | **字典类型标识** |
| status | char(1) | 状态 |
| remark | varchar(500) | 备注 |
| create_by | varchar(64) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | varchar(64) | 更新者 |
| update_time | datetime | 更新时间 |

---

## 14. CMDB 云资源表

### 14.1 cmdb_asset_main — 资产主表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| asset_id | varchar(255) | **资产ID** |
| asset_type | varchar(255) | **资产类型**（ecs/redis/mysql/elb等） |
| asset_sub_type | varchar(255) | 资产子类型 |
| asset_name | varchar(255) | 资产名称 |
| cloud_resource_id | varchar(255) | 云资源ID |
| project_id | varchar(255) | 项目ID |
| region | varchar(255) | 地域 |
| az_name | varchar(255) | 可用区 |
| status | varchar(50) | 状态 |
| on_line_time | datetime | 上线时间 |
| expired_time | datetime | 过期时间 |
| on_demand | tinyint(1) | 是否按需 |
| owner | varchar(255) | 所有者 |
| department | varchar(255) | 部门 |
| tags | text | 标签 |
| description | text | 描述 |
| sync_time | datetime | 同步时间 |
| region_id | varchar(255) | 区域ID |
| tenant_id | bigint(20) | 租户ID |
| asset_account_id | bigint(20) | 资产账号ID |
| del_flag | char(1) | 删除标志 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 14.2 cmdb_asset_account — 云账号

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| alias | varchar(255) | 账号别名 |
| ak | varchar(255) | Access Key |
| sk | varchar(500) | Secret Key |
| end_point | varchar(255) | Endpoint |
| tenant_id | bigint(20) | 租户ID |
| type | varchar(50) | 类型（ctyun/aliyun等） |
| level | int(11) | 层级 |
| project_id | varchar(255) | 项目ID |
| del_flag | char(1) | 删除标志 |
| create_by | bigint(20) | 创建者 |
| create_time | datetime | 创建时间 |
| update_by | bigint(20) | 更新者 |
| update_time | datetime | 更新时间 |

### 14.3 cmdb_ecs_instance_detail — ECS 实例详情

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| project_id | varchar(255) | 项目ID |
| az_name | varchar(255) | 可用区 |
| resource_id | varchar(255) | 资源ID |
| instance_id | varchar(255) | 实例ID |
| display_name | varchar(255) | 显示名称 |
| instance_name | varchar(255) | 实例名称 |
| os_type | varchar(255) | 操作系统类型 |
| instance_status | varchar(255) | 实例状态 |
| expired_time | datetime | 过期时间 |
| created_time | datetime | 创建时间 |
| updated_time | datetime | 更新时间 |
| private_ip | varchar(255) | 内网IP |
| vpc_id | varchar(255) | VPC ID |
| floating_ip | varchar(255) | 浮动IP |
| flavor | text | 规格（CPU/内存） |
| image | text | 镜像信息 |
| attached_volume | text | 附加云盘 |
| addresses | text | 地址信息 |
| sec_group_list | text | 安全组列表 |
| network_card_list | text | 网卡列表 |
| batch_id | varchar(255) | 批次ID |
| batch_date | date | 批次日期 |
| account_id | bigint(20) | 账号ID |
| tenant_id | bigint(20) | 租户ID |
| del_flag | char(1) | 删除标志 |

### 14.4 cmdb_ctyun_redis_details — 天翼云 Redis 详情

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| instance_id | varchar(255) | 实例ID |
| instance_name | varchar(255) | 实例名称 |
| status | varchar(255) | 状态 |
| vip | varchar(255) | VIP地址 |
| vip_port | int(11) | 端口 |
| capacity | int(11) | 容量 |
| engine_version | varchar(255) | 引擎版本 |
| arch_type | varchar(255) | 架构类型 |
| pay_type | varchar(255) | 付费方式 |
| instance_created_time | datetime | 创建时间 |
| exp_time | datetime | 过期时间 |
| region_code | varchar(255) | 区域代码 |
| project_id | varchar(255) | 项目ID |
| account_id | bigint(20) | 账号ID |
| tenant_id | bigint(20) | 租户ID |
| batch_id | varchar(255) | 批次ID |
| del_flag | char(1) | 删除标志 |

### 14.5 cmdb_ctyun_mysql_details — 天翼云 MySQL 详情

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| instance_id | varchar(255) | 实例ID |
| prod_inst_name | varchar(255) | 实例名称 |
| prod_running_status | varchar(255) | 运行状态 |
| vip | varchar(255) | 内网VIP |
| write_port | int(11) | 写端口 |
| read_port | int(11) | 读端口 |
| instance_create_time | datetime | 创建时间 |
| expire_time | datetime | 过期时间 |
| machine_spec | varchar(255) | 规格 |
| prod_db_engine | varchar(255) | 数据库引擎 |
| disk_size | int(11) | 磁盘大小 |
| vpc_id | varchar(255) | VPC ID |
| subnet_id | varchar(255) | 子网ID |
| project_id | varchar(255) | 项目ID |
| account_id | bigint(20) | 账号ID |
| tenant_id | bigint(20) | 租户ID |
| batch_id | varchar(255) | 批次ID |
| del_flag | char(1) | 删除标志 |

### 14.6 cmdb_ctyun_level2_ecs_details — 二级 ECS 详情

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| ecs_id | varchar(255) | ECS ID |
| instance_name | varchar(255) | 实例名称 |
| name | varchar(255) | 名称 |
| status | varchar(255) | 状态 |
| flavor | text | 规格 |
| image | text | 镜像 |
| addresses | text | 地址 |
| security_groups | text | 安全组 |
| availability_zone | varchar(255) | 可用区 |
| created | datetime | 创建时间 |
| updated | datetime | 更新时间 |
| account_id | bigint(20) | 账号ID |
| batch_id | varchar(255) | 批次ID |
| tenant_id | bigint(20) | 租户ID |

### 14.7 cmdb_ctyun_elb_details — ELB 详情

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| instance_id | varchar(255) | 实例ID |
| elb_id | varchar(255) | ELB ID |
| name | varchar(255) | 名称 |
| vpc_id | varchar(255) | VPC ID |
| private_ip_address | varchar(255) | 内网IP |
| eip_info | text | EIP信息 |
| status | varchar(255) | 状态 |
| created_time | datetime | 创建时间 |
| expired_time | datetime | 过期时间 |
| billing_method | varchar(255) | 计费方式 |
| resource_id | varchar(255) | 资源ID |
| account_id | bigint(20) | 账号ID |
| tenant_id | bigint(20) | 租户ID |
| batch_id | varchar(255) | 批次ID |
| del_flag | char(1) | 删除标志 |

### 14.8 cmdb_ty_cloud_resource_count — 云资源计数

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 主键 |
| tenant_id | bigint(20) | 租户ID |
| account_id | bigint(20) | 账号ID |
| region_id | varchar(255) | 区域ID |
| region_name | varchar(255) | 区域名称 |
| VM | int(11) | 虚拟机数量 |
| Volume | int(11) | 云盘数量 |
| VPC | int(11) | VPC数量 |
| Public_IP | int(11) | 公网IP数量 |
| REDIS | int(11) | Redis数量 |
| MYSQL | int(11) | MySQL数量 |
| ELB | int(11) | ELB数量 |
| DISK_Backup | int(11) | 磁盘备份数量 |
| batch_id | varchar(255) | 批次ID |

### 14.9 其他 CMDB 辅助表

| 表名 | 说明 |
|------|------|
| cmdb_asset_property_change_log | 资产属性变更日志 |
| cmdb_asset_user_mapping | 资产用户映射（授权/未授权） |
| cmdb_group | CMDB 分组 |
| cmdb_group_member | 组成员 |
| cmdb_resource_local_ext | 本地扩展资源 |
| cmdb_search_condition | 搜索条件配置 |
| cmdb_resource_tag | 资源标签 |
| cmdb_table_header | 表格列头配置 |

---

## 15. 字典类型与系统配置

### 15.1 sys_dict_type 系统字典类型

| dict_type | 说明 |
|-----------|------|
| process_status | **流程状态**（1起草中~15转派） |
| process_type | **流程类型**（event/change） |
| process_node | **流程节点**（1申请 2审批 3实施 4测试 5复核） |
| sys_normal_disable | 系统正常/停用 |
| sys_show_hide | 显示/隐藏 |
| sys_yes_no | 是/否 |
| sys_user_sex | 用户性别 |
| effect | 影响度 |

### 15.2 tree_dict_type 租户字典类型

| type | 说明 |
|------|------|
| event_type | **操作类型/事件类型**（如"驻场陪同第三方人员随工"→"0206"） |
| fix_type | 维修类别（松江定制） |
| resource_type | 资源分类 |

### 15.3 EventSourceEnums 事件来源（代码枚举）

| code | 描述 |
|------|------|
| 0 | 业务需求 |
| 1 | 故障修复 |
| 2 | 功能优化 |
| 3 | 安全加固 |

### 15.4 EventUrgencyEnums 紧急度/影响度（代码枚举）

| code | 描述 |
|------|------|
| 1 | 低 |
| 2 | 中 |
| 3 | 高 |

---

## 16. 常用枚举值对照表

### 16.1 事件级别 (level) 自动计算公式

```
level = 6 - (urgency + impact)
```

| urgency | impact | 总和 | level | 级别 |
|---------|--------|------|-------|------|
| 1(低) | 1(低) | 2 | 4 | P4 |
| 1(低) | 2(中) | 3 | 3 | P3 |
| 2(中) | 1(低) | 3 | 3 | P3 |
| 2(中) | 2(中) | 4 | 2 | P2 |
| 2(中) | 3(高) | 5 | 1 | P1 |
| 3(高) | 2(中) | 5 | 1 | P1 |
| 3(高) | 3(高) | 6 | 0 | P0 |

### 16.2 ProcessStatus 流程状态

| code | 描述 | 可操作 |
|------|------|--------|
| 1 | 起草中 | 提交/保存 |
| 2 | 待审核 | 审批通过/驳回 |
| 3 | 待处理 | 开始处理 |
| 4 | 已驳回 | 重新起草 |
| 5 | 处理中 | 暂停/完成 |
| 6 | 暂停中 | 开始处理 |
| 7 | 待测试 | 开始测试 |
| 8 | 测试中 | 测试完成 |
| 9 | 待复核 | 开始复核 |
| 10 | 复核中 | 复核完成 |
| 11 | 处理失败 | - |
| 12 | 已重开 | - |
| 13 | 已完成 | - |
| 14 | 已取消 | - |
| 15 | 转派 | - |

### 16.3 字段类型 (form_column.type)

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
*由项目数据库迁移脚本和实体代码全量扫描自动生成*
