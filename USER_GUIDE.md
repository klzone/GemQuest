# Gem Quest Command Center - User Guide (v1.0)

Welcome, Commander! "Gem Quest" is a gamified habit tracker designed to help your children (Junior and Senior Operators) build good habits through a fun, sci-fi interface.

## 🚀 Installation & Setup

### 1. Database Initialization (Crucial)
Before starting, you must initialize the database to set up the rules, missions, and badges.

1.  Log in to your **Supabase Dashboard**.
2.  Open the **SQL Editor**.
3.  Copy the content of `final_setup.sql` (found in the project root).
4.  Paste it into the editor and click **Run**.
5.  *Warning: This will RESET all current progress and data.*

---

## 👥 Operator Roles (Age Rules)

The system automatically distinguishes between two types of operators based on age logic:

| Feature | Junior Operator (8yo) | Senior Operator (12yo) |
| :--- | :--- | :--- |
| **Daily Limit** | **15 Hafu Coins** | **18 Hafu Coins** |
| **Mission Focus** | Routine, Short Duration | Deep Work, Self-Control |
| **Reward Value** | 3-4 Coins per task | 4-6 Coins per task |
| **Bonus Tasks** | Bypasses Daily Limit | Bypasses Daily Limit |

*To switch operators, click the Avatar in the top-left corner.*

---

## 📊 Features Overview

### 1. Missions (The Core Loop)
- **Routine**: Daily tasks (Study, Sports, Chores). Subject to daily coin limits.
- **Bonus**: Special tasks (Housework, Emotional Control) that are *always* available to earn extra.
- **Visuals**: Completion triggers confetti, sound effects, and a "Mission Complete" stamp.

### 2. Shop (Logistics)
- **Weekly Limited**: High-value rewards (Weekend trip, Big meal) appear at the top with a gold glow.
- **Standard Stock**: Snacks, Game Time.
- **Gear**: Virtual equipment that boosts "Combat Power" (Cosmetic only).

### 3. Achievements (Badges)
- **Behavioral**: Streaks (e.g., "3 Day Learning Streak").
- **Growth**: Totals (e.g., "30 Deep Work Sessions").
- **Identity**: Long-term habits (e.g., "90 Days").
- *Check the Profile tab to see unlocked badges.*

### 4. Parent Report (The Dashboard)
- **Access**: Click the **Clipboard Icon** in the bottom navigation.
- **Weekly Portrait**: Shows 3 dimensions (Focus, Proactive, Stability).
- **Coin Health**: Analyze if your child is a "Saver" or "Spender".
- **Tactical Advise**: Automated suggestions based on this week's data.

---

## 🛠 Troubleshooting

- **"Daily Limit Reached" error**: This is a feature, not a bug! Encourage the child to do "Bonus" tasks (Housework) to earn more.
- **No Sound**: Ensure the device is not in Silent Mode. Interacting with the page typically unmutes audio.
- **Data Not Saving**: Check your internet connection (Supabase requires online access).


## 📱 手机端安装指南 (Mobile Support)

### 方案 A：网页直装 (推荐 - PWA)
本应用已升级为 **PWA (渐进式 Web 应用)**，无需下载安装包即可体验原生 App 效果。
1.  在手机浏览器（Safari 或 Chrome）打开应用网址。
2.  点击浏览器菜单中的 **"添加到主屏幕" (Add to Home Screen)**。
3.  应用会自动安装到桌面，全屏运行，无地址栏，体验极佳。

### 方案 B：安卓安装包 (APK)
如果您需要原生安装包 (.apk)：
1.  将本项目代码上传至 GitHub。
2.  点击 GitHub 仓库顶部的 **Actions** 标签。
3.  点击左侧的 **Build Android APK** 工作流。
4.  点击最新的运行记录，在底部 **Artifacts** 区域下载 `gem-quest-debug.apk`。

---
*Gem Quest - Turning Habits into Victory.*
