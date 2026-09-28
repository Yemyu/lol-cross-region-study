# 数据与第三方素材

根目录的 MIT License 仅适用于本项目原创代码与说明，不将第三方数据、商标或图像重新授权为 MIT。

## 比赛记录

- Games of Legends：https://gol.gg/ 。比赛记录保留原赛事页面链接。本项目不代表该网站，MIT 授权不包含对其资料的额外授权。
- GPTilt 的 Leaguepedia 比赛快照：https://huggingface.co/datasets/gptilt/lol-esports-matches 。来源标注为 CC BY-SA 3.0：https://creativecommons.org/licenses/by-sa/3.0/ 。本项目对使用的记录做了队名归并、系列赛汇总、范围筛选与积分计算。涉及该来源的衍生数据继续按其相同方式共享要求提供，不使用代码 MIT 许可证替代；原始记录与贡献者归属仍属于该来源及 Leaguepedia 社区。
- LoL Esports：https://lolesports.com/ 。用于部分赛事和资格信息的核对。

逐场来源保存在 `data.js` 和 `matches.csv`。下载文件包含多来源整理结果，不能把整份资料视为 MIT 授权的代码资产。数据纠错欢迎附上原始比赛出处。

## 队标与赛事标识

队标主要取自 https://github.com/lootmarket/esport-team-logos ，赛事标识及少量队标来自 Riot Games 的 LoL Esports 静态资源。每个标识的原始下载地址记录在 `assets/logos/manifest.json`。

图像缩放至最长边 128 像素后内嵌在 `logos.js`，用于本报告识别参赛队伍与赛事。部分同组织历史分队共享组织标识；图标不是逐赛季的官方设计档案。暂无可靠图标时显示文字缩写。

图像和商标权归各俱乐部、Riot Games 或其他原权利人所有。本仓库不授予这些标识的商标权或独立图像许可，也不表示获得官方背书。

## D3

`vendor/d3.min.js`：D3 v7.9.0，Copyright 2010–2023 Mike Bostock。

D3 使用 ISC License，完整文本位于 `vendor/D3-LICENSE`。项目地址：https://github.com/d3/d3 。
