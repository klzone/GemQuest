import './style.css'
import { supabase } from './supabase'
import { audioManager } from './audio'
import { vfxManager } from './vfx'

const app = document.querySelector('#app')

// Initialize Audio on first interaction
document.addEventListener('click', () => {
  audioManager.init();
  audioManager.playClick();
}, { once: true });

// Global Click Sound for buttons
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.closest('.mission-card') || e.target.closest('.nav-item')) {
    audioManager.playClick();
  }
});

const i18n = {
  zh: {
    rank: '权限等级',
    sectionTitle: '行动指令',
    rewardSuffix: 'XP',
    nav: {
      quests: '作战任务',
      profile: '干员档案',
      rewards: '后勤基地',
      command: '指挥中心'
    },
    missionTypes: ['[侦察]', '[收集]', '[训练]', '[战备]'],
    parentTitle: '指挥官终端 - 权限等级 S1',
    addMission: '发布新指令',
    adjustXP: '手动授勋 (XP)',
    commandAuthorized: '指挥官权限已启用',
    deployMission: '部署新指令 / DEPLOY MISSION',
    missionDescription: '指令描述...',
    rewardLabel: '奖励 XP...',
    executeDeployment: '正式部署指令',
    operatorLabel: '当前干员: ',
    xpGrant: 'XP 授权仪式',
    exit: '退出终端 [X]',
    status: {
      success: '行动成功',
      inProgress: '行动中'
    },
    loading: '正在初始化战术链路...',
    shopTitle: '后勤物资兑换',
    medalsTitle: '荣誉勋章殿堂',
    buy: '兑换物资',
    insufficient: '点数不足',
    purchased: '已兑换',
    editProfile: '编辑干员档案',
    opName: '代号 (Name)',
    opXP: '战备点数 (XP)',
    saveChanges: '保存档案变更',
    manageMissions: '作战任务管理',
    chkDaily: '每日任务',
    chkWeekly: '每周任务',
    btnDelete: '删除 / DELETE',
    statsTitle: '作战数据分析',
    totalMissions: '累计任务数',
    totalRewards: '物资消耗统计',
    streak: '连续出勤天数',
    analysis: '数据链路分析',
    profile: {
      title: '干员详细档案 / PROFILE',
      attr: '基础属性 / ATTRIBUTES',
      gear: '战术装备 / LOADOUT',
      str: '体能 (STR)',
      int: '智力 (INT)',
      tec: '技术 (TEC)',
      power: '综合战力 (POWER)'
    },
    power: '综合战力', // Fix for undefined
    manageRewards: '后勤物资管理',
    newReward: '录入新物资',
    realItem: '实物奖励 (Logistics)',
    virtualItem: '虚拟权益 (Virtual)',
    gearItem: '战术装备 (Armory)',
    costLabel: '兑换价格 (H-Coin)',
    recycle: '物资回收 / 军械库回购 (80% Refund)',
    confirmRecycle: '确认回收此物资吗？将返还80%点数。',
    chooseCategory: '选择任务属性方向',
    shopTabLogistics: '后勤物资 (LOGISTICS)',
    shopTabArmory: '战术军械 (ARMORY)',
    sellConfirm: '确认出售此装备？',
    sellRefund: '将返还 80% 价值：',
    report: {
      str: '综合素质',
      int: '专注行为',
      tec: '主动行为',
      mood: '情绪稳定'
    }
  }
}

const CATEGORY_MAP = {
  '[智力]': { attr: 'INT', label: '智力', color: '#42a5f5' },
  '[体能]': { attr: 'STR', label: '体能', color: '#ef5350' },
  '[内务]': { attr: 'TEC', label: '勤务', color: '#ffa726' },
  '[特勤]': { attr: 'ALL', label: '特殊', color: '#ab47bc' }
};

const GEAR_SLOTS = ['HEAD', 'BODY', 'LEGS', 'FEET', 'WEAPON'];
const SLOT_ICONS = { HEAD: '⛑️', BODY: '🦺', LEGS: '🦵', FEET: '🥾', WEAPON: '🔫' };
const SLOT_NAMES = { HEAD: '头饰', BODY: '躯干', LEGS: '下肢', FEET: '足部', WEAPON: '主武器' };


const config = { lang: 'zh' }

const state = {
  operators: [],
  missions: [],
  rewards: [],
  achievements: [],
  progress: {}, // { missionId: percent }
  purchases: [], // List of reward IDs purchased by current op
  earnedMedals: [], // List of achievement IDs earned by current op
  activeOpIndex: 0,
  activeNav: 'quests',
  loading: true,
  combatPower: 0, // Global power
  bestGear: {} // Cache best gear
}

function t(key) {
  const keys = key.split('.');
  let value = i18n[config.lang];
  for (const k of keys) value = value[k];
  return value;
}

const icons = {
  quests: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"></path><path d="M12 2v16"></path></svg>`,
  achievements: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><circle cx="12" cy="8" r="6"></circle><path d="M15.41 12.5L12 11l-3.41 1.5L10 19l2-1 2 1-1.41-6.5z"></path></svg>`,
  rewards: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><path d="M2 20h20M4 20V5h16v15M8 20v-5h8v5M8 10h8M8 7h8"></path></svg>`,
  command: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M9 9h6v6H9z"></path><path d="M9 1h6"></path><path d="M1 9v6"></path><path d="M23 9v6"></path><path d="M9 23h6"></path></svg>`
}

async function initData() {
  try {
    state.loading = true;
    render();

    // 1. Fetch Operators
    const { data: ops, error: opError } = await supabase.from('operators').select('*').order('code_name');
    if (opError) throw opError;

    if (ops && ops.length > 0) {
      state.operators = ops;
    } else {
      // Seed if empty (first run)
      const { data: newOps, error: seedError } = await supabase.from('operators').insert([
        { code_name: 'LEO', security_rank: 'SR-05', tac_xp: 2450 },
        { code_name: 'MIA', security_rank: 'SR-03', tac_xp: 1820 }
      ]).select();
      if (seedError) throw seedError;
      state.operators = newOps || [];
    }

    // 2. Fetch Global Content
    const { data: missions, error: missError } = await supabase.from('missions').select('*').order('id');
    if (missError) throw missError;
    state.missions = missions || [];

    const { data: rewards, error: rewError } = await supabase.from('rewards').select('*').order('cost');
    if (rewError) throw rewError;
    state.rewards = rewards || [];

    const { data: achievements, error: achError } = await supabase.from('achievements').select('*');
    if (achError) throw achError;
    state.achievements = achievements || [];

    // 3. Fetch User Progress
    await fetchUserData();

    state.loading = false;
    render();
  } catch (err) {
    console.error('Init Error:', err);
    alert('System Initialization Failed: ' + (err.message || 'Unknown Error'));
    state.loading = false;
    render();
  }
}

async function fetchUserData() {
  const currentOp = state.operators[state.activeOpIndex];
  if (!currentOp) return;

  // Mission Progress
  // Mission Progress & Daily Reset Check
  const { data: prog } = await supabase.from('mission_progress').select('*').eq('operator_id', currentOp.id);
  const progMap = {};
  const today = new Date().toISOString().split('T')[0];

  prog?.forEach(p => {
    // Check for resets
    const mission = state.missions.find(m => m.id === p.mission_id);
    if (!mission) return;

    if (mission.recurrence === 'daily' && p.updated_at.split('T')[0] !== today) {
      progMap[p.mission_id] = 0;
    } else if (mission.recurrence === 'weekly') {
      const last = new Date(p.updated_at);
      const now = new Date();
      const diffTime = Math.abs(now - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) {
        progMap[p.mission_id] = 0;
      } else {
        progMap[p.mission_id] = p.progress_percent;
      }
    } else {
      progMap[p.mission_id] = p.progress_percent;
    }
  });
  state.progress = progMap;

  // Purchases
  const { data: pur } = await supabase.from('purchases').select('reward_id').eq('operator_id', currentOp.id);
  state.purchases = pur?.map(p => p.reward_id) || [];

  // Medals
  const { data: med } = await supabase.from('operator_achievements').select('achievement_id').eq('operator_id', currentOp.id);
  state.earnedMedals = med?.map(m => m.achievement_id) || [];

  // Calculate Global Power immediately
  const stats = calculateCombatPower();
  state.combatPower = stats.power;
  state.bestGear = stats.bestGear;
}

function getDailyCap(age) {
  // 8yo = 15 coins, 12yo = 18 coins
  return age === 12 ? 18 : 15;
}

function checkDailyCap(op, mission) {
  // Bonus categories bypass cap
  if (['[特勤]', '[内务]'].includes(mission.category)) return true;

  const limit = getDailyCap(op.age_group);

  // Calculate coins earned today from ROUTINE tasks
  let earnedToday = 0;
  state.missions.forEach(m => {
    // If completed AND is routine AND is daily
    if (state.progress[m.id] === 100 &&
      m.recurrence === 'daily' &&
      !['[特勤]', '[内务]'].includes(m.category)) {
      earnedToday += m.xp_reward;
    }
  });

  if (earnedToday >= limit) {
    audioManager.playError();
    vfxManager.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `今日已达上限 (${limit})`, '#ff5252');
    return false;
  }

  // Check if this specific mission would exceed limit? 
  // User Rule: "Daily Limit 15". If I have 14 and do a 4 coin task... usually allow finish?
  // Let's strictly enforce PRE-CHECK. If already >= limit, block.
  // If current + reward > limit, maybe allow it as a "soft cap" finish? 
  // Simple logic: If we are already AT or ABOVE limit, stop. 
  // If we are at 14/15, allow the last task.
  return true;
}

async function updateProgress(missionId) {
  const currentOp = state.operators[state.activeOpIndex];
  if (!currentOp) return;

  const mission = state.missions.find(m => m.id === missionId);
  if (!mission) return;

  // Age Gate (Double check)
  if (mission.target_group !== 0 && mission.target_group !== currentOp.age_group) {
    alert('权限不匹配 (Rank Restriction)');
    return;
  }

  // Cap Check
  if (!checkDailyCap(currentOp, mission)) return;

  const currentVal = state.progress[missionId] || 0;
  if (currentVal >= 100) return;

  const newVal = Math.min(100, currentVal + 20);

  // Optimistic UI
  state.progress[missionId] = newVal;
  render();

  // DB Sync
  const { error } = await supabase
    .from('mission_progress')
    .upsert({
      operator_id: currentOp.id,
      mission_id: missionId,
      progress_percent: newVal,
      status: newVal === 100 ? 'SUCCESS' : 'IN_PROGRESS',
      last_completed_date: newVal === 100 ? new Date().toISOString().split('T')[0] : null
    }, { onConflict: 'operator_id,mission_id' });

  // Visual & Audio Feedback
  if (newVal === 100) {
    const card = document.querySelector(`.mission-card[onclick*="${missionId}"]`);
    if (card) {
      const rect = card.getBoundingClientRect();
      vfxManager.spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    audioManager.playSuccess();

    // Show +XP floating text
    const mission = state.missions.find(m => m.id === missionId);
    if (mission && card) {
      const rect = card.getBoundingClientRect();
      vfxManager.spawnFloatingText(rect.left + rect.width / 2, rect.top, `+${mission.xp_reward} XP`);
    }

    checkAchievements(currentOp);
  } else {
    audioManager.playCount(); // Small sound for progress
  }
}

async function checkAchievements(op) {
  // Simple mock check for 'First Mission'
  const hasFirstMedal = state.earnedMedals.includes('MEDAL-001');
  if (!hasFirstMedal) {
    state.earnedMedals.push('MEDAL-001');
    await supabase.from('operator_achievements').insert([{ operator_id: op.id, achievement_id: 'MEDAL-001' }]);

    // Medal Unlock Effect
    audioManager.playSuccess();
    vfxManager.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `🎖️ 勋章授予：新兵入伍！`, '#ffd700');
    vfxManager.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2);

    render();
  }
}

async function purchaseReward(rewardId, cost) {
  const op = state.operators[state.activeOpIndex];
  if (op.tac_xp < cost) {
    audioManager.playError();
    // Get button position if possible, else center
    const btn = document.activeElement;
    const x = btn ? btn.getBoundingClientRect().left : window.innerWidth / 2;
    const y = btn ? btn.getBoundingClientRect().top : window.innerHeight / 2;
    vfxManager.spawnFloatingText(x, y, t('insufficient'), '#ff5252');
    return;
  }

  if (!confirm(`确认消耗 ${cost} XP 兑换此物资吗？`)) return;

  // Deduct XP
  op.tac_xp -= cost;
  state.purchases.push(rewardId);

  audioManager.playEquip();

  // Show -XP floating text
  const btn = document.activeElement;
  if (btn) {
    const rect = btn.getBoundingClientRect();
    vfxManager.spawnFloatingText(rect.left + rect.width / 2, rect.top, `-${cost} XP`, '#ff5252');
  }

  render();

  // DB Transaction equivalent
  await supabase.from('operators').update({ tac_xp: op.tac_xp }).eq('id', op.id);
  await supabase.from('purchases').insert([{ operator_id: op.id, reward_id: rewardId, cost_at_purchase: cost }]);
}

// --- Stats Renderer ---
function renderStats(op) {
  const totalMissions = Object.values(state.progress).filter(v => v === 100).length;
  const totalPurchases = state.purchases.length;
  // Mock streak for now, ideally calc from dates
  const streak = 3;

  return `
      <div class="cmd-section" style="background: rgba(0, 255, 255, 0.05); padding: 15px; border: 1px dashed var(--c-accent); margin-top: 20px;">
        <div class="res-label" style="margin-bottom: 10px; color: cyan;">${t('analysis')} - ${op.code_name}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
            <div>
              <div style="font-size: 20px; color: #fff; font-family: var(--font-tech);">${totalMissions}</div>
              <div style="font-size: 10px; color: #aaa;">${t('totalMissions')}</div>
            </div>
            <div>
              <div style="font-size: 20px; color: #fff; font-family: var(--font-tech);">${totalPurchases}</div>
              <div style="font-size: 10px; color: #aaa;">${t('totalRewards')}</div>
            </div>
            <div>
              <div style="font-size: 20px; color: #fff; font-family: var(--font-tech);">${streak}</div>
              <div style="font-size: 10px; color: #aaa;">${t('streak')}</div>
            </div>
        </div>
      </div>
    `;
}

function renderCommandCenter() {
  const op = state.operators[state.activeOpIndex];
  app.innerHTML = `
    <header class="header">
      <div style="font-family: var(--font-tech); color: var(--c-accent); font-size: 12px; letter-spacing: 2px;">${t('parentTitle')}</div>
      <div onclick="window.switchNav('quests')" style="cursor: pointer; color: rgba(255,255,255,0.4); font-size: 10px; font-family: var(--font-tech);">${t('exit')}</div>
    </header>

    <main class="mission-stage">
      <div class="mission-header" style="border-bottom: 1px solid var(--c-border); padding-bottom: 15px; margin-bottom: 25px;">
        <div class="status-dot" style="background: #ff0000; box-shadow: 0 0 10px #ff0000;"></div>
        <div class="section-title" style="color: #ff0000;">${t('commandAuthorized')}</div>
      </div>
      
      <div style="padding: 15px;">
        <button onclick="window.toggleHelp()" style="width: 100%; background: #2196f3; color: white; border: none; padding: 12px; font-weight: bold; margin-bottom: 20px; font-family: var(--font-tech);">📖 打开使用指南 (OPEN HELP MANUAL)</button>

      <div class="command-panel" style="display: grid; gap: 20px;">
        <div class="cmd-section" style="background: rgba(255,152,0,0.05); padding: 15px; border: 1px dashed var(--c-border);">
          <div class="res-label" style="margin-bottom: 10px;">${t('adjustXP')} - ${op.code_name}</div>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.addXP(10)" style="flex: 1; background: var(--c-accent-dim); border: 1px solid var(--c-accent); color: var(--c-accent); padding: 8px; font-family: var(--font-tech);">+10 XP</button>
            <button onclick="window.addXP(50)" style="flex: 1; background: var(--c-accent-dim); border: 1px solid var(--c-accent); color: var(--c-accent); padding: 8px; font-family: var(--font-tech);">+50 XP</button>
            <button onclick="window.addXP(100)" style="flex: 1; background: var(--c-accent-dim); border: 1px solid var(--c-accent); color: var(--c-accent); padding: 8px; font-family: var(--font-tech);">+100 XP</button>
          </div>
        </div>

        <div class="cmd-section" style="background: rgba(255,152,0,0.05); padding: 15px; border: 1px dashed var(--c-border);">
          <div class="res-label" style="margin-bottom: 10px;">${t('editProfile')}</div>
          <input id="edit-op-name" value="${op.code_name}" placeholder="${t('opName')}" style="width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px; margin-bottom: 10px; font-family: var(--font-main);">
          <input id="edit-op-xp" type="number" value="${op.tac_xp}" placeholder="${t('opXP')}" style="width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px; margin-bottom: 10px; font-family: var(--font-tech);">
          <button onclick="window.saveProfile()" style="width: 100%; background: var(--c-accent); color: #000; border: none; padding: 12px; font-weight: 900; letter-spacing: 2px;">${t('saveChanges')}</button>
        </div>

        ${renderStats(op)}

        </div>

        <div class="cmd-section" style="background: rgba(255,152,0,0.05); padding: 15px; border: 1px dashed var(--c-border);">
          <div class="res-label" style="margin-bottom: 10px;">${t('manageMissions')}</div>
          <div style="max-height: 300px; overflow-y: auto;">
            ${state.missions.map(m => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px; margin-bottom: 5px; border-left: 2px solid ${m.recurrence === 'daily' ? 'var(--c-accent)' : '#555'};">
                 <div>
                   <div style="font-size: 14px; color: #fff;">${m.title}</div>
                   <div style="font-size: 10px; color: #aaa; font-family: var(--font-tech);">XP: ${m.xp_reward} | ${m.recurrence === 'daily' ? '📅 DAILY' : '⏺ ONCE'}</div>
                 </div>
                 <button onclick="window.deleteMission('${m.id}')" style="background: #333; color: #ff0000; border: none; padding: 5px 10px; font-size: 10px; font-family: var(--font-tech); cursor: pointer;">[DEL]</button>
              </div>
            `).join('')}
          </div>
        </div>

        </div>

        <!-- REWARD MANAGEMENT -->
        <div class="cmd-section" style="background: rgba(76, 175, 80, 0.05); padding: 15px; border: 1px dashed var(--c-accent);">
           <div class="res-label" style="margin-bottom: 10px;">${t('manageRewards')}</div>
           
           <!-- Add Reward -->
           <div style="margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
             <input id="new-reward-title" placeholder="物资名称 / Item Name" style="width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 8px; margin-bottom: 5px; font-family: var(--font-main); font-size: 12px;">
             <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <input id="new-reward-cost" type="number" placeholder="${t('costLabel')}" style="flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 8px; font-family: var(--font-tech); font-size: 12px;">
                <input id="new-reward-power" type="number" placeholder="战力值 (Power)" style="width: 80px; background: #000; border: 1px solid #333; color: #fff; padding: 8px; font-family: var(--font-tech); font-size: 12px;">
             </div>
             <div style="display: flex; gap: 5px;">
                <select id="new-reward-type" style="flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 8px; font-size: 12px;" onchange="window.toggleSlotSelect()">
                   <option value="REAL">${t('realItem')}</option>
                   <option value="VIRTUAL">${t('virtualItem')}</option>
                   <option value="GEAR">${t('gearItem')}</option>
                </select>
                <select id="new-reward-slot" style="flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 8px; font-size: 12px; display: none;">
                   <option value="" disabled selected>部位 / Slot</option>
                   ${GEAR_SLOTS.map(s => `<option value="${s}">${SLOT_NAMES[s]} (${s})</option>`).join('')}
                </select>
             </div>
             <div style="display: flex; align-items: center; gap: 5px; margin-top: 5px;">
                <input type="checkbox" id="new-reward-limit" style="accent-color: #ffd700;">
                <label for="new-reward-limit" style="color: #ffd700; font-size: 12px; font-weight: bold;">WEEKLY RARE (LIMITED)</label>
             </div>
             <button onclick="window.addReward()" style="width: 100%; margin-top: 5px; background: #4caf50; color: #000; border: none; padding: 8px; font-weight: bold; font-size: 12px;">+ ${t('newReward')}</button>
           </div>
           
           <!-- List Rewards -->
           <div style="max-height: 200px; overflow-y: auto;">
             ${state.rewards.map(r => `
               <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 5px; margin-bottom: 3px;">
                  <div style="font-size: 10px;">${r.title} (${r.cost}) ${r.type === 'GEAR' ? `[⚡${r.power_value}]` : ''}</div>
                  <button onclick="window.deleteReward('${r.id}')" style="background: none; border: none; color: #aa0000; cursor: pointer;">×</button>
               </div>
             `).join('')}
           </div>

           <!-- Recycle Center -->
           <div class="res-label" style="margin-top: 15px; margin-bottom: 5px; font-size: 10px; color: #aaa;">${t('recycle')} - ${op.code_name}</div>
           <div style="max-height: 150px; overflow-y: auto;">
              ${state.purchases.map(pid => {
    const r = state.rewards.find(x => x.id === pid);
    if (!r) return '';
    return `
                 <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,152,0,0.1); padding: 5px; margin-bottom: 3px;">
                    <div style="font-size: 10px;">${r.title} ${r.type === 'GEAR' ? `(⚡${r.power_value})` : ''}</div>
                    <button onclick="window.recycleItem('${pid}', ${r.cost})" style="background: #333; color: var(--c-accent); border: 1px solid var(--c-accent); padding: 2px 5px; font-size: 9px;">↺ 80%</button>
                 </div>
                 `;
  }).join('')}
           </div>
        </div>

        <div class="cmd-section" style="background: rgba(255,152,0,0.05); padding: 15px; border: 1px dashed var(--c-border);">

        <div class="cmd-section" style="background: rgba(255,152,0,0.05); padding: 15px; border: 1px dashed var(--c-border);">
          <div class="res-label" style="margin-bottom: 10px;">${t('deployMission')}</div>
          <input id="new-mission-title" placeholder="${t('missionDescription')}" style="width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px; margin-bottom: 10px; font-family: var(--font-main);">
          <select id="new-mission-category" style="width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px; margin-bottom: 10px; font-family: var(--font-main);">
             <option value="" disabled selected>${t('chooseCategory')}</option>
             ${Object.keys(CATEGORY_MAP).map(k => `<option value="${k}">${k} - ${CATEGORY_MAP[k].label} (${CATEGORY_MAP[k].attr})</option>`).join('')}
          </select>
          <input id="new-mission-reward" type="number" placeholder="${t('rewardLabel')}" style="width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px; margin-bottom: 10px; font-family: var(--font-tech);">
          <div style="display: flex; align-items: center; margin-bottom: 10px; gap: 15px;">
             <div style="display: flex; align-items: center; gap: 5px;">
                <input type="checkbox" id="new-mission-daily" style="accent-color: var(--c-accent);" onclick="document.getElementById('new-mission-weekly').checked = false">
                <label for="new-mission-daily" style="font-size: 12px; color: #aaa;">${t('chkDaily')}</label>
             </div>
             <div style="display: flex; align-items: center; gap: 5px;">
                <input type="checkbox" id="new-mission-weekly" style="accent-color: var(--c-accent);" onclick="document.getElementById('new-mission-daily').checked = false">
                <label for="new-mission-weekly" style="font-size: 12px; color: #aaa;">${t('chkWeekly')}</label>
             </div>
          </div>
          <button onclick="window.handleDeploy()" style="width: 100%; background: var(--c-accent); color: #000; border: none; padding: 12px; font-weight: 900; letter-spacing: 2px;">${t('executeDeployment')}</button>
        </div>
      </div>
    </main>
    ${renderNav('command')}
  `;
}

// --- REWARDS RENDERER (Split Logistics/Armory) ---
function renderRewards() {
  const op = state.operators[state.activeOpIndex];

  // Filter
  const limited = state.rewards.filter(r => r.is_limited);
  const logistics = state.rewards.filter(r => r.type !== 'GEAR' && !r.is_limited);
  const armory = state.rewards.filter(r => r.type === 'GEAR' && !r.is_limited);

  const renderCard = (r, isRare = false) => {
    const purchased = state.purchases.includes(r.id);
    const canAfford = op.tac_xp >= r.cost;
    const isGear = r.type === 'GEAR';

    return `
      <div class="mission-card ${isRare ? 'rare-item' : ''}" style="border-left-color: ${purchased ? (isGear ? '#ffd700' : '#4caf50') : (canAfford ? 'var(--c-accent)' : '#555')}">
        ${isRare ? '<div class="rare-tag">WEEKLY RARE</div>' : ''}
        <div class="mission-top">
          <span class="mission-id" style="font-size: 14px;">${r.icon || (isGear ? SLOT_ICONS[r.gear_slot || 'WEAPON'] : '📦')}</span>
          <span class="mission-reward" style="color: ${canAfford ? 'var(--c-accent)' : '#aaa'}">${r.cost} H</span>
        </div>
        <div class="mission-title" style="margin-bottom: 5px; font-size: ${isRare ? '14px' : '12px'};">${r.title}</div>
        ${isGear ? `<div style="font-size:10px; color: var(--c-accent); margin-bottom: 5px;">⚡ POWER +${r.power_value || 0}</div>` : ''}
        <button onclick="window.purchaseReward('${r.id}', ${r.cost})" 
          class="btn-buy ${purchased ? 'owned' : (canAfford ? 'active' : 'disabled')}">
          ${purchased ? (isGear ? 'OWNED' : t('purchased')) : (canAfford ? t('buy') : t('insufficient'))}
        </button>
      </div>
    `;
  };

  return `
    <div class="mission-header" style="flex-direction: column; align-items: flex-start; gap: 10px;">
       <div style="display: flex; justify-content: space-between; width: 100%;">
         <div class="section-title">${t('shopTitle')}</div>
         <div class="res-value" style="font-size: 14px;">${op.tac_xp} H</div>
       </div>
    </div>
    
    <div style="overflow-y: auto; padding-bottom: 20px;">
       
       <!-- LIMITED SECTION -->
       ${limited.length > 0 ? `
         <div class="res-label" style="margin: 5px 0 10px 0; color: #ffd700; text-align: center; border-bottom: 1px dashed #ffd700; padding-bottom: 5px;">★ WEEKLY LIMITED ★</div>
         <div class="shop-grid">
           ${limited.map(r => renderCard(r, true)).join('')}
         </div>
       ` : ''}

       <div class="res-label" style="margin: 15px 0 10px 0; color: #4caf50;">${t('shopTabLogistics')}</div>
       <div class="shop-grid">
         ${logistics.length > 0 ? logistics.map(r => renderCard(r)).join('') : '<div style="opacity:0.5; padding:20px; text-align:center; grid-column: 1/-1;">暂无物资</div>'}
       </div>

       <div class="res-label" style="margin: 30px 0 10px 0; color: #ffd700;">${t('shopTabArmory')}</div>
       <div class="shop-grid">
         ${armory.length > 0 ? armory.map(r => renderCard(r)).join('') : '<div style="opacity:0.5; padding:20px; text-align:center; grid-column: 1/-1;">暂无军械</div>'}
       </div>
    </div>
  `;
}

// --- COMBAT POWER CALCULATION ---
function calculateCombatPower() {
  // 1. Stats calc
  let stats = { str: 10, int: 10, tec: 10 };
  Object.keys(state.progress).forEach(mid => {
    if (state.progress[mid] === 100) {
      const m = state.missions.find(x => x.id === mid);
      if (!m) return;
      const cat = CATEGORY_MAP[m.category];
      if (cat) {
        if (cat.attr.includes('STR')) stats.str += 5;
        if (cat.attr.includes('INT')) stats.int += 5;
        if (cat.attr.includes('TEC')) stats.tec += 5;
      }
      if (m.category.includes('内务')) stats.str += 2;
    }
  });

  // 2. Gear Power calc
  // Find all purchased gear
  const myGear = state.purchases.map(pid => state.rewards.find(r => r.id === pid)).filter(r => r && r.type === 'GEAR');

  // Find BEST gear for each slot
  const bestGear = {};
  GEAR_SLOTS.forEach(slot => {
    const slotGear = myGear.filter(g => g.gear_slot === slot);
    // Sort by power desc
    slotGear.sort((a, b) => (b.power_value || 0) - (a.power_value || 0));
    if (slotGear.length > 0) bestGear[slot] = slotGear[0];
  });

  // Total Power = (STR+INT+TEC) * 10 + Sum(Gear Power)
  const baseAttrSum = stats.str + stats.int + stats.tec;
  let gearPowerSum = 0;
  Object.values(bestGear).forEach(g => gearPowerSum += (g.power_value || 0));

  const totalPower = (baseAttrSum * 5) + gearPowerSum;

  return {
    str: Math.min(100, stats.str),
    int: Math.min(100, stats.int),
    tec: Math.min(100, stats.tec),
    power: totalPower,
    bestGear: bestGear
  };
}

function renderProfile() {
  const op = state.operators[state.activeOpIndex];
  const stats = calculateCombatPower();

  return `
      <div class="mission-header">
        <div class="status-dot"></div>
        <div class="section-title">${t('profile.title')}</div>
      </div>

      <!-- 1. Avatar & Quick Stats -->
      <div style="display: flex; gap: 15px; margin-bottom: 20px;">
         <!-- Avatar Case -->
         <div style="width: 140px; border: 1px solid var(--c-accent); background: rgba(0,0,0,0.5); display: flex; flex-direction: column;">
             <div style="flex: 1; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <!-- Generated Avatar -->
                <img src="/assets/avatar.png" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                <!-- Fallback Silhouette -->
                <svg viewBox="0 0 24 24" fill="var(--c-accent)" style="width: 80%; height: 80%; opacity: 0.8; display: none;">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <!-- Rank Badge -->
                <div style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.8); color: var(--c-accent); border:1px solid var(--c-accent); font-family: var(--font-tech); font-size: 8px; padding: 2px 4px;">${op.security_rank}</div>
             </div>
            <!-- Combat Power Display -->
            <div style="background: var(--c-accent); color: #000; font-family: var(--font-tech); text-align: center; padding: 5px;">
               <div style="font-size: 8px; letter-spacing: 1px;">综合战力</div>
               <div style="font-size: 18px; font-weight: 900;">${state.combatPower}</div>
            </div>
         </div>
         
         <div style="flex: 1; display: flex; flex-direction: column; gap: 15px; justify-content: center;">
            <!-- Attributes -->
            <div>
               <div style="display: flex; justify-content: space-between; font-size: 10px; color: #888; margin-bottom: 2px;">
                 <span>${t('profile.str')}</span><span style="font-family: var(--font-tech); color: var(--c-accent);">${stats.str}</span>
               </div>
               <div style="height: 6px; background: #333; clip-path: polygon(0 0, 100% 0, 98% 100%, 0% 100%);"><div style="width: ${stats.str}%; height: 100%; background: #ef5350;"></div></div>
            </div>
            <div>
               <div style="display: flex; justify-content: space-between; font-size: 10px; color: #888; margin-bottom: 2px;">
                 <span>${t('profile.int')}</span><span style="font-family: var(--font-tech); color: var(--c-accent);">${stats.int}</span>
               </div>
               <div style="height: 6px; background: #333; clip-path: polygon(0 0, 100% 0, 98% 100%, 0% 100%);"><div style="width: ${stats.int}%; height: 100%; background: #42a5f5;"></div></div>
            </div>
            <div>
               <div style="display: flex; justify-content: space-between; font-size: 10px; color: #888; margin-bottom: 2px;">
                 <span>${t('profile.tec')}</span><span style="font-family: var(--font-tech); color: var(--c-accent);">${stats.tec}</span>
               </div>
               <div style="height: 6px; background: #333; clip-path: polygon(0 0, 100% 0, 98% 100%, 0% 100%);"><div style="width: ${stats.tec}%; height: 100%; background: #ffa726;"></div></div>
            </div>
         </div>
      </div>

      <!-- 2. Tactical Loadout (5 Slots) -->
      <div style="margin-bottom: 20px;">
        <div class="res-label" style="margin-bottom: 8px;">${t('profile.gear')}</div>
        <div style="display: flex; gap: 5px; justify-content: space-between;">
           ${GEAR_SLOTS.map(slot => {
    const item = state.bestGear[slot];
    return `
               <div onclick="window.inspectItem('${slot}')" style="flex: 1; aspect-ratio: 0.8; background: rgba(255,255,255,0.05); border: 1px solid ${item ? '#ffd700' : '#333'}; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
                 <div style="font-size: 20px;">${item ? (item.icon || SLOT_ICONS[slot]) : SLOT_ICONS[slot]}</div>
                 <div style="position: absolute; bottom: 2px; font-size: 8px; color: ${item ? '#ffd700' : '#555'}; font-family: var(--font-tech);">${item ? 'LV.' + (item.power_value / 10).toFixed(0) : 'EMPTY'}</div>
                 <div style="position: absolute; top: 2px; left: 2px; font-size: 7px; color: #555;">${slot.substring(0, 1)}</div>
               </div>
             `;
  }).join('')}
        </div>
      </div>

      <!-- 3. Medals (Grid Showcase) -->
      <div>
        <div class="res-label" style="margin-bottom: 8px;">${t('medalsTitle')}</div>
        <div class="medal-grid">
           ${state.achievements.map(m => {
    const earned = state.earnedMedals.includes(m.id);
    return `
               <div class="medal-item ${earned ? 'earned' : ''}">
                  <div class="medal-icon">${m.icon}</div>
                  <div style="font-size: 8px; text-align: center; margin-top: 4px; line-height: 1.1; color: ${earned ? '#fff' : '#555'}">${m.title}</div>
               </div>
               `;
  }).join('')}
        </div>
      </div>
    `;
}

function renderNav(active) {
  return `
    <nav class="nav-ops">
      <div class="nav-item ${active === 'quests' ? 'active' : ''}" onclick="window.switchNav('quests')">
        <span class="nav-icon">${icons.quests}</span>
        <span class="nav-label">${t('nav.quests')}</span>
      </div>
      <div class="nav-item ${active === 'profile' ? 'active' : ''}" onclick="window.switchNav('profile')">
        <span class="nav-icon">${icons.achievements}</span>
        <span class="nav-label">${t('nav.profile')}</span>
      </div>
      <div class="nav-item ${active === 'rewards' ? 'active' : ''}" onclick="window.switchNav('rewards')">
        <span class="nav-icon">${icons.rewards}</span>
        <span class="nav-label">${t('nav.rewards')}</span>
      </div>
      <div class="nav-item ${active === 'report' ? 'active' : ''}" onclick="window.switchNav('report')">
        <span class="nav-icon">${icons.report}</span>
        <span class="nav-label">${t('report.str')}</span>
      </div>
    </nav>
    `;
}

function calculateWeeklyStats(op) {
  // Mock data for demo if stats are empty
  const stats = op.stats || {};

  // 1. Weekly Portrait Metrics (0-100)
  // Focus: [智力] missions count / target (e.g. 10/week)
  // Proactive: [内务] + [收集] / target
  // Stability: [特勤] / target

  const focusCount = (stats['cat_[智力]']?.count || 0);
  const proactiveCount = (stats['cat_[内务]']?.count || 0) + (stats['cat_[收集]']?.count || 0);
  const stabilityCount = (stats['cat_[特勤]']?.count || 0); // "Emotional stability" missions

  const focusScore = Math.min(100, Math.round((focusCount / 10) * 100)); // Target 10 learning tasks
  const proactiveScore = Math.min(100, Math.round((proactiveCount / 5) * 100)); // Target 5 chores
  const stabilityScore = Math.min(100, Math.round((stabilityCount / 3) * 100)); // Target 3 control tasks

  // 2. Coin Health
  // In a real app, query 'purchases' table with created_at > week_start
  // Here we mock based on 'tac_xp' and 'purchases.length'
  const income = op.tac_xp + (state.purchases.length * 50); // Rough estimate of lifetime earnings
  const expense = state.purchases.reduce((acc, pid) => {
    const r = state.rewards.find(reward => reward.id === pid);
    return acc + (r ? r.cost : 0);
  }, 0);
  const savings = op.tac_xp;

  // 3. Evaluation
  let summary = "";
  if (focusScore > 80) summary += "本周专注力极佳，"; else summary += "本周学习专注度有待提升，";
  if (proactiveScore > 60) summary += "能主动分担家务，"; else summary += "家务参与度较低，";
  if (stabilityScore > 50) summary += "情绪控制良好。"; else summary += "需关注情绪管理。";

  // 4. Coin Habit
  let coin_habit = "";
  if (savings > expense * 2) coin_habit = "仓鼠型 (只存不花)";
  else if (savings < 50) coin_habit = "月光型 (及时行乐)";
  else coin_habit = "理财型 (收支平衡)";

  return {
    focus: focusScore,
    proactive: proactiveScore,
    stability: stabilityScore,
    income, expense, savings,
    summary, coin_habit
  };
}

function renderReport() {
  const op = state.operators[state.activeOpIndex];
  const stats = calculateWeeklyStats(op);

  // Suggestions Logic
  const suggestions = [];
  if (stats.focus < 50) suggestions.push('📚 建议增加趣味阅读比重，或陪同完成一次深度学习。');
  if (stats.proactive < 40) suggestions.push('🧹 可以尝试设立“家务挑战赛”，增加做家务的乐趣。');
  if (stats.stability < 40) suggestions.push('🧘 建议在孩子情绪激动时进行“冷静三分钟”游戏。');
  if (stats.savings > 500) suggestions.push('💰 存款较多，引导孩子设立一个“大梦想”兑换目标。');
  if (suggestions.length === 0) suggestions.push('🌟 表现完美！继续保持，建议给予口头表扬。');

  return `
    <div class="mission-header">
       <div class="status-dot"></div>
       <div class="section-title">本周行动简报 (WEEKLY REPORT)</div>
    </div>
    
    <div style="padding-bottom: 80px;">
      <!-- 1. Portrait Section -->
      <div class="res-label" style="margin-bottom: 10px; color: #42a5f5;">本周画像: ${op.code_name}</div>
      <div style="background: rgba(0,0,0,0.3); border: 1px solid #333; padding: 15px; margin-bottom: 20px;">
         <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <div style="flex: 1;">
               <div style="font-size: 10px; color: #aaa; margin-bottom: 5px;">专注行为 (${stats.focus}%)</div>
               <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden;"><div style="width: ${stats.focus}%; height: 100%; background: #42a5f5;"></div></div>
            </div>
            <div style="flex: 1;">
               <div style="font-size: 10px; color: #aaa; margin-bottom: 5px;">主动行为 (${stats.proactive}%)</div>
               <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden;"><div style="width: ${stats.proactive}%; height: 100%; background: #ffa726;"></div></div>
            </div>
            <div style="flex: 1;">
               <div style="font-size: 10px; color: #aaa; margin-bottom: 5px;">情绪稳定 (${stats.stability}%)</div>
               <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden;"><div style="width: ${stats.stability}%; height: 100%; background: #ef5350;"></div></div>
            </div>
         </div>
         <div style="font-size: 12px; line-height: 1.5; color: #fff; padding-top: 10px; border-top: 1px dashed #555;">
           <span style="color: #ffd700;">[指挥官评语]</span> ${stats.summary}
         </div>
      </div>

      <!-- 2. Coin Health -->
      <div class="res-label" style="margin-bottom: 10px; color: #ffd700;">哈夫币健康度 (FINANCE)</div>
      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
         <div style="flex: 1; background: rgba(76, 175, 80, 0.1); border: 1px solid #4caf50; padding: 10px; text-align: center;">
            <div style="font-size: 10px; color: #4caf50;">本周获得</div>
            <div style="font-size: 18px; font-weight: bold; color: #fff;">+${stats.income}</div>
         </div>
         <div style="flex: 1; background: rgba(239, 83, 80, 0.1); border: 1px solid #ef5350; padding: 10px; text-align: center;">
            <div style="font-size: 10px; color: #ef5350;">本周兑换</div>
            <div style="font-size: 18px; font-weight: bold; color: #fff;">-${stats.expense}</div>
         </div>
         <div style="flex: 1; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; padding: 10px; text-align: center;">
            <div style="font-size: 10px; color: #ffd700;">当前储存</div>
            <div style="font-size: 18px; font-weight: bold; color: #fff;">${stats.savings}</div>
         </div>
      </div>
      <div style="text-align: center; font-size: 12px; color: #aaa; margin-bottom: 20px;">
         消费习惯评价: <span style="color: #fff; font-weight: bold;">${stats.coin_habit}</span>
      </div>

      <!-- 3. Suggestion -->
      <div class="res-label" style="margin-bottom: 10px; color: #ab47bc;">行动建议 (ADVISE)</div>
      <div style="background: rgba(0,0,0,0.5); border-left: 3px solid #ab47bc; padding: 15px;">
         ${suggestions.map(s => `<div style="margin-bottom: 8px; font-size: 12px; color: #ddd;">${s}</div>`).join('')}
      </div>
    </div>
  `;
}

function render() {
  if (state.loading) {
    app.innerHTML = `<div style="height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-tech); color: var(--c-accent);">${t('loading')}</div>`;
    return;
  }

  if (state.activeNav === 'command') {
    renderCommandCenter();
    return;
  }

  if (state.activeNav === 'report') {
    app.innerHTML = renderReport() + renderNav('report');
    return;
  }

  const op = state.operators[state.activeOpIndex];

  let mainContent = '';
  if (state.activeNav === 'quests') {
    // Filter missions by age group (0=All, or match op.age_group)
    const visibleMissions = state.missions.filter(m => {
      if (!m.target_group) return true; // Legacy/Global
      return m.target_group === 0 || m.target_group === op.age_group;
    });

    mainContent = `
      <div class="mission-header" style="display: flex; justify-content: space-between; align-items: flex-end;">
         <div style="display: flex; align-items: center; gap: 10px;">
           <div class="status-dot"></div>
           <div class="section-title">${t('sectionTitle')} (Target: ${op.age_group || 'All'}yo)</div>
         </div>
         <div style="font-family: var(--font-tech); font-size: 10px; color: var(--c-accent); opacity: 0.7;">
          ${t('streak')}: 3 DAY | ${t('totalMissions')}: ${Object.values(state.progress).filter(v => v === 100).length}
         </div>
      </div>
      <div class="mission-list">
        ${visibleMissions.map((q, idx) => {
      const progress = state.progress[q.id] || 0;
      return `
            <div class="mission-card ${progress === 100 ? 'completed' : (progress > 0 ? 'active' : '')}" onclick="window.updateProgress('${q.id}')">
              
              <!-- STAMP OVERLAY -->
              ${progress === 100 ? '<div class="stamp-overlay">MISSION COMPLETE</div>' : ''}

              <div class="mission-top">
                <span class="mission-id" style="color:${CATEGORY_MAP[q.category]?.color || '#fff'}">${q.category} ${CATEGORY_MAP[q.category]?.attr || ''}</span>
                <span class="mission-reward">+${q.xp_reward} H</span>
              </div>
              <div class="mission-title">${q.title}</div>
              
              <!-- NEW XP BAR -->
              <div class="xp-bar-container">
                <div class="xp-bar-fill" style="width: ${progress}%"></div>
              </div>
              
              <div style="position: absolute; right: 15px; top: 50%; translate: 0 -50%; font-family: var(--font-tech); font-size: 10px; color: ${progress === 100 ? 'var(--c-accent)' : 'rgba(255,255,255,0.2)'}; z-index: 5;">
                ${progress === 100 ? '' : t('status.inProgress')}
              </div>
            </div>
          `
    }).join('')}
      </div>`;
  } else if (state.activeNav === 'rewards') {
    mainContent = renderRewards();
  } else if (state.activeNav === 'profile') {
    mainContent = renderProfile();
  }

  app.innerHTML = `
    <header class="header" style="background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%); border-bottom: 2px solid var(--c-accent); padding: 10px 15px; display: grid; grid-template-columns: 1fr auto; gap: 15px; align-items: center; box-shadow: 0 5px 20px rgba(0,0,0,0.8);">
      
      <!-- LEFT: OPERATOR IDENTITY (Dog Tag Style) -->
      <div class="operator-group" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 2px;">
        ${state.operators.map((c, i) => {
    const isActive = i === state.activeOpIndex;
    return `
          <div class="operator-tag ${isActive ? 'active' : ''}" onclick="window.switchChild(${i})" 
               style="position: relative; padding: 5px 15px; background: ${isActive ? 'var(--c-accent)' : 'rgba(255,255,255,0.05)'}; 
                      border: 1px solid ${isActive ? 'var(--c-accent)' : '#444'}; clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                      color: ${isActive ? '#000' : '#888'}; cursor: pointer; transition: all 0.2s; min-width: 100px;">
            
            <div style="font-family: var(--font-tech); font-size: 8px; opacity: 0.7; letter-spacing: 1px; margin-bottom: 2px;">
                ${isActive ? 'OPERATOR ACTIVE' : 'OFFLINE'}
            </div>
            <div style="display: flex; align-items: baseline; gap: 5px;">
                <span style="font-size: 16px; font-weight: 900; text-transform: uppercase; white-space: nowrap;">${c.code_name}</span>
                <span style="font-size: 10px; font-family: var(--font-tech); background: #000; color: var(--c-accent); padding: 0 4px; border-radius: 2px;">${c.security_rank}</span>
            </div>
          </div>
        `}).join('')}
      </div>

      <!-- RIGHT: TACTICAL HUD (Power & Wealth) -->
      <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
         
         <!-- POWER -->
         <div style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-right: 3px solid var(--c-accent);">
            <div style="text-align: right;">
                <div style="font-size: 8px; color: var(--c-accent); font-family: var(--font-tech); letter-spacing: 1px;">COMBAT POWER</div>
                <div style="font-size: 14px; font-weight: 900; color: #fff; line-height: 1;">${state.combatPower} <span style="font-size:10px; color:#ffd700;">⚡</span></div>
            </div>
         </div>

         <!-- FINANCE -->
         <div style="display: flex; align-items: center; gap: 8px; padding: 2px 8px;">
            <div style="text-align: right;">
                <div style="font-size: 12px; font-family: var(--font-tech); color: #ccc;">
                   ${op.tac_xp} <span style="font-size:10px; color:#888;">H</span>
                </div>
            </div>
         </div>

      </div>
    </header>

    <main class="mission-stage">
      ${mainContent}
    </main>

    <div id="help-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: #111; border: 1px solid var(--c-accent); padding: 20px; max-height: 80%; overflow-y: auto; color: #ddd; font-size: 12px; line-height: 1.6; max-width: 400px; width: 100%;">
        <h2 style="color: var(--c-accent); margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px;">📋 指挥官手册 (Guide)</h2>
        <p><strong>1. 分龄规则 (Age Rules)</strong><br>
        - Junior (8岁): 任务简单，每日限15币。<br>
        - Senior (12岁): 任务强度大，每日限18币。</p>
        <p><strong>2. 每日上限 (Daily Cap)</strong><br>
        为了防止刷分，日常任务有上限。但“做家务”等Bonus任务不设限，鼓励多劳多得。</p>
        <p><strong>3. 商店物品 (Shop)</strong><br>
        每周会有金色“限定物品”置顶，建议引导孩子积攒购买。</p>
        <p><strong>4. 成就徽章 (Badges)</strong><br>
        系统会自动记录连续打卡天数，达成条件自动解锁酷炫徽章！</p>
        <button onclick="window.toggleHelp()" style="width: 100%; background: var(--c-accent); color: #000; border: none; padding: 10px; font-weight: bold; margin-top: 15px;">CLOSE</button>
      </div>
    </div>

    ${renderNav(state.activeNav)}
  `
}

// --- RESTORED FUNCTIONS ---
window.switchChild = async (index) => {
  state.activeOpIndex = index;
  state.loading = true;
  render();
  await fetchUserData();
  state.loading = false;
  render();
}

window.switchNav = (nav) => {
  state.activeNav = nav;
  render();
}

window.saveProfile = async () => {
  const newName = document.querySelector('#edit-op-name').value;
  const newXP = parseInt(document.querySelector('#edit-op-xp').value);
  const op = state.operators[state.activeOpIndex];

  if (newName && !isNaN(newXP)) {
    const { error } = await supabase.from('operators').update({ code_name: newName, tac_xp: newXP }).eq('id', op.id);
    if (!error) {
      op.code_name = newName;
      op.tac_xp = newXP;
      alert('档案已保存 / SAVED');
      render();
    }
  }
}

window.handleDeploy = () => {
  const title = document.querySelector('#new-mission-title').value;
  const reward = parseInt(document.querySelector('#new-mission-reward').value);
  const category = document.querySelector('#new-mission-category').value;
  const isDaily = document.querySelector('#new-mission-daily')?.checked;
  const isWeekly = document.querySelector('#new-mission-weekly')?.checked;

  let recurrence = 'none';
  if (isDaily) recurrence = 'daily';
  if (isWeekly) recurrence = 'weekly';

  if (title && reward && category) {
    addMission(title, reward, recurrence, category);
  } else {
    alert('请完整填写指令信息 (MISSING INTEL)');
  }
}

async function addMission(title, reward, recurrence, category) {
  const p = { title, xp_reward: reward, recurrence, category };
  const { data, error } = await supabase.from('missions').insert([p]).select();
  if (error) {
    alert('DEPLOY ERROR: ' + error.message);
  } else {
    state.missions.push(data[0]);
    alert('指令已部署 / DEPLOYED');
    render();
  }
}

window.addReward = async () => {
  const title = document.querySelector('#new-reward-title').value;
  const cost = parseInt(document.querySelector('#new-reward-cost').value);
  const type = document.querySelector('#new-reward-type').value;
  const power = parseInt(document.querySelector('#new-reward-power').value) || 0;
  const slot = document.querySelector('#new-reward-slot').value;
  const isLimited = document.querySelector('#new-reward-limit').checked;

  const gear_slot = type === 'GEAR' ? slot : null;
  const power_value = type === 'GEAR' ? power : 0;

  if (title && cost) {
    const { data, error } = await supabase.from('rewards').insert([{ title, cost, type, gear_slot, power_value, is_limited: isLimited }]).select();
    if (data) {
      state.rewards.push(data[0]);
      render();
    } else {
      alert('ERROR: ' + error.message);
    }
  }
}

window.toggleSlotSelect = () => {
  const type = document.querySelector('#new-reward-type').value;
  const slotSelect = document.querySelector('#new-reward-slot');
  const powerInput = document.querySelector('#new-reward-power');

  if (type === 'GEAR') {
    slotSelect.style.display = 'block';
    powerInput.style.display = 'block';
  } else {
    slotSelect.style.display = 'none';
    powerInput.style.display = 'none';
  }
}

window.recycleItem = async (purchaseId, originalCost) => {
  if (confirm(t('confirmRecycle'))) {
    const refund = Math.floor(originalCost * 0.8);
    const op = state.operators[state.activeOpIndex];

    // Need precise ID. Since we are passing purchaseId from the render loop now (if implemented correctly), we can just delete.
    // Wait, earlier I passed `pid` (which IS purchase ID). So check `renderCommandCenter` passed pid.
    // Yes, state.purchases stores purchase IDs? No, wait. 
    // In `fetchUserData` (restored version needed check), `state.purchases` was list of RewardIDs or PurchaseIDs?
    // Looking at `renderRewards`, `state.purchases.includes(r.id)` implies it stores RewardIDs.
    // This IS A BUG. If `state.purchases` stores RewardIDs, we can't delete specific purchase instances easily without query.
    // Let's stick to the query-and-delete logic I wrote in the previous 'redundant' block.

    const { data: pData } = await supabase.from('purchases').select('id').eq('operator_id', op.id).eq('reward_id', purchaseId).limit(1);

    if (pData && pData.length > 0) {
      await supabase.from('purchases').delete().eq('id', pData[0].id);
      await supabase.from('operators').update({ tac_xp: op.tac_xp + refund }).eq('id', op.id);

      op.tac_xp += refund;
      // Remove ONE instance of this reward ID from local state
      const idx = state.purchases.indexOf(purchaseId);
      if (idx > -1) state.purchases.splice(idx, 1);

      // Re-calc power
      await fetchUserData();

      alert(`RECYCLED: +${refund} H-Coin`);
      render();
    } else {
      alert('System Error: Item not found');
    }
  }
}

window.deleteMission = async (id) => {
  if (confirm('确认撤销此指令吗？/ Confirm Delete?')) {
    await supabase.from('missions').delete().eq('id', id);
    state.missions = state.missions.filter(m => m.id !== id);
    render();
  }
}


window.toggleHelp = () => {
  if (audioManager.playOpenHelp) audioManager.playOpenHelp();
  const el = document.getElementById('help-modal');
  if (el) el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
}

window.updateProgress = updateProgress;
window.purchaseReward = purchaseReward;

initData();
