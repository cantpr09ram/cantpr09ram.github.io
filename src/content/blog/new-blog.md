---
title: My new blog
author: Me
pubDatetime: 2024-03-13T07:55:15.614Z
slug: my-new-blog
featured: true
draft: false
tags:
  - code
  - frontend
  - think
ogImage: "@assets/images/new-blog/new-blog-og.png"
description: Why Do I Need a New Blog and the Process of Creating a New Blog
canonicalURL: https://cantpr09ram.github.io/posts/my-new-blog/
---

![og](@assets/images/new-blog/new-blog-og.png)

## 爲什麼我需要一個新的 Blog？

我覺得舊的不是不能用，但是我還是有些地方我不滿意，像是 dark mode 的體驗就一言難盡，雖然不醜（我是信奉"semple is better then complex"）但是就是看不順眼。最重要的是分享的時候沒有辦法顯示漂亮的 metadata，雖然後來我自己有加入這個功能，但是就不是很理想。而不理想的 blog 造成最大的問題就是我不太想寫東西。

## 爲什麼我需要一個 Blog？

這個應該比前面的問題更重要，這比較跟程式無關，簡單的說法就是我需要一個可以寫長文的地方。接著我們就可以討論另外兩個問題『爲什麼需要寫長文？』，『爲什麼需要在自己的Blog』

### 爲什麼需要寫長文？

有些時候想針對一件事情表達我的想法，也不是為了讓別人看，主要是表達自己的看法以及統整自己的想法。所以我會簡單的在[ Twitter ](https://www.twitter.com)寫這種東西。Meta系的平台在我個人的定位不是做這件事情的。但眾所周知，如果不是尊貴的藍勾勾用戶一條 tweet 是有字數限制的，我覺得這個問題不大，畢竟這是一種取捨。但是不是所有事情都可以在這麼短的字數裡面解釋清楚的，所以我還是需要找另外一個地方來寫這些東西。
![data vs wisdom](@assets/images/new-blog/data.jpeg)
對我個人來說我會想寫長文的時機總結就是總結前面一段時間做的事，每年的總結、經歷一件事的復盤或是單純記錄過程、閱讀心得（未來也許會有）。之前有看過一個說法是這樣的。我們要透過輸出來確定我們是不是學會一件事情，就像是上完課要寫作業。而現代人有一個問題就是輸入太多的資料(data)（先不討論資料本身是不是好的），我覺得透過寫長文至少可以提升到知識(knowledge)。訊息(information)應該在看的當下就可以處理了。至於最後的那幾個我認為需要的應該是實踐，這個目前不在我們討論的地方。

### 爲什麼需要自己弄一個 Blog?

我知道現在有很多的平台可以做到這件事，而且應該可以做的更好、擁有更多的功能、更方便（可以參考我之前的推文）

<blockquote class="twitter-tweet"><p lang="zh" dir="ltr">愛您 <a href="https://t.co/xN57vxoxJ1">pic.twitter.com/xN57vxoxJ1</a></p>&mdash; \u8b19@ (@cantpr09ram) <a href="https://twitter.com/cantpr09ram/status/1766137088385462698?ref_src=twsrc%5Etfw">March 8, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

那為什麼還是要做這件事呢？可以分兩個部分

#### 言論自由

我知道一個肥宅偶爾在自己的 Blog 上面寫一些沒有人在看的文章然後在那邊探討言論自由很可笑，but who know? 我認為這是一個很好的方式來捍衛自己的言論自由，如果有人不希望我寫的東西被看到(雖然這個基本上不可能)，我還是可以有辦法說我想說的。雖然它現在是跑在 Github Pages 上面，但是如果真的 Github 把這個網站 shutdown 我還是可以找另外一個平台，再不濟老子可以拿出我的樹莓派自己架伺服器，再不行我去貼海報就好了，反正至少資料還在。

#### 學習新技術

我還是想學一些有關網站的技術，雖然弄個 Static Site Generation 確實不太需要什麼特別的技術，反正我能從中學到一些新事物然後我順便可以有一個漂亮的網站何樂不為呢？

## 翻新過程

一開始的時候技術棧選定了，react、tailwind(並沒有說要踩誰捧誰，單純就是個人喜好)。本來這個網站是用 [Gatsby](https://www.gatsbyjs.com/) 其實我並不覺得 [Gatsby](https://www.gatsbyjs.com/) 有什麼特別的問題，但是聽說因為效能的問題所以很多人都跳槽到其他地方去了，所以我自然就先放棄這個就方案轉而去尋找新方案。<br>
接著我在網路上找到[這個](https://github.com/timlrx/tailwind-nextjs-starter-blog)，用[next.js](https://nextjs.org/) 開發的，加上[Vercel](https://vercel.com) 簡直潮到出水，實作後才發現這個專案預設是用[Vercel](https://vercel.com) deploy 的，反正就是跟 Github Action 有仇一樣永遠跑不出來，所以最後還是放棄這個方案的(問題應該出在[ Contentlayer ](https://contentlayer.dev/)上面，還有我菜)，而為什麼我堅持用 Github Pages 主要因為我希望網址不要改變(結果還是改了一些)<br>
![astro](@assets/images/new-blog/astro.png)
最後找到 [astro](https://astro.build/) 。反正 [astro](https://astro.build/)完美符合我前面設定的條件，而且跟 Github Pages 的兼容性明顯好很多，而且這個
[模板](https://github.com/satnaing/astro-paper) 基本上處於非常能用的階段，所以我就直接用[這個模板](https://github.com/satnaing/astro-paper)了。

## 總結

我對這個 Blog 目前的狀況當當滿意。當然我也有一些想改動的地方，這個慢慢處理就好了。除此之外，我希望可以有多一些的文章，畢竟這代表更多的思考、沈澱。
