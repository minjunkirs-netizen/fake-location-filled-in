// Content Script - 在网页中运行，负责智能填充表单

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ ready: true });
    return;
  }

  if (request.action === 'fillAddress') {
    fillAddressFields(request.address)
      .then(filled => {
        sendResponse({ success: true, filled });
      })
      .catch(error => {
        console.error('填充流程失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// 字段匹配规则（更精确的识别）
const fieldPatterns = {
  // 姓名字段（分开）
  firstName: {
    keywords: ['firstname', 'first-name', 'first_name', 'fname', 'givenname', 'given-name', 'forename', '名', 'given', 'prenom'],
    priority: 100
  },
  lastName: {
    keywords: ['lastname', 'last-name', 'last_name', 'lname', 'surname', 'family-name', 'familyname', '姓', 'family', 'nom'],
    priority: 100
  },
  fullName: {
    keywords: ['fullname', 'full-name', 'full_name', 'name', 'username', 'user-name', 'recipient', '姓名', '收货人', '联系人', 'consignee', 'contact-name'],
    priority: 50,
    exclude: ['firstname', 'lastname', 'first', 'last', 'company', 'business']
  },

  // Email字段（高优先级，避免误识别）
  email: {
    keywords: ['email', 'e-mail', 'mail', 'correo', 'courrier', 'メール'],
    priority: 200,
    exclude: ['name', 'address', 'street', 'city']
  },

  // 电话字段
  phone: {
    keywords: ['phone', 'tel', 'mobile', 'cellphone', 'cell-phone', 'telephone', '电话', '手机', '联系电话', '手机号', 'telefono', 'telefon'],
    priority: 90,
    exclude: ['country', 'code', 'prefix']
  },

  // 国家代码/区号字段
  countryCode: {
    keywords: ['country-code', 'countrycode', 'calling-code', 'callingcode', 'phone-code', 'phonecode', 'dial-code', 'dialcode', 'prefix', 'country-prefix', '国家代码', '区号', 'indicatif'],
    priority: 95
  },

  // 邮编字段
  postal: {
    keywords: ['postal', 'zip', 'zipcode', 'zip-code', 'postcode', 'post-code', '邮编', '邮政编码', 'plz', 'cep'],
    priority: 80
  },

  // 省/州字段
  state: {
    keywords: ['state', 'province', 'region', 'county', '省', '省份', '州', '地区', 'estado', 'provincia', 'bundesland'],
    priority: 85,
    exclude: ['country']
  },

  // 城市字段
  city: {
    keywords: ['city', 'town', '城市', '市', 'ville', 'ciudad', 'stadt'],
    priority: 85,
    exclude: ['country', 'state', 'province']
  },

  // 地址字段
  address: {
    keywords: ['address', 'street', 'addr', 'address1', 'address-1', 'street-address', 'detail', '地址', '详细地址', '街道地址', '收货地址', 'ligne1', 'direccion', 'strasse'],
    priority: 70,
    exclude: ['email', 'address2', 'city', 'state', 'country', 'postal', 'zip']
  },

  // 地址第2行
  address2: {
    keywords: ['address2', 'address-2', 'address_2', 'apartment', 'apt', 'suite', 'unit', 'floor', '公寓', '单元', 'ligne2'],
    priority: 70
  },

  // 国家字段
  country: {
    keywords: ['country', 'nation', '国家', 'pays', 'pais', 'land'],
    priority: 90,
    exclude: ['code', 'phone', 'calling']
  }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 填充地址字段
async function fillAddressFields(address) {
  console.log('开始填充地址:', address);

  // 获取页面中所有的输入框、文本域和下拉框
  const inputs = document.querySelectorAll('input, textarea, select');
  let filledCount = 0;

  // 用于跟踪已填充的字段类型
  const filledTypes = new Set();
  const pendingStateSelects = [];

  const addPendingStateSelect = (input, value, fieldType, addressData) => {
    if (!input) return;

    const existing = pendingStateSelects.find(item => item.input === input);
    if (existing) {
      existing.value = value;
      existing.addressData = addressData;
      existing.recordFill = recordFill;
      return;
    }

    const pending = {
      input,
      value,
      fieldType,
      addressData,
      recordFill
    };

    pending.onFilled = () => {
      const index = pendingStateSelects.indexOf(pending);
      if (index !== -1) {
        pendingStateSelects.splice(index, 1);
      }
    };

    pending.onRemoved = pending.onFilled;

    pendingStateSelects.push(pending);
  };

  const recordFill = (fieldType, input, value) => {
    if (!document.contains(input)) {
      return;
    }
    filledCount++;
    filledTypes.add(fieldType);
    highlightField(input);
    console.log(`已填充 ${fieldType}:`, value);
  };

  // 按优先级排序字段
  const sortedInputs = Array.from(inputs).map(input => ({
    element: input,
    matches: findBestMatch(input)
  })).sort((a, b) => (b.matches?.priority || 0) - (a.matches?.priority || 0));

  // 填充字段
  for (const { element: input, matches } of sortedInputs) {
    // 跳过隐藏、只读和已禁用字段
    if (input.type === 'hidden' || input.readOnly || input.disabled) {
      continue;
    }

    // 跳过已经有值的字段（可选，根据需求调整）
    // if (input.value && input.value.trim()) {
    //   return;
    // }

    if (!matches) continue;

    const { fieldType, priority } = matches;

    // 如果同类型字段已填充，且不是特殊类型，则跳过
    if (filledTypes.has(fieldType) && !['address', 'address2'].includes(fieldType)) {
      continue;
    }

    let value = null;

    // 根据字段类型获取对应的值
    switch (fieldType) {
      case 'firstName':
        value = address.firstName;
        break;
      case 'lastName':
        value = address.lastName;
        break;
      case 'fullName':
        // 如果已经填充了firstName或lastName，跳过fullName
        if (filledTypes.has('firstName') || filledTypes.has('lastName')) {
          return;
        }
        value = address.name;
        break;
      case 'email':
        value = address.email;
        break;
      case 'phone':
        value = address.phone;
        break;
      case 'countryCode':
        // 根据字段类型决定填充格式
        if (input.tagName === 'SELECT') {
          value = address.callingCode; // 下拉框用纯数字
        } else {
          value = address.countryCode; // 输入框用+86格式
        }
        break;
      case 'postal':
        value = address.postal || address.zipCode;
        break;
      case 'state':
        value = address.state;
        break;
      case 'city':
        value = address.city;
        break;
      case 'address':
        value = address.address || address.address1;
        break;
      case 'address2':
        value = address.address2 || '';
        break;
      case 'country':
        value = address.country; // 国家代码，用于下拉框匹配
        break;
    }

    if (value !== null && value !== undefined) {
      const success = fillField(input, value, fieldType, address);
      if (success) {
        recordFill(fieldType, input, value);
        if (fieldType === 'country' && pendingStateSelects.length) {
          // 立即尝试填充已等待的省份下拉框
          await tryFillPendingStateSelects(pendingStateSelects, address, recordFill);
        }
      } else if (fieldType === 'state' && input.tagName === 'SELECT') {
        addPendingStateSelect(input, value, fieldType, address);
      }
    }
  }

  if (pendingStateSelects.length && filledTypes.has('country')) {
    await tryFillPendingStateSelects(pendingStateSelects, address, recordFill);
  }

  // 显示填充成功提示
  showNotification(`已成功填充 ${filledCount} 个字段！`);

  return filledCount;
}

async function tryFillPendingStateSelects(pendingSelects, addressData, recordFill) {
  const maxAttempts = 8;

  const cleanupPending = pending => {
    if (!pending) return;
    if (pending.observer) {
      pending.observer.disconnect();
      pending.observer = null;
    }
    if (pending.changeHandler && pending.input) {
      pending.input.removeEventListener('change', pending.changeHandler);
      pending.input.removeEventListener('input', pending.changeHandler);
      pending.changeHandler = null;
    }
    if (pending.input) {
      delete pending.input.dataset.addressFillStateObserver;
    }
  };

  const attemptFill = pending => {
    if (!pending || !pending.input) return true;

    const select = pending.input;
    if (!document.contains(select)) {
      cleanupPending(pending);
      pending.onRemoved?.(pending);
      return true;
    }

    const fillHandler = pending.recordFill || recordFill;
    const dataForFill = pending.addressData || addressData;
    const success = fillField(select, pending.value, pending.fieldType, dataForFill);

    if (success) {
      if (typeof fillHandler === 'function') {
        fillHandler(pending.fieldType, select, pending.value);
      }
      cleanupPending(pending);
      pending.onFilled?.(pending);
      return true;
    }

    return false;
  };

  const ensureObserver = pending => {
    if (!pending || !pending.input) return;
    if (pending.observer) return;
    const select = pending.input;

    if (!document.contains(select)) {
      pending.onRemoved?.(pending);
      return;
    }

    const observer = new MutationObserver(() => {
      const filled = attemptFill(pending);
      if (filled && observer) {
        // 清理在 attemptFill 中已经完成
      }
    });

    observer.observe(select, { childList: true, subtree: true });
    pending.observer = observer;
    select.dataset.addressFillStateObserver = 'true';

    const changeHandler = () => {
      attemptFill(pending);
    };

    select.addEventListener('change', changeHandler);
    select.addEventListener('input', changeHandler);
    pending.changeHandler = changeHandler;

    // 初次尝试填充
    attemptFill(pending);
  };

  // 确保所有待处理下拉框都有监听器
  for (const pending of pendingSelects) {
    if (!pending.addressData && addressData) {
      pending.addressData = addressData;
    }
    if (!pending.recordFill && recordFill) {
      pending.recordFill = recordFill;
    }
    ensureObserver(pending);
  }

  for (let attempt = 0; attempt < maxAttempts && pendingSelects.length; attempt++) {
    const waitTime = attempt === 0 ? 250 : 400 + attempt * 350;
    await delay(waitTime);

    for (let i = pendingSelects.length - 1; i >= 0; i--) {
      const pending = pendingSelects[i];

      const filled = attemptFill(pending);
      if (filled) {
        if (pendingSelects[i] === pending) {
          pendingSelects.splice(i, 1);
        }
      }
    }
  }
}

// 找到最佳匹配的字段类型
function findBestMatch(input) {
  const fieldInfo = getFieldInfo(input).toLowerCase();
  let bestMatch = null;
  let highestPriority = 0;

  for (const [fieldType, pattern] of Object.entries(fieldPatterns)) {
    // 检查是否匹配关键词
    const matched = pattern.keywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      return fieldInfo.includes(keywordLower);
    });

    if (!matched) continue;

    // 检查排除词
    if (pattern.exclude) {
      const excluded = pattern.exclude.some(excludeWord => {
        return fieldInfo.includes(excludeWord.toLowerCase());
      });
      if (excluded) continue;
    }

    // 更新最佳匹配
    if (pattern.priority > highestPriority) {
      highestPriority = pattern.priority;
      bestMatch = { fieldType, priority: pattern.priority };
    }
  }

  return bestMatch;
}

// 获取字段的识别信息
function getFieldInfo(input) {
  const info = [
    input.name || '',
    input.id || '',
    input.className || '',
    input.placeholder || '',
    input.getAttribute('aria-label') || '',
    input.getAttribute('data-name') || '',
    input.getAttribute('autocomplete') || '',
    input.getAttribute('type') || '',
    // 查找相关的label
    findLabelText(input)
  ].join(' ');

  return info;
}

// 查找输入框关联的label文本
function findLabelText(input) {
  // 通过for属性查找
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent;
  }

  // 查找父级label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent;

  // 查找前一个兄弟元素中的label
  let prev = input.previousElementSibling;
  if (prev && prev.tagName === 'LABEL') {
    return prev.textContent;
  }

  return '';
}

// 填充字段
function fillField(input, value, fieldType, addressData) {
  try {
    if (input.tagName === 'SELECT') {
      return fillSelectField(input, value, fieldType, addressData);
    } else {
      return fillInputField(input, value);
    }
  } catch (error) {
    console.error('填充字段失败:', error);
    return false;
  }
}

// 填充输入框
function fillInputField(input, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set;

  if (input.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
    nativeTextAreaValueSetter.call(input, value);
  } else if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }

  // 触发各种事件以确保网页的JavaScript能检测到变化
  const events = ['input', 'change', 'blur', 'keyup', 'keydown'];
  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    input.dispatchEvent(event);
  });

  // 对于React等框架，额外触发
  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    composed: true
  });
  input.dispatchEvent(inputEvent);

  return true;
}

// 填充下拉选择框
function fillSelectField(select, value, fieldType, addressData) {
  // 对于国家字段，尝试多种匹配方式
  if (fieldType === 'country') {
    return fillCountrySelect(select, value, addressData);
  }

  // 对于国家代码字段
  if (fieldType === 'countryCode') {
    return fillCountryCodeSelect(select, value, addressData);
  }

  // 对于省/州字段
  if (fieldType === 'state') {
    return fillStateSelect(select, value);
  }

  // 通用下拉框填充
  return fillGenericSelect(select, value);
}

// 填充国家下拉框
function fillCountrySelect(select, countryCode, addressData) {
  const countryName = addressData.countryName;

  // 尝试多种匹配方式
  for (let option of select.options) {
    const optionValue = option.value.toUpperCase();
    const optionText = option.text.toUpperCase();

    // 匹配国家代码
    if (optionValue === countryCode || optionValue === countryCode.toUpperCase()) {
      select.value = option.value;
      triggerSelectChange(select);
      return true;
    }

    // 匹配国家名称
    if (countryName && (optionText.includes(countryName.toUpperCase()) || optionValue.includes(countryName.toUpperCase()))) {
      select.value = option.value;
      triggerSelectChange(select);
      return true;
    }
  }

  return false;
}

// 填充国家代码下拉框
function fillCountryCodeSelect(select, value, addressData) {
  const countryCode = addressData.countryCode; // +86
  const callingCode = addressData.callingCode; // 86

  for (let option of select.options) {
    const optionValue = option.value;
    const optionText = option.text;

    // 匹配 +86, 86, +86 China 等格式
    if (optionValue === countryCode ||
        optionValue === callingCode ||
        optionValue === `+${callingCode}` ||
        optionText.includes(countryCode) ||
        optionText.includes(`+${callingCode}`)) {
      select.value = option.value;
      triggerSelectChange(select);
      return true;
    }
  }

  return false;
}

// 填充省/州下拉框
function fillStateSelect(select, stateValue) {
  return fillGenericSelect(select, stateValue);
}

// 通用下拉框填充
function fillGenericSelect(select, value) {
  if (value === null || value === undefined) return false;

  const target = String(value).trim();
  if (!target) return false;

  const targetLower = target.toLowerCase();

  // 尝试直接匹配值
  for (let option of select.options) {
    const optionValue = option.value.trim();
    const optionText = option.text.trim();

    if (!optionValue && !optionText) continue;

    if (optionValue.toLowerCase() === targetLower || optionText.toLowerCase() === targetLower) {
      select.value = option.value;
      triggerSelectChange(select);
      return true;
    }
  }

  // 尝试部分匹配
  for (let option of select.options) {
    const optionValue = option.value.trim();
    const optionText = option.text.trim();
    const optionValueLower = optionValue.toLowerCase();
    const optionTextLower = optionText.toLowerCase();

    if (!optionValueLower && !optionTextLower) continue;

    if (
      optionValueLower.includes(targetLower) ||
      optionTextLower.includes(targetLower) ||
      targetLower.includes(optionValueLower) ||
      targetLower.includes(optionTextLower)
    ) {
      select.value = option.value;
      triggerSelectChange(select);
      return true;
    }
  }

  return false;
}

// 触发下拉框变化事件
function triggerSelectChange(select) {
  const events = ['change', 'input', 'blur'];
  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    select.dispatchEvent(event);
  });
}

// 高亮显示已填充的字段
function highlightField(input) {
  const originalBorder = input.style.border;
  const originalBackground = input.style.background;

  input.style.border = '2px solid #10b981';
  input.style.background = '#d1fae5';

  setTimeout(() => {
    input.style.border = originalBorder;
    input.style.background = originalBackground;
  }, 2000);
}

// 显示通知
function showNotification(message) {
  // 移除旧通知
  const oldNotification = document.getElementById('address-fill-notification');
  if (oldNotification) {
    oldNotification.remove();
  }

  // 创建通知元素
  const notification = document.createElement('div');
  notification.id = 'address-fill-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;

  // 添加动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;

  if (!document.getElementById('address-fill-notification-style')) {
    style.id = 'address-fill-notification-style';
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // 3秒后移除
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// 监听页面加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('智能地址填充助手已加载');
  });
} else {
  console.log('智能地址填充助手已加载');
}
