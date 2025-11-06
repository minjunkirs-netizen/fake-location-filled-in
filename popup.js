// 当前生成的地址数据
let currentAddress = null;

// DOM元素
const countrySelect = document.getElementById('country-select');
const generateBtn = document.getElementById('generate-btn');
const fillBtn = document.getElementById('fill-btn');
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const addressDisplay = document.getElementById('address-display');
const progressMessage = document.getElementById('progress-message');

// 地址显示元素
const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const postalEl = document.getElementById('postal');
const stateEl = document.getElementById('state');
const cityEl = document.getElementById('city');
const addressEl = document.getElementById('address');

// 历史记录元素
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historyToggleIcon = document.getElementById('history-toggle-icon');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyCount = document.getElementById('history-count');
const clearHistoryBtn = document.getElementById('clear-history-btn');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isReceivingEndError(error) {
  return error?.message?.includes('Receiving end does not exist');
}

function isUnsupportedUrl(url = '') {
  const lower = (url || '').toLowerCase();
  return lower.startsWith('chrome://') ||
         lower.startsWith('edge://') ||
         lower.startsWith('about:') ||
         lower.startsWith('https://chrome.google.com/webstore') ||
         lower.startsWith('https://microsoftedge.microsoft.com/addons');
}

// 工具函数：Promise封装tabs.query
function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(tabs[0]);
      }
    });
  });
}

// 工具函数：Promise封装tabs.sendMessage
function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, response => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// 确保content script已注入
async function ensureContentScript(tab) {
  if (!tab?.id) {
    throw new Error('未找到可用的标签页');
  }

  if (isUnsupportedUrl(tab.url)) {
    throw new Error('当前页面不允许注入脚本，请切换到普通网页后再试');
  }

  if (await isContentScriptReady(tab.id)) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (injectError) {
    if (injectError.message && injectError.message.includes('Cannot access contents of url')) {
      throw new Error('当前页面不允许注入脚本，请切换到普通网页后再试');
    }
    throw injectError;
  }

  await waitForContentScript(tab.id);
}

async function isContentScriptReady(tabId) {
  try {
    await sendMessageToTab(tabId, { action: 'ping' });
    return true;
  } catch (error) {
    if (isReceivingEndError(error)) {
      return false;
    }
    throw error;
  }
}

async function waitForContentScript(tabId, retries = 5) {
  for (let attempt = 0; attempt < retries; attempt++) {
    await delay(100 * (attempt + 1));
    if (await isContentScriptReady(tabId)) {
      return;
    }
  }

  throw new Error('无法与页面建立通信，请刷新页面后重试');
}

// 初始化
init();

function init() {
  chrome.storage.local.get(['lastCountry', 'currentAddress'], (result) => {
    if (result.lastCountry) {
      countrySelect.value = result.lastCountry;
    }
    if (result.currentAddress) {
      currentAddress = result.currentAddress;
      displayAddress(currentAddress);
    }
  });

  loadHistory();
}

// 生成地址
generateBtn.addEventListener('click', async () => {
  const country = countrySelect.value;
  chrome.storage.local.set({ lastCountry: country });
  await generateAddress(country);
});

// 使用API生成地址
async function generateAddress(country) {
  generateBtn.classList.add('loading');
  generateBtn.textContent = '生成中...';
  showProgress('正在查找真实地址...');

  try {
    currentAddress = await generateAddressFromAPI(country, (message) => {
      showProgress(message);
    });

    hideProgress();
    displayAddress(currentAddress);
    chrome.storage.local.set({ currentAddress });

    generateBtn.classList.remove('loading');
    generateBtn.textContent = '生成随机地址';
  } catch (error) {
    console.error('API生成失败:', error);
    hideProgress();
    showProgress('地址生成失败，请重试', 'error');

    generateBtn.classList.remove('loading');
    generateBtn.textContent = '生成随机地址';
  }
}

// 显示地址
function displayAddress(address) {
  nameEl.textContent = address.name;

  if (emailEl) {
    emailEl.textContent = address.email || '';
  }

  const phoneDisplay = address.phoneWithCountryCode || address.phone;
  phoneEl.textContent = phoneDisplay;
  postalEl.textContent = address.postal;
  stateEl.textContent = address.state;
  cityEl.textContent = address.city;
  addressEl.textContent = address.address;

  addressDisplay.style.display = 'block';
}

// 进度提示
function showProgress(message, type = 'info') {
  progressMessage.textContent = message;
  progressMessage.style.display = 'block';

  if (type === 'error') {
    progressMessage.style.background = '#fee2e2';
    progressMessage.style.borderColor = '#ef4444';
    progressMessage.style.color = '#dc2626';
  } else {
    progressMessage.style.background = '#eff6ff';
    progressMessage.style.borderColor = '#3b82f6';
    progressMessage.style.color = '#1e40af';
  }
}

function hideProgress() {
  progressMessage.style.display = 'none';
}

// 填充到页面
fillBtn.addEventListener('click', async () => {
  if (!currentAddress) {
    alert('请先生成地址！');
    return;
  }

  fillBtn.classList.add('loading');
  fillBtn.textContent = '填充中...';

  try {
    const tab = await getActiveTab();
    await ensureContentScript(tab);
    await sendMessageToTab(tab.id, {
      action: 'fillAddress',
      address: currentAddress
    });

    fillBtn.classList.remove('loading');
    fillBtn.textContent = '✓ 填充成功';
    setTimeout(() => {
      fillBtn.textContent = '填充到当前页面';
    }, 2000);
  } catch (error) {
    console.error('填充失败:', error);
    fillBtn.classList.remove('loading');
    if (error.message.includes('当前页面不允许注入脚本')) {
      fillBtn.textContent = '该页面不支持填充';
    } else if (error.message.includes('无法与页面建立通信')) {
      fillBtn.textContent = '请刷新页面后重试';
    } else {
      fillBtn.textContent = '填充失败，请重试';
    }
    setTimeout(() => {
      fillBtn.textContent = '填充到当前页面';
    }, 2000);
  }
});

// 复制地址
copyBtn.addEventListener('click', () => {
  if (!currentAddress) {
    alert('请先生成地址！');
    return;
  }

  const parts = [];
  parts.push('姓名：' + currentAddress.name);
  if (currentAddress.firstName && currentAddress.lastName) {
    parts.push('(First: ' + currentAddress.firstName + ', Last: ' + currentAddress.lastName + ')');
  }
  if (currentAddress.email) {
    parts.push('Email：' + currentAddress.email);
  }
  parts.push('电话：' + (currentAddress.phoneWithCountryCode || currentAddress.phone));
  parts.push('邮编：' + currentAddress.postal);
  parts.push('省/州：' + currentAddress.state);
  parts.push('城市：' + currentAddress.city);
  parts.push('详细地址：' + currentAddress.address);
  parts.push('国家：' + currentAddress.countryName);

  const addressText = parts.join('\n');

  navigator.clipboard.writeText(addressText).then(() => {
    copyBtn.textContent = '✓ 已复制';
    setTimeout(() => {
      copyBtn.textContent = '复制地址';
    }, 2000);
  }).catch(err => {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  });
});

// 保存到历史
saveBtn.addEventListener('click', () => {
  if (!currentAddress) {
    alert('请先生成地址！');
    return;
  }

  saveToHistory(currentAddress);
  saveBtn.textContent = '✓ 已保存';
  setTimeout(() => {
    saveBtn.textContent = '保存到历史';
  }, 2000);
});

// 历史记录管理
function saveToHistory(address) {
  chrome.storage.local.get(['addressHistory'], (result) => {
    let history = result.addressHistory || [];
    const historyItem = { ...address, savedAt: Date.now() };
    history.unshift(historyItem);
    if (history.length > 20) history = history.slice(0, 20);
    chrome.storage.local.set({ addressHistory: history }, () => loadHistory());
  });
}

function loadHistory() {
  chrome.storage.local.get(['addressHistory'], (result) => {
    const history = result.addressHistory || [];
    historyCount.textContent = history.length;

    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-message">暂无保存的地址</p>';
      return;
    }

    historyList.innerHTML = '';
    history.forEach((item, index) => {
      historyList.appendChild(createHistoryItem(item, index));
    });
  });
}

function createHistoryItem(item, index) {
  const div = document.createElement('div');
  div.className = 'history-item';

  const date = new Date(item.savedAt);
  const dateStr = (date.getMonth() + 1) + '/' + date.getDate() + ' ' +
                  date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');

  const emailOrPhone = item.email || item.phone || '';
  const location = item.city + ', ' + item.state;

  div.innerHTML = `
    <div class="history-item-header">
      <span class="history-item-name">${item.name}</span>
      <span class="history-item-date">${dateStr}</span>
    </div>
    <div class="history-item-content">
      ${emailOrPhone} | ${location}
    </div>
    <div class="history-item-actions">
      <button class="btn-small btn-use">使用</button>
      <button class="btn-small btn-delete">删除</button>
    </div>
  `;

  div.querySelector('.btn-use').addEventListener('click', () => {
    currentAddress = item;
    displayAddress(currentAddress);
    chrome.storage.local.set({ currentAddress });
  });

  div.querySelector('.btn-delete').addEventListener('click', () => {
    chrome.storage.local.get(['addressHistory'], (result) => {
      let history = result.addressHistory || [];
      history.splice(index, 1);
      chrome.storage.local.set({ addressHistory: history }, () => loadHistory());
    });
  });

  return div;
}

// 切换历史面板
toggleHistoryBtn.addEventListener('click', () => {
  const isExpanded = historyPanel.style.display === 'block';
  historyPanel.style.display = isExpanded ? 'none' : 'block';
  historyToggleIcon.classList.toggle('expanded', !isExpanded);
});

// 清空历史
clearHistoryBtn.addEventListener('click', () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    chrome.storage.local.set({ addressHistory: [] }, () => loadHistory());
  }
});
