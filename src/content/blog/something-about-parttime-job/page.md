---
author: Me
pubDatetime: 2023-07-12T22:25:03.284Z
title: 第一次程式工讀經驗
slug: something-about-part-time-job
featured: false
draft: false
tags:
  - code
  - work
ogImage: "@assets/images/og-image.png"
description: 第一次跟開發有關的打工的經驗
---

![og](@assets/images/og-image.png)

<blockquote class="twitter-tweet"><p lang="zh" dir="ltr">「關於資訊工程系的學生不諳電腦程式設計，有何對策？」<br>「上凱達格蘭大道抗議，公平正義救學生，這些開發工具廠商欺負我們學生」</p>&mdash; Jim Huang (@jserv) <a href="https://twitter.com/jserv/status/1677203033158213632?ref_src=twsrc%5Etfw">July 7, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## 起因

剛開始就是在 [Discord](https://www.discord.com)上看到圖書館開的工作職缺，工作內容是[網站](https://collections.lib.tku.edu.tw/#/)修復，包含前端、後端、資料庫。時薪176(其實不多，就圖個經驗)就抱著試試看的心情去報名面試。

## 面試

#### 階段1 電話面試

暸解基本資料(名字、電話、電子郵件)，然後傳一封郵件裡面有所有的程式碼(當然一些token會刪掉)，讓你看看可不可以解決問題
<br></br>
研究後發現

1. 前端:[Vue.js](https://vuejs.org)，準確的說是vue2，我基本是不會，但是我會[react](https://react.dev)
2. 後端:[Koa](https://koajs.com)我完全不會，就靠error messenge除錯
3. 資料庫:[MongoDB](https://www.mongodb.com) 完全沒用過，但我用過 firebase
4. 這個基本上我都不會

#### 階段2 面試

就是當面討論問題。基本上問題就是某個資工系的學長在2018年幫圖書館建立這個系統，但是有一些bug。然後人家現在在外面上班所以我們不好意思麻煩人家所以想找學生處理。找資工系的研究生人家不想弄，就只好找看看有沒有會的人可以當冤大頭。

## 工作情況

全遠端，每個禮拜用email回報進度、問題，回信速度蠻快的(平日一天內，假日兩天內會回)。每個月要找一天去辦公室填表單。學校有給你一台虛擬機讓你可以測試，可是連線方式非常雞肋(他們說是基於安全上的考量所以就沒說什麼了)<br></br>
剛開始覺得問題應該很快就會被解決(只不過是前端的一點問題)，但是問題出在mongoDB，他們幫我裝的版本又太新(那台測試機可以裝最新版的mongoDB但是連node 8.0都裝不起來🤣)所以後端就是沒有辦法使用。但是事情還是要做，所以就先把不用涉及後端需要登入的部分先完成。基本上我前面兩個月都是在鬼混，最後一個月才是把全部的工作完成。

## 總結

大概知道如果有程式方面的工作是如何進行的，但是他們也沒有對程式做到版本控制(竟然不知道伺服器上跑的是哪個版本的程式)，而這個剛好是我比較想知道的部分但是我沒學到。另外薪水的部分雖然是很少沒錯，但是考慮到我對那些基本的知識都是不知道的狀況下我覺得他們願意給我這個機會就很好了。總結幾條

1. 以後要用熟練的技術來接案(如果可以選的話)
2. 學會自己在本地架設環境，不要過於依賴雲端的工具像是[firebase](https://firebase.google.com) 這些東西要錢啊
3. 要懂的拒絕不合理的要求
