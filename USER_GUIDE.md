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

---
*Gem Quest - Turning Habits into Victory.*
