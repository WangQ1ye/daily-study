const copyText = async (val) => {
  try {
    // 使用现代 API 尝试复制
    if (navigator.clipboard && navigator.permissions) {
      await navigator.clipboard.writeText(val);
      return; // 如果成功，直接返回
    }

    // 降级方案
    const textArea = document.createElement('textArea') as HTMLTextAreaElement;
    textArea.value = val;
    textArea.style.width = '0px';
    textArea.style.position = 'fixed';
    textArea.style.left = '-999px';
    textArea.style.top = '10px';
    textArea.setAttribute('readonly', 'readonly');
    document.body.appendChild(textArea);
    textArea.select();

    // 尝试执行复制操作
    const success = document.execCommand('copy');
    if (!success) {
      throw new Error('无法复制文本');
    }

    // 清理
    document.body.removeChild(textArea);
  } catch (err) {
    console.error('复制失败:', err);
  }
};
